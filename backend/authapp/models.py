from django.db import models
from django.contrib.auth.models import AbstractUser


class Roles(models.Model):
    name = models.CharField(max_length=10)

    def __str__(self):
         return self.name
     
     
class CustomUser(AbstractUser):
    username = models.CharField(max_length=15 ,null=True, blank=True)
    email = models.EmailField(unique=True  , null= True)
    contact_no = models.CharField(max_length=15 , null=True)
    role = models.ForeignKey(Roles , on_delete=models.CASCADE , default='2')
    Profile = models.ImageField(upload_to='Profile/pictures/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'contact_no']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"