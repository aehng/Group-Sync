import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import *
from rest_framework.permissions import IsAuthenticated

logger = logging.getLogger(__name__)

# Create your views here.

class RegisterView(APIView):
    """
    User Registration Endpoint
    
    Allows new users to create an account in the system.
    Returns JWT access and refresh tokens on successful registration.
    
    Required fields: username, email, password, password_confirm
    Returns: user data, access token, refresh token
    """
    
    def post(self, request):
        """
        Create a new user account.
        
        Request body:
        - username: string (required, unique)
        - email: string (required, unique, valid email format)
        - password: string (required, min 8 characters)
        - password_confirm: string (required, must match password)
        
        Returns:
        - 201 CREATED: User created successfully with tokens
        - 400 BAD REQUEST: Validation error (username/email taken, passwords don't match, etc.)
        """
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            logger.info(f"User registered successfully: {user.username}")

            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        
        logger.warning(f"Registration failed for email {request.data.get('email')}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class LoginView(APIView):
    """
    User Login Endpoint
    
    Authenticates existing users and returns JWT tokens.
    
    Required fields: username (or email), password
    Returns: user data, access token, refresh token
    """
    
    def post(self, request):
        """
        Authenticate a user and generate tokens.
        
        Request body:
        - username: string (required, can be username or email)
        - password: string (required)
        
        Returns:
        - 200 OK: Login successful with tokens and user data
        - 401 UNAUTHORIZED: Invalid credentials
        """
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            logger.info(f"User logged in successfully: {user.username}")

            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        
        logger.warning(f"Login failed for username {request.data.get('username')}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

class UserProfileView(APIView):
    """
    User Profile Endpoint
    
    Allows authenticated users to view and update their profile information.
    
    GET: Retrieve current user's profile
    PUT: Update current user's profile (partial updates allowed)
    
    Authentication: JWT token required
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get the current authenticated user's profile.
        
        Headers:
        - Authorization: Bearer <access_token>
        
        Returns:
        - 200 OK: User profile data
        - 401 UNAUTHORIZED: Invalid or missing token
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        """
        Update the current authenticated user's profile.
        
        Headers:
        - Authorization: Bearer <access_token>
        
        Request body (all fields optional for partial update):
        - username: string (unique)
        - email: string (unique, valid email)
        - bio: string
        - profile_picture: string (URL)
        
        Returns:
        - 200 OK: Updated user profile
        - 400 BAD REQUEST: Validation error
        - 401 UNAUTHORIZED: Invalid or missing token
        """
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class LogoutView(APIView):
    """
    User Logout Endpoint
    
    Invalidates the refresh token by adding it to the blacklist.
    Client should also clear tokens from local storage.
    
    Authentication: JWT token required
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Logout the current user by blacklisting their refresh token.
        
        Headers:
        - Authorization: Bearer <access_token>
        
        Request body:
        - refresh: string (required, the refresh token to blacklist)
        
        Returns:
        - 205 RESET CONTENT: Logout successful
        - 400 BAD REQUEST: Missing refresh token or blacklist failed
        - 401 UNAUTHORIZED: Invalid or missing access token
        """
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                logger.warning(f"Logout failed: no refresh token provided by user {request.user.username}")
                return Response({"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            logger.info(f"User logged out successfully: {request.user.username}")

            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            logger.error(f"Logout error for user {request.user.username}: {str(e)}")
            return Response({"error": "Failed to logout."}, status=status.HTTP_400_BAD_REQUEST)
        