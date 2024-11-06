from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet
from . import views


router = DefaultRouter()
router.register(r'projects', ProjectViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('update-project-status/', views.update_project_status, name='update-project-status'),
    path('export-projects/', views.export_projects_to_excel, name='export_projects'),
    path('projects-exclude-complete/',views.get_Projects_without_complete_stataus , name="get_Projects_without_complete_stataus"),
    path('project_status_summary/', views.project_status_summary, name='project_status_summary'),
    path('project_time_summary/', views.project_time_summary, name='project_time_summary'),
    path('Line_plot_data/', views.Line_plot_data, name='Line_plot_data'),
    path('project_completion_status_summary/', views.project_completion_status_summary , name='project_completion_status_summary'),
]

