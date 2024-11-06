from rest_framework import viewsets
from .models import  Task , TaskHistory,TaskStatusRequest, TaskTransferRequest
from .serializers import TaskSerializer , TaskHistorySerializer ,TaskStatusRequestSerializers,TaskTransferRequestSerializer
from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from django.views.decorators.http import require_GET 
from django.shortcuts import get_object_or_404
from project.models import Project
from openpyxl import Workbook
from helpdesk.models import  Query
from datetime import timedelta
from django.db.models import Sum, Count, FloatField
from django.db.models.functions import Cast


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        timing_filter = self.request.query_params.get('timing_filter', None)

        if timing_filter:
            start_date, end_date = get_date_range(timing_filter)
            if start_date and end_date:
                queryset = queryset.filter(start_time__range=(start_date, end_date))
        
        return queryset

class TaskHistorViewSet(viewsets.ModelViewSet):
    queryset = TaskHistory.objects.all()
    serializer_class =   TaskHistorySerializer

class TaskStatusRequestViewSet(viewsets.ModelViewSet):
    queryset = TaskStatusRequest.objects.all()
    serializer_class = TaskStatusRequestSerializers

class TaskTransferRequestViewSet(viewsets.ModelViewSet):
    queryset = TaskTransferRequest.objects.all()
    serializer_class = TaskTransferRequestSerializer


def get_tasks_by_user(request):
    user_id = request.GET.get('userId')
    timing_filter = request.GET.get('timing_filter', None)

    if not user_id:
        return JsonResponse({"error": "UserId parameter is required."}, status=400)

    tasks = Task.objects.filter(assigned_to__id=user_id)

    if timing_filter:
        start_date, end_date = get_date_range(timing_filter)
        if start_date and end_date:
            tasks = tasks.filter(created_at__range=(start_date, end_date))

    tasks = tasks.exclude(
        id__in=TaskTransferRequest.objects.filter(status='Pending').values_list('task_id', flat=True)
    )

    tasks_list = []

    for task in tasks:
        if task.Dependent_on:
            dependent_task = Task.objects.get(id=task.Dependent_on.id)
            if dependent_task.assigned_to == task.assigned_to:
                if dependent_task.status != 'Completed':
                    continue
            elif dependent_task.status != 'Completed':
                continue

        tasks_list.append({
            "id": task.id,
            "name": task.name[:15],
            "description": task.description,
            "time_taken": str(timedelta(seconds=task.time_taken.total_seconds())).split('.')[0],
            "priority": task.priority,
            "status": task.status,
            "percentage_completed": task.percentage_completed,
            "start_time": task.start_time,
            "end_time": task.end_time,
            "assigned_to": task.assigned_to.id if task.assigned_to else '',
            "created_by": f"{task.created_by.first_name} {task.created_by.last_name}" if task.created_by else None,
            "project": task.project.id if task.project else '',
            "Dependent_on": task.Dependent_on.id if task.Dependent_on else '',
        })

    return JsonResponse(tasks_list, safe=False)


@require_GET
def update_task_status(request):
    current_time = timezone.now()
    
    tasks_to_update = Task.objects.filter(
        status='NotStarted',
        start_time__lte=current_time,
    )

    for task in tasks_to_update:
        task.status = 'InProgress'
        task.save()

    return JsonResponse({"message": "Task statuses updated to InProgress successfully."}, status=200)

def format_time_taken(self):
    if self.time_taken:
        total_seconds = int(self.time_taken.total_seconds())
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{hours:02}:{minutes:02}:{seconds:02}"
    return "00:00:00" 

def get_tasks_by_project(request):
    project_id = request.GET.get('projectId')
    status = request.GET.get('status') 

    if not project_id and not status:
        return JsonResponse({"error": "Either projectId or status parameter is required."}, status=400)

    if project_id:
        project = get_object_or_404(Project, id=project_id)
        tasks = Task.objects.filter(project=project)
    else:
        tasks = Task.objects.all() 

    if status:
        tasks = tasks.filter(status=status)

    tasks_list = [{
        "id": task.id,
        "name": task.name,
        "description": task.description,
        "priority": task.priority,
        "status": task.status,
        "percentage_completed": task.percentage_completed,
        "start_time": task.start_time if task.start_time else None,
        "end_time": task.end_time if task.end_time else None,
        "time_taken": format_time_taken(task),
        "assigned_to": f"{task.assigned_to.first_name} {task.assigned_to.last_name}" if task.assigned_to else '',
        "created_by": f"{task.created_by.first_name} {task.created_by.last_name}" if task.created_by else None,
        "project": task.project.name if task.project else '',
    } for task in tasks]

    return JsonResponse(tasks_list, safe=False)

