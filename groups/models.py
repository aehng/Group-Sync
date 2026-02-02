from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Group(models.Model):
    """
    Represents a group for collaborative work and messaging.
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, help_text="The name of the group")
    description = models.TextField(blank=True, help_text="A description of the group")
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_groups",
        help_text="The user who created the group"
    )
    members = models.ManyToManyField(
        User,
        related_name="user_groups",
        help_text="Members of the group"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Group"
        verbose_name_plural = "Groups"

    def __str__(self):
        return self.name
