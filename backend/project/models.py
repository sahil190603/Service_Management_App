from django.db import models
from django.conf import settings  
from django.contrib.auth import get_user_model
from datetime import timedelta, datetime


User = get_user_model()

class Project(models.Model):
    STATUS_CHOICES = [
        ('Started', 'Started'),
        ('InProgress', 'InProgress'),
        ('Finished', 'Finished'),
        ('Canceled', 'Canceled')
    ]
    name = models.CharField(max_length=255) 
    description = models.TextField()  
    start_date = models.DateTimeField() 
    end_date = models.DateTimeField()  
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True , blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)  
    updated_at = models.DateTimeField(auto_now=True) 
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Started', blank=True, null=True)
    time_taken = models.DurationField(default=timedelta)
    completed_At = models.DateTimeField(null=True , blank=True)

    def save(self, *args, **kwargs):
        if self.status == 'Finished' and self.completed_At is None:
            self.completed_At = datetime.now()
            
        super(Project, self).save(*args, **kwargs)
    def __str__(self):
        return self.name 