def export_tasks_to_excel(request): 
    project_id = request.GET.get('projectId')
    status = request.GET.get('status')
    assigned_to = request.GET.get('assignedTo')  

    if project_id:
        project = get_object_or_404(Project, id=project_id)
        tasks = Task.objects.filter(project=project)
    else:
        tasks = Task.objects.all()

    if status:
        tasks = tasks.filter(status=status)

    if assigned_to == "Assigned_task":
        tasks = tasks.exclude(assigned_to=None)  
    elif assigned_to == "Non_Assigned_task":
        tasks = tasks.filter(assigned_to=None) 

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Tasks"

    headers = [
        "ID", "Name", "Description", "Priority", "Status",
        "Percentage Completed", "Start Time", "End Time",
        "Assigned To", "Created By", "Project"
    ]
    sheet.append(headers)

    for task in tasks:
        row = [
            task.id,
            task.name,
            task.description,
            task.priority,
            task.status,
            task.percentage_completed,
            task.start_time.astimezone(timezone.get_current_timezone()).replace(tzinfo=None) if task.start_time else None,
            task.end_time.astimezone(timezone.get_current_timezone()).replace(tzinfo=None)  if task.end_time else None,
            f"{task.assigned_to.first_name} {task.assigned_to.last_name}" if task.assigned_to else '',
            f"{task.created_by.first_name} {task.created_by.last_name}" if task.created_by else None,
            task.project.name if task.project else '',
        ]
        sheet.append(row)

    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename="Tasks.xlsx"'

    workbook.save(response)

    return response


def approve_task_status_request(request, request_id):

    task_status_request = get_object_or_404(TaskStatusRequest, pk=request_id)

    related_queries = Query.objects.filter(linked_task=task_status_request.task)

    unresolved_queries = related_queries.filter(status='Unresolved') 

    if unresolved_queries.exists():
        return JsonResponse({"error": "Please resolve the queries related to the task before approval."}, status=400)

    task_status_request.status = 'Approved'
    task_status_request.save()

    task = task_status_request.task
    task.status = 'Completed'  
    task.save()

    return JsonResponse({"message": "Task status request approved and task marked as completed."}, status=200)

def reject_task_status_request(request, request_id):

    task_status_request = get_object_or_404(TaskStatusRequest, pk=request_id)

    task_status_request.status = 'Rejected'
    task_status_request.save()

    return JsonResponse({"message": "Task status request rejected."}, status=200)


def get_task_requests_by_user(request):
    user_id = request.GET.get('userId')

    if not user_id:
        return JsonResponse({"error": "userId parameter is required."}, status=400)

 
    task_requests = TaskStatusRequest.objects.filter(user_id=user_id)

    task_requests_list = [{
        "id": request.id,
        "task": request.task.id,  
        "project": request.task.project.id if request.task.project else '',
        "project_name": request.task.project.name if request.task.project else '',
        "document_url": request.task.document_link.url if request.task.document_link else '',
        "task_name": request.task.name,
        "date_of_request": request.date_of_request,
        "status": request.status,
        "user": request.user.email,
    } for request in task_requests]

    return JsonResponse(task_requests_list, safe=False)

def get_task_history_by_task(request):
    task_id = request.GET.get('taskId')

    if not task_id:
        return JsonResponse({"error": "taskId parameter is required."}, status=400)

    task_history = TaskHistory.objects.filter(task_id=task_id).order_by("-created_at")

    task_history_list = [{
        "id": entry.id,
        "activity_name": entry.Activty_name,
        "time_spent": str(entry.time_spent),  
        "created_at": entry.created_at.isoformat(), 
    } for entry in task_history]

    return JsonResponse(task_history_list, safe=False)


def get_all_task_Status(request):
    """
    View to fetch all task history.
    """
    task_requests = TaskStatusRequest.objects.all()

    task_history_list = [
        {
            "id": request.id,
            "task": request.task.id,
            "project": request.task.project.id  if request.task.project.id else '',
            "project_name": request.task.project.name if request.task.project.id else '',
            "document_url": request.task.document_link.url if request.task.document_link else '',
            "task_name": request.task.name,
            "date_of_request": request.date_of_request,
            "status": request.status,
            "user": request.user.email,
            "user_name": request.user.first_name
        }
        for request in task_requests
    ]

    return JsonResponse(task_history_list, safe=False)


def get_tasks_status_notcomplete(request):

    tasks = Task.objects.exclude( status='Completed', document_submitted=True)

    tasks_list = [{
        "id": task.id,
        "name": task.name,
        "priority": task.priority,
        "status": task.status,
        "time_taken": str(timedelta(seconds=task.time_taken.total_seconds())).split('.')[0],
    } for task in tasks]

    return JsonResponse(tasks_list, safe=False)



def top_performers(request):
    """
    Retrieves the top 5 employees based on their task performance.
    
    Returns:
        JsonResponse: A JSON object containing the top 5 performing employees.
    """
    timing_filter = request.GET.get('timingFilter')
    start_date, end_date = get_date_range(timing_filter) 

    tasks = Task.objects.filter(status='Completed')
    
    if start_date and end_date:
        tasks = tasks.filter(start_time__range=[start_date, end_date])  

    employee_data = (
        tasks.values('assigned_to__email', 'assigned_to__first_name', 'assigned_to__last_name')
        .annotate(
            total_tasks=Count('id'),
            total_allocated_time=Sum('allocated_time'),
            total_time_taken=Sum('time_taken')
        )
        .annotate(
            performance_ratio=(
                Cast(Sum('time_taken'), FloatField()) / Cast(Sum('allocated_time'), FloatField())
            )
        )
        .order_by('performance_ratio')  
    )

    top_employees = employee_data[:5]

    performance_summary = []
    for entry in top_employees:
        performance_percentage = 100 - (entry['performance_ratio'] * 100)  

        performance_summary.append({
            'employee_first_name': entry['assigned_to__first_name'],
            'employee_last_name': entry['assigned_to__last_name'],
            'performance_percentage': round(performance_percentage, 2)
        })

    return JsonResponse({'top_performers': performance_summary})

 

def Task_status_summary(request):
    project_id = request.GET.get('project')
    user_id = request.GET.get('user')
    timing_filter = request.GET.get('timingFilter')  

    start_date, end_date = get_date_range(timing_filter)

    tasks = Task.objects.all()

    if project_id:
        tasks = tasks.filter(project_id=project_id)

    if user_id:
        tasks = tasks.filter(assigned_to=user_id)

    if start_date and end_date:
        tasks = tasks.filter(start_time__range=[start_date, end_date]) 

    tasks_status_counts = tasks.values('status').annotate(count=Count('status'))
    total_tasks = tasks.count()

    data = {
        "labels": [entry['status'] for entry in tasks_status_counts],
        "counts": [entry['count'] for entry in tasks_status_counts],
        "ratios": [
            round((entry['count'] / total_tasks) * 100, 2) if total_tasks > 0 else 0
            for entry in tasks_status_counts
        ]
    }

    return JsonResponse(data)

def task_time_summary(request):
    status = request.GET.get('status')
    user_id = request.GET.get('user')
    timing_filter = request.GET.get('timingFilter') 

    start_date, end_date = get_date_range(timing_filter)

    tasks = Task.objects.all()

    if status and status != "null":
        tasks = tasks.filter(status=status)

    if user_id:
        tasks = tasks.filter(assigned_to=user_id)

    if start_date and end_date:
        tasks = tasks.filter(start_time__range=[start_date, end_date])

    task_data = []
    for task in tasks:
        allocated_time = task.allocated_time.total_seconds() / 86400
        time_taken = task.time_taken.total_seconds() / 86400 if task.time_taken else 0

        task_data.append({
            'name': task.name,
            'allocated_time': round(allocated_time, 2),
            'time_taken': round(time_taken, 2)
        })

    return JsonResponse({
        'labels': [task['name'] for task in task_data],
        'allocated_time': [task['allocated_time'] for task in task_data],
        'time_taken': [task['time_taken'] for task in task_data],
    })


