from rest_framework import viewsets
from .models import  Appointment
from .serializers import AppointmentSerializer 
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from django.db.models import Count

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer


def AppointmentforAdmin(request):

    appointments = Appointment.objects.exclude(status="Pending")

    timing_filter = request.GET.get('timingFilter')
    start_date, end_date = None, None
    if timing_filter:
        start_date, end_date = get_date_range(timing_filter)

    if start_date and end_date:
        appointments = appointments.filter(start_time__range=(start_date, end_date))

    appointments_list = [{
        "id": appointment.id,
        "name": appointment.name,
        "description": appointment.description,
        "start_time": appointment.start_time if appointment.start_time else '',
        "Marked_As_done": appointment.Marked_As_done if appointment.Marked_As_done else '',
        "end_time": appointment.end_time if appointment.end_time else '',
        "status": appointment.status,
        "creator": appointment.creator.first_name if appointment.creator else None,
    } for appointment in appointments]
    return JsonResponse(appointments_list, safe=False)

def get_appointments_by_creator(request, user_id):

    appointments = Appointment.objects.filter(creator=user_id)
    timing_filter = request.GET.get('timingFilter')

    start_date, end_date = None, None
    if timing_filter:
        start_date, end_date = get_date_range(timing_filter)

    if start_date and end_date:
        appointments = appointments.filter(start_time__range=(start_date, end_date))

    appointments_list = [{
        "id": appointment.id,
        "name": appointment.name,
        "description": appointment.description,
        "start_time": appointment.start_time if appointment.start_time else '',
        "Marked_As_done": appointment.Marked_As_done,
        "end_time": appointment.end_time if appointment.end_time else '',
        "status": appointment.status,
        "creator": appointment.creator.first_name if appointment.creator else None,
    } for appointment in appointments]

    return JsonResponse(appointments_list, safe=False)



def get_accepted_and_canceled_appointments(request):

    status_param = request.GET.get('status')
    timing_filter = request.GET.get('timingFilter')

    start_date, end_date = None, None
    if timing_filter:
        start_date, end_date = get_date_range(timing_filter)

    if status_param:
        appointments = Appointment.objects.filter(status=status_param)
    else:
        appointments = Appointment.objects.filter(status__in=["Accepted", "Cancelled"])

    if start_date and end_date:
        appointments = appointments.filter(start_time__range=(start_date, end_date))

    appointments_list = [{
        "id": appointment.id,
        "name": appointment.name,
        "description": appointment.description,
        "start_time": appointment.start_time,
        "end_time": appointment.end_time,
        "status": appointment.status,
        "admin": appointment.admin.first_name if appointment.admin else None,
        "creator": f"{appointment.creator.first_name} {appointment.creator.last_name}" if appointment.creator else None,
        "user_id": appointment.creator.id if appointment.creator else None,
        "Marked_As_done": appointment.Marked_As_done,
    } for appointment in appointments]

    return JsonResponse(appointments_list, safe=False)


