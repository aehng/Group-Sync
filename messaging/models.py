from django.db import models
from django.conf import settings


class Message(models.Model):
    """
    Represents a message posted by a user in a group.
    
    Fields:
        - id: Auto-generated primary key
        - group: Foreign key to the Group the message belongs to
        - sender: Foreign key to the User who sent the message
        - content: The message text content
        - created_at: Timestamp when the message was created (auto-set)
    """
    id = models.AutoField(primary_key=True)
    group = models.ForeignKey(
        "groups.Group",
        on_delete=models.CASCADE,
        related_name="messages",
        help_text="The group this message belongs to"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
        help_text="The user who sent this message"
    )
    content = models.TextField(
        help_text="The content of the message"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the message was created"
    )

    class Meta:
        ordering = ["created_at"]
        verbose_name = "Message"
        verbose_name_plural = "Messages"

    def __str__(self):
        """Return a string representation of the message."""
        return f"{self.sender.username}: {self.content[:50]}..."
