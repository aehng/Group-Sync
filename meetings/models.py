from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Meeting(models.Model): 
    title = models.CharField(max_length=200) 
    description = models.TextField(blank=True) 
    date = models.DateField() 
    start_time = models.TimeField() 
    end_time = models.TimeField() 
    location = models.CharField(max_length=255, blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
