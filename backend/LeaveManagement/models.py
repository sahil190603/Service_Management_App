from django.db import models
from django.contrib.auth import get_user_model
from datetime import datetime , time
from django.core.exceptions import ValidationError

User = get_user_model()


class LeaveRequest(models.Model):    
    TYPES = (
        ('Casual Leave', 'Casual Leave'),
        ('Sick leave', 'Sick leave'),
        ('Leave without Pay', 'Leave without Pay'),
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True , blank=True)
    leave_type = models.CharField(max_length=20, choices=TYPES)  
    start_date = models.DateField()
    end_date = models.DateField()
    date_of_request = models.DateTimeField(auto_now_add=True)
    reason = models.TextField()
    status = models.CharField(max_length=50, choices=[('Pending', 'Pending'), ('Approved', 'Approved'), ('Rejected', 'Rejected')],default='Pending') 

    # def clean(self):
    #     if self.status == 'Rejected':
    #         return
        
    #     from tasks.models import Task

    #     start_datetime = datetime.combine(self.start_date, time.min)
    #     end_datetime = datetime.combine(self.end_date, time.max)

    #     conflicting_tasks = Task.objects.filter(
    #         assigned_to=self.user,
    #         start_time__lte=end_datetime,  
    #         end_time__gte=start_datetime     
    #     )
        
    #     if conflicting_tasks.exists():
    #         raise ValidationError("You have tasks assigned during the requested leave period.")
        
    #     if self.status == 'Approved':
    #         return
        
    #     existing_leaves = LeaveRequest.objects.filter(
    #         user=self.user,
    #         start_date__lte=self.end_date,   
    #         end_date__gte=self.start_date      
    #     ).exclude(status='Rejected')

    #     if existing_leaves.exists():
    #         raise ValidationError("You already have a leave request that overlaps with the requested dates.")
    def clean(self):
        if self.status == 'Rejected':
            return
        
        from tasks.models import Task
    
        start_datetime = datetime.combine(self.start_date, time.min)
        end_datetime = datetime.combine(self.end_date, time.max)
    
        conflicting_tasks = Task.objects.filter(
            assigned_to=self.user,
            start_time__lte=end_datetime,  
            end_time__gte=start_datetime     
        )
        
        if conflicting_tasks.exists():
            raise ValidationError("You have tasks assigned during the requested leave period.")
        
        if self.status == 'Approved':
            return

        existing_leaves = LeaveRequest.objects.filter(
            user=self.user,
            start_date__lte=self.end_date,
            end_date__gte=self.start_date,
        ).exclude(status='Rejected').exclude(pk=self.pk) 
    
        if existing_leaves.exists():
            raise ValidationError("You already have a leave request that overlaps with the requested dates.")


    def save(self, *args, **kwargs):
        self.clean()  
        super().save(*args, **kwargs)

    def __str__(self):
        return f"LeaveRequest #{self.pk} - {self.user.first_name}"