# Generated with AI assistance

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    
    Converts incoming JSON data to a User object and validates:
    - Username is unique
    - Email is unique
    - Password is strong enough
    - Passwords match (password == password_confirm)
    """
    
    # Add password_confirm field (not part of User model)
    # write_only=True means it's only used for input, not returned in responses
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        # Use the User model
        model = User
        # Only allow these fields in registration
        fields = ['username', 'email', 'password', 'password_confirm']
        # password should be write-only (never return it in responses)
        extra_kwargs = {'password': {'write_only': True}}
    
    def validate_username(self, value):
        """
        Check if username is already taken.
        
        Called automatically when validating the 'username' field.
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def validate_email(self, value):
        """
        Check if email is already taken.
        
        Called automatically when validating the 'email' field.
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def validate_password(self, value):
        """
        Check if password is strong enough.
        
        Uses Django's built-in password validators:
        - At least 8 characters
        - Not a common password (like 'password123')
        - Not just numbers
        - Must contain mix of upper/lowercase, numbers, symbols
        """
        validate_password(value)  # Raises ValidationError if password is weak
        return value
    
    def validate(self, data):
        """
        Validate data across multiple fields.
        
        Called after individual field validations.
        Check here: do the two password fields match?
        """
        # Compare password and password_confirm
        if data['password'] != data['password_confirm']:
            # Raise error pointing to the password_confirm field
            raise serializers.ValidationError({'password_confirm': "Passwords don't match"})
        return data
    
    def create(self, validated_data):
        """
        Create and save the User to the database.
        
        Called when serializer.save() is invoked (after all validation passes).
        
        Args:
            validated_data: Cleaned, validated data from all validation methods
            
        Returns:
            user: The newly created User object
        """
        # Remove password_confirm before creating user
        # (User model doesn't have this field, only password)
        validated_data.pop('password_confirm')
        
        # Use create_user() to properly hash the password
        # DON'T use User.objects.create() — that won't hash the password!
        user = User.objects.create_user(**validated_data)
        return user
    

class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    
    Validates username and password.
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Validate username and password.
        
        Check if user with given username exists and password is correct.
        """
        username = (data.get('username') or '').strip()
        password = data.get('password')

        user = None

        if username and password:
            matched_user = User.objects.filter(username__iexact=username).first()
            auth_username = matched_user.username if matched_user else username
            user = authenticate(username=auth_username, password=password)

            if not user:
                email_user = User.objects.filter(email__iexact=username).first()
                if email_user:
                    user = authenticate(username=email_user.username, password=password)
        
        if not user:
            raise serializers.ValidationError("Invalid username or password")
        
        data['user'] = user  # Attach user object for use in views
        return data
    

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    Used to return user details in responses.
    Safe to include in API responses.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number']
        read_only_fields = ['id']
        # Only safe fields—no password, is_staff, etc.