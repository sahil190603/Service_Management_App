from django.db import models
from django.contrib.auth import get_user_model
from tasks.models import Task  
from datetime import datetime, timedelta
import pytz
from tasks.models import TaskStatusRequest

User = get_user_model()

class Query(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Resolved', 'Resolved'),
        ('InProgress', 'InProgress'),
    ]
    PRIORITY_CHOICES = [
        ('High', 'High'),
        ('Urgent', 'Urgent'),
    ]
    
    query = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Open')
    priority = models.CharField(max_length=6, choices=PRIORITY_CHOICES , null=True, blank=True, default="null")
    linked_task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True, related_name="queries")
    Solved_by_date = models.DateTimeField(null=True)
    Solved_time = models.DateTimeField(null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_queries")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
  
    def save(self, *args, **kwargs):
        if self.linked_task:
            if self.status == 'Resolved':
                self.linked_task.status = 'Completed'
                self.linked_task.save()  
            elif self.status == 'Open':
                self.linked_task.status = 'InProgress'
                self.linked_task.save()  

            if self.status == 'Open':
                TaskStatusRequest.objects.filter(task=self.linked_task, status='Pending').update(status='Rejected')

            if self.status == 'Resolved':
                TaskStatusRequest.objects.filter(task= self.linked_task , status='Pending').update(status="Approved")

        if not self.Solved_by_date:
            self.Solved_by_date = datetime.now(pytz.utc) + timedelta(days=1)
        
        Query.objects.filter(linked_task=self.linked_task).exclude(id=self.id).delete()
 
        super(Query, self).save(*args, **kwargs)

    def __str__(self):
        return f"Query by {self.created_by.first_name} on {self.created_at}"
