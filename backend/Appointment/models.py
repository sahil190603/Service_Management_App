from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone

User = get_user_model()

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
        ('Cancelled', 'Cancelled'),
        ('Completed', 'Completed')
    ]

    creator = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='created_appointments', null=True , blank=True)
    admin = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='admin_appointments', null=True , blank=True)
    name = models.CharField(max_length=50 , null=True)
    description = models.TextField(blank=True, null=True)
    start_time = models.DateTimeField(null=True)
    end_time = models.DateTimeField(null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending', null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    Marked_As_done =  models.BooleanField(default=False)
    Marked_As_done_time = models.DateTimeField(null=True, blank=True)

    def clean(self):
        if self.end_time <= self.start_time:
            raise ValidationError("End time must be after start time.")

        overlapping_appointments = Appointment.objects.filter(
            admin=self.admin,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time
        ).exclude(pk=self.pk)  

        if overlapping_appointments.exists():
            raise ValidationError("Admin has another appointment during the selected time.")

    def save(self, *args, **kwargs):
        
        if self.status == "Accepted":
            self.Marked_As_done = False
            self.Marked_As_done_time = None

        if self.Marked_As_done and not self.Marked_As_done_time:
            self.Marked_As_done_time = timezone.now()

        self.clean()  


        super().save(*args, **kwargs)




