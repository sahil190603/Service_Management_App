from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework  import viewsets 
from .models import CustomUser , Roles 
from .serializers import UserSerializer , RolesSerializer 
from django.http import HttpResponse
from openpyxl import Workbook
from django.utils import timezone
from io import BytesIO
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from datetime import timedelta
from LeaveManagement.models import LeaveRequest
from Appointment.models import Appointment
from tasks.models import Task

User = get_user_model()

  
class RolesViewSet(viewsets.ModelViewSet):
     queryset = Roles.objects.all()
     serializer_class = RolesSerializer

class CustomUserViewset(viewsets.ModelViewSet):
    queryset = CustomUser.objects.filter(role=2)
    serializer_class = UserSerializer

    def destroy(self, request, pk=None):
        try:
            user = self.get_object()

            LeaveRequest.objects.filter(user=user).delete()
            Appointment.objects.filter(creator=user).delete()
            
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CustomUser.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
    def get_queryset(self):
        """
        Customizes the queryset to filter by timingFilter if provided.
        """
        queryset = super().get_queryset()
        timing_filter = self.request.query_params.get('timingFilter')

        if timing_filter:
            start_date, end_date = get_date_range(timing_filter)
            queryset = queryset.filter(created_at__range=[start_date, end_date])

        return queryset

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
        start_date = timezone.datetime.min  # Minimum datetime value
        end_date = now  # Current date and tim

    return start_date, end_date


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role.name
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['email'] = user.email
        token['contact_no'] = user.contact_no
        token['Profile'] = user.Profile.url if user.Profile else None

        return token


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


def export_users_to_excel(request):
    users = CustomUser.objects.all()

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Users"

    headers = [
        "ID", "First Name", "Last Name", "Email",
        "Contact Number", "Role", "Profile URL", "Created At"
    ]
    sheet.append(headers)

    for user in users:
        row = [
            user.id,
            user.first_name,
            user.last_name,
            user.email,
            user.contact_no or '',  
            user.role.name if user.role else '', 
            user.Profile.url if user.Profile else '', 
            user.created_at.astimezone(timezone.get_current_timezone()).replace(tzinfo=None) 
        ]
        sheet.append(row)

    buffer = BytesIO()
    workbook.save(buffer)
    buffer.flush()
    workbook.close()
    buffer.seek(0)

    response = HttpResponse(
        buffer.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response.encoding = 'utf-8'
    response['Content-Disposition'] = 'attachment; filename="Authapp.xlsx"'

    return response