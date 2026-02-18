from django.db import models
<<<<<<< HEAD
from django.contrib.auth import get_user_model

User = get_user_model()
=======
from django.conf import settings
>>>>>>> dfce4a5ee6a705bc4060e875c268a2db95c0d6d0

class Meeting(models.Model): 
    title = models.CharField(max_length=200) 
    description = models.TextField(blank=True) 
    date = models.DateField() 
    start_time = models.TimeField() 
    end_time = models.TimeField() 
    location = models.CharField(max_length=255, blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)
<<<<<<< HEAD
    author = models.ForeignKey(User, on_delete=models.CASCADE)
=======
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
>>>>>>> dfce4a5ee6a705bc4060e875c268a2db95c0d6d0