def accept_appointment_request(request, appointment_id):

    appointment = get_object_or_404(Appointment, id=appointment_id)

    if appointment.status != 'Pending':
        return JsonResponse({'error': 'Appointment is not in pending status.'}, status=400)

    overlapping_appointments = Appointment.objects.filter(
        start_time__lt=appointment.end_time,
        end_time__gt=appointment.start_time,
        status='Accepted'  
    ).exclude(pk=appointment.pk) 

    if overlapping_appointments.exists():
        return JsonResponse({'error': 'The admin has another appointment during the requested time.'}, status=400)

    try:
        appointment.status = 'Accepted'
        appointment.save()  

        return JsonResponse({'message': 'Appointment request has been accepted successfully.'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


def reject_appointment_request(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id)

    if appointment.status != 'Pending':
        return JsonResponse({'error': 'Appointment is not in pending status.'}, status=400)

    appointment.status = 'Rejected'
    appointment.save()  

    return JsonResponse({'message': 'Appointment request has been rejected successfully.'}, status=200)


from openpyxl import Workbook

def export_appointments(request):
    """
    Exports appointments based on status in URL to an Excel file.

    Args:
        request: The Django HTTP request object.

    Returns:
        An HttpResponse containing the Excel file with appointments data.
    """
    status_param = request.GET.get('status')

    if status_param:
        appointments = Appointment.objects.filter(status=status_param)
    else:
        appointments = Appointment.objects.filter(status__in=["Accepted", "Cancelled"])

    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = "Appointments"

    headers = ["ID", "Name", "Description", "Start Time", "End Time", "Status", "Admin", "Creator"]
    worksheet.append(headers)

    for appointment in appointments:
        worksheet.append([
            appointment.id,
            appointment.name,
            appointment.description,
            appointment.start_time.astimezone(timezone.get_current_timezone()).replace(tzinfo=None),
            appointment.end_time.astimezone(timezone.get_current_timezone()).replace(tzinfo=None),
            appointment.status,
            appointment.admin.first_name if appointment.admin else None,
            f"{appointment.creator.first_name} {appointment.creator.last_name}" if appointment.creator else None,
        ])

    output = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response = HttpResponse(output.getvalue())
    response['Content-Disposition'] = 'attachment; filename="appointments.xlsx"'

    workbook.save(response)

    return response


from django.utils import timezone
from datetime import timedelta

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

    return start_date, end_date


def appointment_status_summary(request):
    timing_filter = request.GET.get('timingFilter')  
    appointments = Appointment.objects.all()

    start_date, end_date = get_date_range(timing_filter)

    if start_date and end_date:
        appointments = appointments.filter(start_time__range=(start_date, end_date))

    appointments_status_counts = appointments.values('status').annotate(count=Count('status'))

    total_appointments = appointments.count()

    data = {
        "labels": [entry['status'] for entry in appointments_status_counts],
        "counts": [entry['count'] for entry in appointments_status_counts],
        "ratios": [
            round((entry['count'] / total_appointments) * 100, 2) if total_appointments > 0 else 0 
            for entry in appointments_status_counts
        ]
    }

    return JsonResponse(data)


def appointment_time_summary(request):
    status = request.GET.get('status')
    timing_filter = request.GET.get('timingFilter')  
    appointments = Appointment.objects.all()

    start_date, end_date = get_date_range(timing_filter)

    if start_date and end_date:
        appointments = appointments.filter(created_at__range=(start_date, end_date))

    if status:
        appointments = appointments.filter(status=status)
    else:
        appointments = appointments.all()

    appointment_data = []
    for appointment in appointments:
        if appointment.start_time and appointment.end_time:
            allocated_time = (appointment.end_time - appointment.start_time).total_seconds() / 3600  
        else:
            allocated_time = 0

        if appointment.Marked_As_done_time:
            effective_end_time = min(appointment.Marked_As_done_time, appointment.end_time)
            time_taken = (effective_end_time - appointment.start_time).total_seconds() / 3600  
        else:
            time_taken = 0

        appointment_data.append({
            'name': appointment.name,
            'allocated_time': round(allocated_time, 2), 
            'time_taken': round(time_taken, 2)
        })

    return JsonResponse({
        'labels': [appointment['name'] for appointment in appointment_data],
        'allocated_time': [appointment['allocated_time'] for appointment in appointment_data],
        'time_taken': [appointment['time_taken'] for appointment in appointment_data]
    })

def Appointment_completion_status_summary(request):
    timing_filter = request.GET.get('timingFilter')  
    appointments = Appointment.objects.filter(status='Completed')

    start_date, end_date = get_date_range(timing_filter)

    if start_date and end_date:
        appointments = appointments.filter(created_at__range=(start_date, end_date))

    on_time_count = 0
    earlier_count = 0
    late_count = 0

    for appointment in appointments:
        if appointment.Marked_As_done_time is not None:
            if appointment.Marked_As_done_time <= appointment.end_time:
                if appointment.Marked_As_done_time == appointment.end_time:
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

