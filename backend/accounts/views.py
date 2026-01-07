from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken


class Register(APIView):
    """
    POST /api/auth/register/
    Body: { "username": "", "password": "", "email": "" }

    ✅ Creates an active user
    ✅ Validates password using Django's validators
    ✅ Returns JWT tokens so user is logged in immediately
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = (request.data.get("username") or "").strip()
        password = request.data.get("password") or ""
        email = (request.data.get("email") or "").strip()

        if not username or not password:
            return Response(
                {"detail": "username and password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "username already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Optional: prevent duplicate emails (if provided)
        if email and User.objects.filter(email=email).exists():
            return Response(
                {"detail": "email already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate password strength (uses AUTH_PASSWORD_VALIDATORS in settings.py)
        try:
            validate_password(password)
        except Exception as e:
            # e.messages is a list of validation messages
            return Response(
                {"detail": e.messages[0] if hasattr(e, "messages") and e.messages else "Invalid password"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            is_active=True,
        )

        # ✅ Create JWT tokens (so they don't get "No active account..." after registering)
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )
