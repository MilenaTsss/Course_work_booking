from django.contrib.auth.hashers import check_password
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from .models import User, Service, Provider
from .serializers import RegisterSerializer, LoginSerializer, ChangePasswordSerializer, ServiceSerializer, \
    ServiceProviderSerializer, BookingSerializer, UserSerializer
from django.contrib.auth import authenticate
from django.db import DatabaseError
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token


class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid(raise_exception=True):
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = request.data.get('email')
        if email and User.objects.filter(email=email).exists():
            return Response({'message': 'This email already exists.'}, status=status.HTTP_409_CONFLICT)

        password = request.data.get('password')
        if not password:
            return Response({'message': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            self.perform_create(serializer)
            user = User.objects.get(email=serializer.data.get('email'))
            token, created = Token.objects.get_or_create(user=user)
            headers = self.get_success_headers(serializer.data)
            return Response({'token': token.key}, status=status.HTTP_201_CREATED, headers=headers)
        except DatabaseError:
            return Response({'message': 'Database error!'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_create(self, serializer):
        password = self.request.data.get('password', '')
        instance = serializer.save()
        if password:
            instance.set_password(password)
            instance.save()


class LoginAPIView(APIView):
    serializer_class = LoginSerializer

    def post(self, request):
        print(request.data)
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if not serializer.is_valid():
            print('lalalalala')
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(
            username=serializer.validated_data.get('email'),
            password=serializer.validated_data.get('password')
        )

        if not user:
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)

        return Response({'token': token.key}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        old_password = serializer.validated_data.get("old_password")
        new_password = serializer.validated_data.get("new_password")

        if not check_password(old_password, request.user.password):
            return Response({"old_password": ["Invalid old password."]}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_password)
        request.user.save()

        return Response({"success": "Password changed successfully"}, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(instance=self.get_object(), data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ServicesView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceSerializer

    def get(self, request):
        return Response(request.user)

    def post(self, request):
        return Response(request.user)

    def patch(self, request):
        return Response(request.user)


class ServiceView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceSerializer

    def get(self, request):
        return Response(request.user)

    def delete(self, request):
        return Response(request.user)


class ProvidersView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceProviderSerializer

    def get(self, request):
        return Response(request.user)

    def post(self, request):
        return Response(request.user)

    def patch(self, request):
        return Response(request.user)


class ProviderView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceProviderSerializer

    def get(self, request):
        return Response(request.user)

    def delete(self, request):
        return Response(request.user)


# class ProviderView(generics.CreateAPIView):
#     queryset = Provider.objects.all()
#     serializer_class = ServiceProviderSerializer
#
#
# class ProviderListView(generics.ListAPIView):
#     queryset = Provider.objects.all()
#     serializer_class = ServiceProviderSerializer


class BookingsView(APIView):
    serializer_class = BookingSerializer

    def get(self, request):
        return Response(request.user)

    def post(self, request):
        return Response(request.user)

    def patch(self, request):
        return Response(request.user)


class BookingView(APIView):
    serializer_class = BookingSerializer

    def get(self, request):
        return Response(request.user)

    def delete(self, request):
        return Response(request.user)


class AvailabilityView(APIView):
    def get(self, request):
        return Response()


class ReviewView(APIView):
    def post(self, request):
        return Response()
