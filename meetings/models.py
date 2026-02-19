from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone

def validate_future_date(value):
    if value < timezone.now():
        raise ValidationError("The meeting cannot be scheduled in the past!")

class Group(models.Model):
    name = models.CharField(max_length=100)
    
    # FIX: Use settings.AUTH_USER_MODEL instead of User
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name="app_groups"
    )

    def __str__(self):
        return self.name

class Meeting(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="meetings")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    
    start_time = models.DateTimeField(validators=[validate_future_date]) # Add the validator here
    end_time = models.DateTimeField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    # FIX: Use settings.AUTH_USER_MODEL here too
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.title} ({self.group.name})"