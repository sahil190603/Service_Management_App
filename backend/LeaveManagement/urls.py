from django.urls import path , include
from rest_framework.routers import DefaultRouter
from .views import LeaveRequestViewSet 
from . import views

router = DefaultRouter()
router.register(r'leave-request', LeaveRequestViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('all_leave_requests/', views.all_leave_requests, name='all_leave_requests'),
    path('get_leave_requests_by_user/', views.get_leave_requests_by_user, name='get_leave_requests_by_user'),
    path('approve_reject_leave_request/<int:leave_request_id>/<str:action>/', views.approve_reject_leave_request, name='approve_reject_leave_request'),
    path('approved_leave_requests_by_user/', views.approved_leave_requests_by_user, name ="approved_leave_requests_by_user"),
    path('RejectExpiredLeaveRequestsView/', views.RejectExpiredLeaveRequestsView, name='RejectExpiredLeaveRequestsView'),
    path('export-leave-requests/', views.export_leave_requests_to_excel, name='export_leave_requests'),
]
