from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet 
from . import views

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('get_appointments_by_creator/<int:user_id>/', views.get_appointments_by_creator, name='get_appointments_by_creator'),
    path('get-Appointments/', views.get_accepted_and_canceled_appointments , name='get_accepted_and_canceled_appointments'),
    path('accept/<int:appointment_id>/', views.accept_appointment_request, name='accept_appointment'),
    path('reject/<int:appointment_id>/', views.reject_appointment_request, name="reject_appointment_request"),
    path('export-appointments/', views.export_appointments,name='export_appointments'),
    path('Appintment_status_summary/', views.appointment_status_summary, name= 'Appintment_status_summary'),
    path('appointment_time_summary/', views.appointment_time_summary, name="appointment_time_summary"),
    path('Appointment_completion_status_summary/', views.Appointment_completion_status_summary, name="Appointment_completion_status_summary"),
    path('AppointmentforAdmin/', views.AppointmentforAdmin , name="AppointmentforAdmin")
]


