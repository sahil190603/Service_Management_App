from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TaskHistorViewSet ,TaskStatusRequestViewSet , TaskTransferRequestViewSet
from . import views 

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'Task-request',TaskStatusRequestViewSet)
router.register(r'taskhistory',TaskHistorViewSet)
router.register(r'TaskTransferRequest',TaskTransferRequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('tasks-by-user/', views.get_tasks_by_user , name='get_tasks_by_user'),
    path('update-task-status/', views.update_task_status, name='update-task-status'),
    path('tasks-by-project/', views.get_tasks_by_project, name='get_tasks_by_project'),
    path('Export-to-excel/', views.export_tasks_to_excel, name='export_tasks_to_excel'),
    path('approve-request/<int:request_id>/', views.approve_task_status_request, name='approve_task_status_request'),
    path('reject-request/<int:request_id>/', views.reject_task_status_request, name='reject_task_status_request'),
    path('task-status-requests/', views.get_task_requests_by_user, name='task-requests-by-user'),
    path('action_history_by_task/', views.get_task_history_by_task , name='get_task_history_by_task'),
    path("get_all_task_Status/", views.get_all_task_Status, name="get_all_task_Status"),
    path('get_tasks_status_notcomplete/' , views.get_tasks_status_notcomplete, name="get_tasks_status_notcomplete"),
    path('top_performers/', views.top_performers , name='top_performers'),
    path('task_status_summary/', views.Task_status_summary, name='Task_status_summary'),
    path('task_time_summary/', views.task_time_summary ,name='task_time_summary'),
    path('task_completion_status_summary/', views.task_completion_status_summary , name='task_completion_status_summary'),
    path('Task_line_plot_data/', views.Task_line_plot_data, name='Task_line_plot_data'),
    path('task_gantt_data/', views.task_gantt_data, name='task_gantt_data'),
    path('get_task_transfer_requests_by_user/', views.get_task_transfer_requests_by_user, name='get_task_transfer_requests_by_user'),
    path('accept_task_transfer/', views.accept_task_transfer, name='accept_task_transfer'),
    path('reject_task_transfer/', views.reject_task_transfer, name='reject_task_transfer'),
    path('get_tasks_by_Completion_status/', views.get_tasks_by_Completion_status, name="get_tasks_by_Completion_status"),
    path('get_taskTransferReq_For_admin/', views.get_taskTransferReq_For_admin, name="get_taskTransferReq_For_admin"),
    path('export-task-transfer-requests/', views.export_task_transfer_requests_to_excel, name='export_task_transfer_requests'),
]
