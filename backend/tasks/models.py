from django.db import models
from project.models import Project
from django.contrib.auth import get_user_model
from datetime import timedelta
from django.utils import timezone
from LeaveManagement.models import LeaveRequest 
from django.core.exceptions import ValidationError

User = get_user_model()

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('null', 'null'),
        ('High', 'High'),
        ('Urgent', 'Urgent'),
    ]
    STATUS_CHOICES = [
        ('null', 'null'),
        ('NotStarted', 'NotStarted'),
        ('InProgress', 'InProgress'),
        ('Completed', 'Completed'),
        ('Canceled', 'Canceled'),
    ]

    name = models.CharField(max_length=255 , null=True)
    description = models.TextField(null=True)
    priority = models.CharField(max_length=6, choices=PRIORITY_CHOICES , default="null", blank=True , null=True)
    start_time = models.DateTimeField(null=True)
    end_time = models.DateTimeField(null=True)
    allocated_time = models.DurationField(default=timedelta(hours=8), null=True)
    assigned_to = models.ForeignKey(User , on_delete=models.CASCADE, related_name="assigned_tasks", blank=True, null=True)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='NotStarted')
    percentage_completed = models.IntegerField(default=0)
    time_taken = models.DurationField(default=timedelta)
    document_submitted = models.BooleanField(default=False)
    document_link = models.ImageField(upload_to='Task/document/', blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="created_tasks" , null=True ,blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks", null=True)
    Dependent_on = models.ForeignKey("self", null=True , on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
    
        if self.assigned_to and self.start_time and self.end_time:
            overlapping_leaves = LeaveRequest.objects.filter(
                user=self.assigned_to, 
                status="Approved",
                start_date__lte=self.end_time,
                end_date__gte=self.start_time
            )
    
            if overlapping_leaves.exists():
                raise ValidationError(
                    f"User {self.assigned_to.first_name} {self.assigned_to.last_name} "
                    "has an approved leave during the task period. "
                    "Please adjust the task time or assign a different employee."
                )
            
    def save(self, *args, **kwargs):
        self.clean()
    
        if self.start_time and self.start_time <= timezone.now() and self.status == 'NotStarted':
            self.status = 'InProgress'
    
        if self.start_time and self.end_time:
            duration_days = (self.end_time - self.start_time).days + 1  
            if duration_days == 1:
                self.allocated_time = timedelta(hours=8)
            else:
                self.allocated_time = timedelta(hours=duration_days * 8) 

        if self.allocated_time and self.time_taken:
            allocated_seconds = self.allocated_time.total_seconds()
            time_taken_seconds = self.time_taken.total_seconds()
    
            if allocated_seconds > 0:
                self.percentage_completed = min(int((time_taken_seconds / allocated_seconds) * 100), 100)
            else:
                self.percentage_completed = 100

        if self.status == 'NotStarted' and self.project:
            self.project.status = 'InProgress'
            self.project.save()
        
        super().save(*args, **kwargs) 
            
        def __str__(self):
            return self.name
    
class TaskStatusRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True , null=True ,related_name="status_update")
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    date_of_request = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=[('Pending', 'Pending'), ('Approved', 'Approved'), ('Rejected', 'Rejected')],default='Pending')

    def __str__(self):
        return f"TaskStatusRequest #{self.pk} - {self.user.first_name} - {self.user.last_name}"
        
    def update_task_status(sender, instance, created, **kwargs):
        if not created:  
            if instance.status == 'Approved':
    
                instance.task.status = 'Completed'
                instance.task.save(update_fields=['status'])

    
class TaskHistory(models.Model):
    task_id = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="time_entries")
    Activty_name = models.CharField(max_length=50,default="new-Activity",null=True)
    time_spent = models.DurationField(default=timedelta) 
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        task = self.task_id
    
        if task.time_taken is None:
            task.time_taken = timedelta()
    
        total_seconds = (task.time_taken.total_seconds() + self.time_spent.total_seconds())
        hours = int(total_seconds // 3600)
        minutes = int((total_seconds % 3600) // 60)
        seconds = int(total_seconds % 60)
    
        task.time_taken = timedelta(hours=hours, minutes=minutes, seconds=seconds)
        task.save()
    
        project = task.project 
        if project.time_taken is None:
            project.time_taken = timedelta()
        total_seconds_project = (project.time_taken.total_seconds() + self.time_spent.total_seconds())
        hours_project = int(total_seconds_project // 3600)
        minutes_project = int((total_seconds_project % 3600) // 60)
        seconds_project = int(total_seconds_project % 60)
        project.time_taken = timedelta(hours=hours_project, minutes=minutes_project, seconds=seconds_project)
        project.save()
    
        super().save(*args, **kwargs)
             
class TaskTransferRequest(models.Model):
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True , null=True, related_name="task_transfer")
    transfer_to = models.ForeignKey(User,  on_delete=models.SET_NULL, blank=True , null=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    date_of_request = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=[('Pending', 'Pending'), ('Approved', 'Approved'), ('Rejected', 'Rejected')],default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Tansfer Request by {self.created_by.first_name} to {self.transfer_to.first_name}"
    

    