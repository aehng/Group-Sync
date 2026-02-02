from rest_framework import serializers
from django.contrib.auth import get_user_model
from groups.models import Group
from .models import Message

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model - used for nested author info"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class GroupSerializer(serializers.ModelSerializer):
    """Serializer for Group model - used for nested group info"""
    class Meta:
        model = Group
        fields = ['id', 'name', 'description']
        read_only_fields = ['id']


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for Message model.
    Includes nested User and Group information.
    """
    author = UserSerializer(read_only=True)
    author_id = serializers.IntegerField(write_only=True)
    group = GroupSerializer(read_only=True)
    group_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Message
        fields = [
            'id',
            'group',
            'group_id',
            'author',
            'author_id',
            'content',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'author', 'group']

    def validate_group_id(self, value):
        """Validate that the group exists"""
        try:
            Group.objects.get(id=value)
        except Group.DoesNotExist:
            raise serializers.ValidationError("Group does not exist.")
        return value

    def validate_author_id(self, value):
        """Validate that the author exists"""
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Author does not exist.")
        return value

    def create(self, validated_data):
        """Create a message with the provided data"""
        group_id = validated_data.pop('group_id')
        author_id = validated_data.pop('author_id')
        
        message = Message.objects.create(
            group_id=group_id,
            author_id=author_id,
            **validated_data
        )
        return message
