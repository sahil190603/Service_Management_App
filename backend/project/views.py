from datetime import timedelta
from django.utils.timezone import now
from django.db.models import Q  
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import Project
from tasks.models import Task 
from .serializers import ProjectSerializer
from django.utils import timezone
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_GET
from openpyxl import Workbook
from django.db.models import Count
from datetime import timedelta, datetime

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    @action(detail=False, methods=['get'], url_path='fetch-null-status')
    def fetch_null_status(self, request, *args, **kwargs):
        today = now().date()
        yesterday = today - timedelta(days=1)
        tomorrow = today + timedelta(days=1)

        filters = Q(status="null") & Q(start_date__gte=yesterday) & Q(start_date__lt=tomorrow)

        Project.objects.filter(filters).update(status="Started")

        queryset = self.queryset.filter(filters) 
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            'message': 'Fetched projects and updated status to "Started".',
            'projects': serializer.data
        }, status=status.HTTP_200_OK)

    def get_queryset(self):
        """
        Customizes the queryset to filter by timingFilter if provided.
        """
        queryset = super().get_queryset()
        timing_filter = self.request.query_params.get('timingFilter')
    
        if timing_filter:
            start_date, end_date = get_date_range(timing_filter)
            
            # If timing filter is "All", return all records
            if timing_filter == "All":
                return queryset.all()  # This returns all records without filtering
            
            # Filter the queryset based on the date range for other timing filters
            queryset = queryset.filter(start_date__range=[start_date, end_date])
    
        return queryset
    

@require_GET  
def update_project_status(request):
    current_datetime = timezone.now()
    
    projects_to_update = Project.objects.filter(end_date__lte=current_datetime, status__in=['Started', 'InProgress'])

    for project in projects_to_update:
        linked_tasks = Task.objects.filter(project=project)
        
        if not linked_tasks.exists():
            project.status = 'Finished'
            project.save()

    return JsonResponse({"message": "Project statuses updated successfully"}, status=200)


def export_projects_to_excel(request):
    status = request.GET.get('status')

    if status:
        projects = Project.objects.filter(status=status)
    else:
        projects = Project.objects.all()

    if not projects.exists():
        return JsonResponse({"error": "No projects found for the specified criteria."}, status=404)

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Projects"

    headers = [
        "ID", "Name", "Description", "Start Date", "End Date",
        "Created By", "Created At", "Updated At", "Status"
    ]
    sheet.append(headers)

    for project in projects:
        row = [
            project.id,
            project.name,
            project.description,
            project.start_date.astimezone(timezone.get_current_timezone()).replace(tzinfo=None), 
            project.end_date.astimezone(timezone.get_current_timezone()).replace(tzinfo=None),   
          f"{project.created_by.first_name} {project.created_by.last_name}" if project.created_by else None,
            project.created_at.astimezone(timezone.get_current_timezone()).replace(tzinfo=None),  
            project.updated_at.astimezone(timezone.get_current_timezone()).replace(tzinfo=None), 
            project.status,
        ]
        sheet.append(row)

    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    workbook.save(response)
    response['Content-Disposition'] = 'attachment; filename="projects.xlsx"'
    
    return response

def get_Projects_without_complete_stataus(request):

    projects = Project.objects.exclude( status='Finished')

    project_list = [{
           "id": project.id,
            "name": project.name,
    } for project in projects]

    return JsonResponse(project_list, safe=False)


def get_date_range(timing_filter):
    """
    Returns the start and end dates based on the given timing filter.

    Args:
        timing_filter (str): The filter option for time (e.g., Today, ThisWeek).

    Returns:
        tuple: A tuple containing (start_date, end_date).
    """
    now = timezone.now()
    start_date, end_date = None, None

    if timing_filter == "Today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif timing_filter == "ThisWeek":
        start_date = now - timedelta(days=now.weekday())  # Start of the week
        end_date = now + timedelta(days=(6 - now.weekday()), hours=23, minutes=59, seconds=59)
    elif timing_filter == "ThisMonth":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = (start_date + timedelta(days=31)).replace(day=1) - timedelta(seconds=1)  # End of the month
    elif timing_filter == "ThisYear":
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(month=12, day=31, hour=23, minute=59, second=59, microsecond=999999)

    return start_date, end_date


