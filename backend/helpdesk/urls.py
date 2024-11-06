from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QueryViewSet
from . import views

router = DefaultRouter()
router.register(r'queries', QueryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('update-query-status/', views.update_query_status, name='update-query-status'),
    path('Export-to-excel/', views.export_queries_to_excel , name='export_queries_to_excel'),
    path('query_status_pie_chart_data/',  views.query_status_pie_chart_data, name="query_status_pie_chart_data"),
    path('query_solved_time_summary/', views.query_solved_time_summary , name='query_solved_time_summary'),
    path('query_completion_status_summary/', views.query_completion_status_summary, name="query_completion_status_summary"),
    path('Query_line_plot_data/', views.Query_line_plot_data  , name="Query_line_plot_data"),
    path('get_queries/', views.get_queries, name="get_queries")
]