def task_completion_status_summary(request):
    project_id = request.GET.get('project')
    user_id = request.GET.get('user')
    timing_filter = request.GET.get('timingFilter') 

    start_date, end_date = get_date_range(timing_filter)

    tasks = Task.objects.filter(status='Completed')

    if user_id:
        tasks = tasks.filter(assigned_to=user_id)

    if project_id:
        tasks = tasks.filter(project_id=project_id)

    if start_date and end_date:
        tasks = tasks.filter(start_time__range=[start_date, end_date])  

    on_time_count = 0
    earlier_count = 0
    late_count = 0

    for task in tasks:
        if task.end_time and task.start_time:
            allocated_time = task.end_time - task.start_time
            if task.time_taken and isinstance(task.time_taken, timedelta):
                if task.time_taken <= allocated_time:
                    if task.time_taken == allocated_time:
                        on_time_count += 1
                    else:
                        earlier_count += 1
                else:
                    late_count += 1

    data = {
        "labels": ["On Time", "Earlier", "Late"],
        "counts": [on_time_count, earlier_count, late_count],
    }

    return JsonResponse(data)


def Task_line_plot_data(request):
    user_id = request.GET.get('user')
    timing_filter = request.GET.get('timingFilter')  

    start_date, end_date = get_date_range(timing_filter)

    tasks = Task.objects.all()

    if user_id:
        tasks = tasks.filter(assigned_to=user_id)

    if start_date and end_date:
        tasks = tasks.filter(start_time__range=[start_date, end_date]) 

    line_data = {
        'labels': [],  
        'datasets': [
            {
                'label': 'Task Creation Dates',
                'data': [] 
            },
            {
                'label': 'Task Start Times',
                'data': []  
            }
        ]
    }

    for task in tasks:
        line_data['labels'].append(task.name)

        if task.created_at:
            formatted_created_at = task.created_at.strftime('%Y-%m-%d %H:%M:%S')
            line_data['datasets'][0]['data'].append({
                'x': formatted_created_at,
                'y': task.name,
            })

        if task.start_time:
            formatted_start_time = task.start_time.strftime('%Y-%m-%d %H:%M:%S')
            line_data['datasets'][1]['data'].append({
                'x': formatted_start_time,
                'y': task.name
            })

    line_data['datasets'][0]['data'].sort(key=lambda point: point['x'])
    line_data['datasets'][1]['data'].sort(key=lambda point: point['x'])

    return JsonResponse(line_data)



def get_date_range(timing_filter):
    now = timezone.now()
    start_date, end_date = None, None

    if timing_filter == "Today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif timing_filter == "ThisWeek":
        start_date = now - timedelta(days=now.weekday())  
        end_date = now + timedelta(days=(6 - now.weekday()), hours=23, minutes=59, seconds=59)
    elif timing_filter == "ThisMonth":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = (start_date + timedelta(days=31)).replace(day=1) - timedelta(seconds=1)  
    elif timing_filter == "ThisYear":
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(month=12, day=31, hour=23, minute=59, second=59, microsecond=999999)

    return start_date, end_date


def task_gantt_data(request):
    projectId = request.GET.get('projectId')
    timing_filter = request.GET.get('timingFilter')

    tasks = Task.objects.all()
    
    if projectId:
        tasks = tasks.filter(project=projectId)

    start_date, end_date = get_date_range(timing_filter)

    if start_date and end_date:
        tasks = tasks.filter(start_time__range=(start_date, end_date))

    task_data = []
    for task in tasks:
        task_data.append({
            "id": task.id,
            "name": task.name,
            "start": task.start_time.strftime("%Y-%m-%d %H:%M:%S") if task.start_time else None,
            "end": task.end_time.strftime("%Y-%m-%d %H:%M:%S") if task.end_time else None,
            "progress": task.percentage_completed,
            "dependencies": task.Dependent_on.id if task.Dependent_on else None
        })

    return JsonResponse(task_data, safe=False)