def project_status_summary(request):
    timing_filter = request.GET.get('timingFilter')
    
    start_date, end_date = get_date_range(timing_filter)

    projects = Project.objects.all()
    if start_date and end_date:
        projects = projects.filter(start_date__gte=start_date, start_date__lte=end_date)

    project_status_counts = projects.values('status').annotate(count=Count('status'))
    total_projects = projects.count()

    data = {
        "labels": [entry['status'] for entry in project_status_counts],
        "counts": [entry['count'] for entry in project_status_counts],
        "ratios": [
            round((entry['count'] / total_projects) * 100, 2) if total_projects > 0 else 0 
            for entry in project_status_counts
        ]
    }

    return JsonResponse(data)


def project_time_summary(request):
    status = request.GET.get('status')
    timing_filter = request.GET.get('timingFilter')

    start_date, end_date = get_date_range(timing_filter)

    projects = Project.objects.all()
    if status:
        projects = projects.filter(status=status)
    if start_date and end_date:
        projects = projects.filter(start_date__gte=start_date, start_date__lte=end_date)

    project_data = []
    for project in projects:
        if project.end_date and project.start_date:
            allocated_time = (project.end_date - project.start_date).total_seconds() / 86400
        else:
            allocated_time = 0

        time_taken = project.time_taken.total_seconds() / 86400 if project.time_taken else 0

        project_data.append({
            'name': project.name,
            'allocated_time': round(allocated_time, 2), 
            'time_taken': round(time_taken, 2) 
        })

    return JsonResponse({
        'labels': [project['name'] for project in project_data],
        'allocated_time': [project['allocated_time'] for project in project_data],
        'time_taken': [project['time_taken'] for project in project_data]
    })


@require_GET
def Line_plot_data(request):
    timing_filter = request.GET.get('timingFilter')
    start_date, end_date = get_date_range(timing_filter)

    projects = Project.objects.all()
    if start_date and end_date:
        projects = projects.filter(start_date__gte=start_date, start_date__lte=end_date)

    line_data = {
        'labels': [],
        'datasets': [
            {
                'label': 'Project Creation Dates',
                'data': []
            },
            {
                'label': 'Project Start Dates',
                'data': []
            }
        ]
    }

    for project in projects:
        line_data['labels'].append(project.name)
        line_data['datasets'][0]['data'].append({
            'x': project.created_at.timestamp(),
            'y': project.name
        })
        line_data['datasets'][1]['data'].append({
            'x': project.start_date.timestamp(),
            'y': project.name
        })

    line_data['datasets'][0]['data'].sort(key=lambda point: point['x'])
    line_data['datasets'][1]['data'].sort(key=lambda point: point['x'])

    return JsonResponse(line_data)


def project_completion_status_summary(request):
    timing_filter = request.GET.get('timingFilter')
    start_date, end_date = get_date_range(timing_filter)

    projects = Project.objects.filter(status='Finished')
    if start_date and end_date:
        projects = projects.filter(start_date__gte=start_date, start_date__lte=end_date)

    on_time_count = 0
    earlier_count = 0
    late_count = 0

    for project in projects:
        if project.completed_At is not None:
            if project.completed_At <= project.end_date:
                if project.completed_At == project.end_date:
                    on_time_count += 1
                else:
                    earlier_count += 1
            else:
                late_count += 1

    data = {
        "labels": ["On Time", "Earlier", "Late"],
        "counts": [on_time_count, earlier_count, late_count]
    }

    return JsonResponse(data)
