from django.db import models
from django.conf import settings

class Meeting(models.Model): 
    title = models.CharField(max_length=200) 
    description = models.TextField(blank=True) 
    date = models.DateField() 
    start_time = models.TimeField() 
    end_time = models.TimeField() 
    location = models.CharField(max_length=255, blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