def get_task_transfer_requests_by_user(request):
    transfer_to = request.GET.get('transfer_to')
    created_by = request.GET.get('created_by')

    if transfer_to:
        transfer_requests = TaskTransferRequest.objects.filter(transfer_to = transfer_to)

    if created_by:
        transfer_requests = TaskTransferRequest.objects.filter(created_by = created_by)

    transfer_requests_data = [
        {
            "id": req.id,
            "created_by_id": req.created_by.id,
            "created_by": f"{req.created_by.first_name} {req.created_by.last_name}",
            "transfer_to" : f"{req.transfer_to.first_name} {req.transfer_to.last_name}",
            "task": req.task.name,  
            "date_of_request": req.date_of_request,
            "status": req.status,
            "created_at": req.created_at,
        }
        for req in transfer_requests
    ]

    return JsonResponse({"transfer_requests": transfer_requests_data})


def accept_task_transfer(request):
    """
    View to accept a task transfer request and update the task's assigned_to field with the new user.
    """
    transfer_request_id = request.GET.get('transfer_request_id')
    user_id = request.GET.get('user_id')

    if not transfer_request_id or not user_id:
        return JsonResponse({"error": "transfer_request_id and user_id are required."}, status=400)

    transfer_request = get_object_or_404(TaskTransferRequest, id=transfer_request_id)

    task = transfer_request.task

    task.assigned_to.set([transfer_request.transfer_to])

    transfer_request.status = 'Approved'
    transfer_request.save()

    return JsonResponse({"message": "Task transfer request accepted successfully and task assigned to new user."}, status=200)



def reject_task_transfer(request):
    """
    View to reject a task transfer request.
    """
    transfer_request_id = request.GET.get('transfer_request_id')
    user_id = request.GET.get('user_id')

    if not transfer_request_id or not user_id:
        return JsonResponse({"error": "transfer_request_id and user_id are required."}, status=400)

    transfer_request = get_object_or_404(TaskTransferRequest, id=transfer_request_id)

    transfer_request.status = 'Rejected'
    transfer_request.save()

    return JsonResponse({"message": "Task transfer request rejected successfully."}, status=200)

def get_tasks_by_Completion_status(request):
    tasks = Task.objects.filter(status="Completed")

    tasks_list = [{
        "id": task.id,
        "name": task.name,
        "description": task.description,
    } for task in tasks]

    return JsonResponse(tasks_list, safe=False)

def get_taskTransferReq_For_admin(request):
    tasks = TaskTransferRequest.objects.all()

    tasks_list = [{
        "id": task.id,
        "created_by": f"{task.created_by.first_name} {task.created_by.last_name}" if task.created_by else None,
        "transfer_to": f"{task.transfer_to.first_name} {task.transfer_to.last_name}" if task.transfer_to else None,
        "task": task.task.name,
        "date_of_request": task.date_of_request,
        "status": task.status,
    } for task in tasks]

    return JsonResponse(tasks_list, safe=False)

from django.http import HttpResponse
from openpyxl import Workbook
from .models import TaskTransferRequest
from django.utils import timezone
from io import BytesIO

def export_task_transfer_requests_to_excel(request):
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Task Transfer Requests"

    headers = [
        "ID", "Created By", "Transfer To", "Task", 
        "Date of Request", "Status", "Created At"
    ]
    sheet.append(headers)

    status_filter = request.GET.get('status') 

    if status_filter:
        task_transfer_requests = TaskTransferRequest.objects.filter(status=status_filter)
    else:
        task_transfer_requests = TaskTransferRequest.objects.all()  

    for transfer_request in task_transfer_requests:
        row = [
            transfer_request.id,
            transfer_request.created_by.first_name if transfer_request.created_by else 'N/A',
            transfer_request.transfer_to.first_name if transfer_request.transfer_to else 'N/A',
            transfer_request.task.name if transfer_request.task else 'N/A',  
            transfer_request.date_of_request.astimezone(timezone.get_current_timezone()).replace(tzinfo=None),
            transfer_request.status,
            transfer_request.created_at.astimezone(timezone.get_current_timezone()).replace(tzinfo=None),
        ]
        sheet.append(row)

    buffer = BytesIO()
    workbook.save(buffer)
    buffer.seek(0)

    response = HttpResponse(
        buffer.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename="TaskTransferRequests.xlsx"'

    return response
