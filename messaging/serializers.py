"""Serializers for the messaging app.

This module provides serializers for the Message model as well as nested
representations for the related User and Group models. The serializer
supports creating messages by accepting `group_id` and optionally
`sender_id` (falls back to request.user when available).
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from groups.models import Group
from .models import Message

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        read_only_fields = ["id"]


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id", "name", "description"]
        read_only_fields = ["id"]


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model. Uses `sender` and `content` to match model."""
    sender = UserSerializer(read_only=True)
    sender_id = serializers.IntegerField(write_only=True, required=False)
    group = GroupSerializer(read_only=True)
    group_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "group",
            "group_id",
            "sender",
            "sender_id",
            "content",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "sender", "group"]

    def validate_group_id(self, value):
        try:
            Group.objects.get(id=value)
        except Group.DoesNotExist:
            raise serializers.ValidationError("Group does not exist.")
        return value

    def validate_sender_id(self, value):
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Sender does not exist.")
        return value

    def create(self, validated_data):
        group_id = validated_data.pop("group_id")
        sender_id = validated_data.pop("sender_id", None)

        # If sender_id not provided, try to get from context user
        if sender_id is None and self.context.get("request"):
            sender = getattr(self.context["request"], "user", None)
            if sender and sender.is_authenticated:
                sender_id = sender.id

        message = Message.objects.create(group_id=group_id, sender_id=sender_id, **validated_data)
        return message
