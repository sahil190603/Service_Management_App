from rest_framework import viewsets
from .models import Query
from .serializers import QuerySerializer
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_GET
from openpyxl import Workbook
from django.http import HttpResponse
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta


class QueryViewSet(viewsets.ModelViewSet):
    queryset = Query.objects.all()
    serializer_class = QuerySerializer


def get_queries(request):
    timing_filter = request.GET.get('timingFilter')

    queries = Query.objects.all()

    if timing_filter:
        try:
            start_date, end_date = get_date_range(timing_filter)
            queries = queries.filter(created_at__range=[start_date, end_date])
        except ValueError:
            return JsonResponse({"error": "Invalid timing filter"}, status=400)

    query_list = [{
        "id": query.id,
        "query": query.query,
        "status": query.status,
        "priority": query.priority,
        "linked_task": query.linked_task.name if query.linked_task else None,
        "linked_task_id": query.linked_task.id if query.linked_task else None,
        "solved_by_date": query.Solved_by_date,
        "solved_time": query.Solved_time,
        "created_at": query.created_at,
        "updated_at": query.updated_at,
        "created_by": query.created_by.id,
        "created_by_full_name": f"{query.created_by.first_name} {query.created_by.last_name}" if query.created_by else None
    } for query in queries]

    return JsonResponse(query_list, safe=False)


@require_GET
def update_query_status(request):
    current_time = timezone.now()
    
    threshold_date = current_time - timezone.timedelta(days=30)
    
    queries_to_update = Query.objects.filter(
        status='Open',
        created_at__lt=threshold_date
    )

    for query in queries_to_update:
        query.status = 'Resolved'
        query.save()

    return JsonResponse({"message": "Query statuses updated to Resolved successfully."}, status=200)


def export_queries_to_excel(request):
    status = request.GET.get('status')
    priority = request.GET.get('priority')
    queries = Query.objects.all()

    if status:
        queries = queries.filter(status=status)

    if priority:
        queries = queries.filter(priority=priority)

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Queries"

    headers = [
        "ID", "Query", "Status", "Priority", "Created By",
        "Created At", "Updated At", "Linked Task"
    ]
    sheet.append(headers)

    for query in queries:
        row = [
            query.id,
            query.query,
            query.status,
            query.priority,
            f"{query.created_by.first_name} {query.created_by.last_name}" if query.created_by else None,
            query.created_at.astimezone(timezone.get_current_timezone()).replace(tzinfo=None), 
            query.updated_at.astimezone(timezone.get_current_timezone()).replace(tzinfo=None), 
            query.linked_task.name if query.linked_task else None,
        ]
        sheet.append(row)

    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename="Helpdesk.xlsx"'

    workbook.save(response)

    return response


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
        start_date = now - timedelta(days=now.weekday())  
        end_date = now + timedelta(days=(6 - now.weekday()), hours=23, minutes=59, seconds=59)
    elif timing_filter == "ThisMonth":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = (start_date + timedelta(days=31)).replace(day=1) - timedelta(seconds=1)  
    elif timing_filter == "ThisYear":
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(month=12, day=31, hour=23, minute=59, second=59, microsecond=999999)
    elif timing_filter == "All":
        start_date = timezone.datetime.min  
        end_date = now  


    return start_date, end_date


def query_status_pie_chart_data(request):
    timing_filter = request.GET.get('timingFilter')  
    queries = Query.objects.all()

    start_date, end_date = get_date_range(timing_filter)

    if start_date and end_date:
        queries = queries.filter(created_at__range=(start_date, end_date))

    query_status_counts = queries.values('status').annotate(count=Count('status'))

    total_queries = queries.count()

    data = {
        "labels": [entry['status'] for entry in query_status_counts],  
        "counts": [entry['count'] for entry in query_status_counts],  
        "ratios": [
            round((entry['count'] / total_queries) * 100, 2) if total_queries > 0 else 0 
            for entry in query_status_counts
        ]
    }

    return JsonResponse(data)

def query_solved_time_summary(request):
    status = request.GET.get('status')
    timing_filter = request.GET.get('timingFilter')  
    queries = Query.objects.all()

    start_date, end_date = get_date_range(timing_filter)

    if start_date and end_date:
        queries = queries.filter(created_at__range=(start_date, end_date))

    if status and status != "null":
        queries = queries.filter(status=status)

    query_data = []
    for query in queries:
        if query.Solved_by_date:
            solved_by_date = query.Solved_by_date
        else:
            solved_by_date = None

        if query.Solved_time:
            solved_time = query.Solved_time
        else:
            solved_time = None

        query_data.append({
            'query': query.query,
            'solved_by_date': solved_by_date.strftime('%Y-%m-%d %H:%M') if solved_by_date else None,  
            'solved_time': solved_time.strftime('%Y-%m-%d %H:%M') if solved_time else None,
        })

    return JsonResponse({
        'labels': [query['query'] for query in query_data],
        'solved_by_date': [query['solved_by_date'] for query in query_data],
        'solved_time': [query['solved_time'] for query in query_data],
    })

def query_completion_status_summary(request):
    timing_filter = request.GET.get('timingFilter')  
    queries = Query.objects.filter(status='Resolved')

    start_date, end_date = get_date_range(timing_filter)

    if start_date and end_date:
        queries = queries.filter(created_at__range=(start_date, end_date))

    on_time_count = 0
    earlier_count = 0
    late_count = 0

    for query in queries:
        if query.Solved_by_date and query.Solved_time: 
            solved_by_date = query.Solved_by_date
            solved_time = query.Solved_time
            
            allocated_time = (query.created_at - solved_by_date).total_seconds() / 3600 
            time_taken = (query.created_at - solved_time).total_seconds() / 3600  

            if time_taken <= allocated_time: 
                if time_taken == allocated_time:
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

def Query_line_plot_data(request):
    timing_filter = request.GET.get('timingFilter')  
    queries = Query.objects.all()

    start_date, end_date = get_date_range(timing_filter)

    if start_date and end_date:
        queries = queries.filter(created_at__range=(start_date, end_date))

    line_data = {
        'labels': [],  
        'datasets': [
            {
                'label': 'Query Creation Dates',
                'data': [] 
            },
            {
                'label': 'Query Start Times',
                'data': []  
            }
        ]
    }
    
    for query in queries:
        line_data['labels'].append(query.query)

        if query.created_at: 
            line_data['datasets'][0]['data'].append({
                'x': query.created_at.timestamp(),  
                'y': query.query  
            })

        if query.Solved_time:
            line_data['datasets'][1]['data'].append({
                'x': query.Solved_time.timestamp(), 
                'y': query.query  
            })

    line_data['datasets'][0]['data'].sort(key=lambda point: point['x'])
    line_data['datasets'][1]['data'].sort(key=lambda point: point['x'])

    return JsonResponse(line_data)
