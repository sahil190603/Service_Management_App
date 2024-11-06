from django.urls import path , include
from rest_framework.routers import DefaultRouter
from .views import  CustomUserViewset , RolesViewSet ,CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView 
from . import views

router = DefaultRouter()
router.register(r'Users', CustomUserViewset, basename='customuser')
router.register(r'role' , RolesViewSet)

urlpatterns = [
   path('', include(router.urls)),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('Export-to-excel/',views.export_users_to_excel, name='export_users_to_excel')
] 

