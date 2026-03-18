from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

def validate_future_date(value):
    if value < timezone.now():
        raise ValidationError("The meeting cannot be scheduled in the past!")

class Meeting(models.Model):
    group = models.ForeignKey("groups.Group", on_delete=models.CASCADE, related_name="meetings")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location_or_link = models.CharField(max_length=255, blank=True)
    agenda = models.TextField(blank=True)
    
    start_time = models.DateTimeField(validators=[validate_future_date])
    end_time = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.title} ({self.group.name})"
