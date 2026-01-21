from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MaxLengthValidator
from groups.models import Group

User = get_user_model()

class Task(models.Model):
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('doing', 'Doing'),
        ('done', 'Done'),
    ]
    
    id = models.AutoField(primary_key=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(
        max_length=200,
        blank=False,
        help_text="Task title (required, max 200 characters)"
    )
    description = models.TextField(
        blank=True,
        validators=[MaxLengthValidator(2000)],
        help_text="Task description (optional, max 2000 characters)"
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='todo')
    due_date = models.DateTimeField(null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']