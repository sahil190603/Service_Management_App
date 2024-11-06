from rest_framework import viewsets
from .models import LeaveRequest
from .serializers import LeaveRequestSerializer
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from tasks.models import Task
from django.utils import timezone
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all().order_by('-id')
    serializer_class = LeaveRequestSerializer

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


def all_leave_requests(request):
    leave_requests = LeaveRequest.objects.all()

    leave_requests_list = [{
        "id": leave.id,
        "leave_type": leave.leave_type,
        "start_date": leave.start_date,
        "end_date": leave.end_date,
        "date_of_request": leave.date_of_request,
        "status": leave.status,
        "reason": leave.reason,
        "user": leave.user.id if leave.user else "",
        "first_name": leave.user.first_name if leave.user else "",
        "last_name": leave.user.last_name if leave.user else "",
        "full_name": f"{leave.user.first_name} {leave.user.last_name}"  if leave.user else "",
    } for leave in leave_requests]

    return JsonResponse(leave_requests_list, safe=False)


def get_leave_requests_by_user(request):
    user_id = request.GET.get('userId')

    if not user_id:
        return JsonResponse({"error": "userId parameter is required."}, status=400)

    leave_requests = LeaveRequest.objects.filter(user_id=user_id)

    leave_requests_list = [{
        "id": leave.id,
        "leave_type": leave.leave_type,
        "start_date": leave.start_date,
        "end_date": leave.end_date,
        "date_of_request": leave.date_of_request,
        "status": leave.status,
        "reason": leave.reason,
        "user": leave.user.id,
        "first_name": leave.user.first_name,
        "last_name": leave.user.last_name,
        "full_name": f"{leave.user.first_name} {leave.user.last_name}"

    } for leave in leave_requests]

    return JsonResponse(leave_requests_list, safe=False)


def approve_reject_leave_request(request, leave_request_id, action):
    leave_request = get_object_or_404(LeaveRequest, id=leave_request_id)
    start_date = leave_request.start_date
    end_date = leave_request.end_date
    overlapping_tasks = Task.objects.filter(
        assigned_to=leave_request.user,
        start_time__lt=end_date,
        end_time__gt=start_date
    )
    if action == 'approve':
        if overlapping_tasks.exists():
            return JsonResponse({
                "error": "Cannot approve leave request. The user has tasks during the requested leave period."
            }, status=400)
        leave_request.status = 'Approved'
        leave_request.save()
        return JsonResponse({
            "message": "Leave request approved successfully."
        })
    elif action == 'reject':
        leave_request.status = 'Rejected'
        leave_request.save()
        return JsonResponse({
            "message": "Leave request rejected successfully."
        })
    return JsonResponse({"error": "Invalid request"}, status=400)



def approved_leave_requests_by_user(request):
    today = timezone.now().date()
    user_id = request.GET.get('userId')

    if not user_id:
        return JsonResponse({"error": "userId parameter is required."}, status=400)

    leave_requests = LeaveRequest.objects.filter(
        status="Approved",
        start_date__gte=today,
        user__id=user_id  
    )
    leave_requests_list = [{
        "id": leave.id,
        "start_date": leave.start_date,
        "end_date": leave.end_date,
        "user_id": user_id
    } for leave in leave_requests]
    return JsonResponse(leave_requests_list, safe=False)


@api_view(['GET'])
def RejectExpiredLeaveRequestsView(request):
    today = timezone.now().date()

    expired_leaves = LeaveRequest.objects.filter(end_date__lte=today, status__in=['Pending', 'Approved'])

    rejected_count = expired_leaves.update(status='Rejected')

    if rejected_count > 0:
        return Response({
            "message": f"{rejected_count} leave requests have been rejected.",
        })
    else:
        return Response({
            "message": "No leave requests to reject.",
        }, status=200)
    
from django.http import HttpResponse
from openpyxl import Workbook
from .models import LeaveRequest
from django.utils import timezone
from io import BytesIO

def export_leave_requests_to_excel(request):

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Leave Requests"

    # Define the headers
    headers = [
        "ID", "User", "Leave Type", "Start Date", 
        "End Date", "Date of Request", "Reason", "Status"
    ]
    sheet.append(headers)

    # Get the status from the request query parameters
    status_filter = request.GET.get('status')  # Expecting a query parameter like ?status=Approved

    # Get leave requests, optionally filtering by status
    if status_filter:
        leave_requests = LeaveRequest.objects.filter(status=status_filter)
    else:
        leave_requests = LeaveRequest.objects.all()  # Get all if no filter

    # Populate the sheet with leave request data
    for leave_request in leave_requests:
        row = [
            leave_request.id,
            leave_request.user.first_name if leave_request.user else 'N/A',
            leave_request.leave_type,
            leave_request.start_date,
            leave_request.end_date,
            leave_request.date_of_request.astimezone(timezone.get_current_timezone()).replace(tzinfo=None),
            leave_request.reason,
            leave_request.status,
        ]
        sheet.append(row)

    # Create an HTTP response with the Excel file
    buffer = BytesIO()
    workbook.save(buffer)
    buffer.seek(0)

    response = HttpResponse(
        buffer.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename="LeaveRequests.xlsx"'

    return response
