import uuid

from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import secrets

User = get_user_model()


def validate_group_name(value):
    """Validator to ensure group name is not empty and max 100 characters."""
    if not value or not value.strip():
        raise ValidationError("Group name cannot be empty.")
    if len(value) > 100:
        raise ValidationError("Group name cannot exceed 100 characters.")


def generate_invite_code():
    return uuid.uuid4().hex[:8]


class Group(models.Model):
    """
    Represents a group for collaborative work and messaging.
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(
        max_length=100,
        validators=[validate_group_name],
        help_text="The name of the group (max 100 characters)"
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="owned_groups",
        help_text="The owner of the group"
    )
    invite_code = models.CharField(
        max_length=8,
        unique=True,
        default='',
        help_text="Unique invite code for joining the group"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Group"
        verbose_name_plural = "Groups"

    def save(self, *args, **kwargs):
        if not self.invite_code:
            self.invite_code = generate_invite_code()
            while Group.objects.filter(invite_code=self.invite_code).exists():
                self.invite_code = generate_invite_code()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Auto-generate invite code if not set."""
        if not self.invite_code:
            self.invite_code = self.generate_invite_code()
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_invite_code():
        """Generate a unique 8-character alphanumeric invite code."""
        return secrets.token_hex(4).upper()


class GroupMember(models.Model):
    """
    Represents the membership of a user in a group with a specific role.
    """
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('member', 'Member'),
    ]

    id = models.AutoField(primary_key=True)
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name="members",
        help_text="The group this membership belongs to"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="group_memberships",
        help_text="The user who is a member of the group"
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='member',
        help_text="The role of the user in the group"
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('group', 'user')
        ordering = ['-joined_at']
        verbose_name = "Group Member"
        verbose_name_plural = "Group Members"

    def __str__(self):
        return f"{self.user.username} - {self.group.name} ({self.role})"
# test-change
