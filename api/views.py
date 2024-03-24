from rest_framework import status
from .models import User, Service
from .serializers import UserSerializer, LoginSerializer, ServiceSerializer
from django.contrib.auth import authenticate
from django.db import DatabaseError
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token


# class ServiceView(generics.CreateAPIView):
#     queryset = Service.objects.all()
#     serializer_class = ServiceSerializer
#
#
# class ServiceListView(generics.ListAPIView):
#     queryset = Service.objects.all()
#     serializer_class = ServiceSerializer


class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        email = request.data.get('email')
        if email and User.objects.filter(email=email).exists():
            return Response({'message': 'This email already exists.'}, status=status.HTTP_409_CONFLICT)
        try:
            response = super().create(request, *args, **kwargs)
            email = response.data['email']
            user = User.objects.get(email=email)
            user.set_password(request.data.get('password'))
            user.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_201_CREATED)
        except DatabaseError:
            return Response({'message': 'Database error!'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginAPIView(APIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data.get('email')
        password = serializer.validated_data.get('password')
        user = authenticate(username=email, password=password)

        if not user:
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        # This assumes you have set the TokenAuthentication in your settings file
        token, _ = Token.objects.get_or_create(user=user)

        return Response({'token': token.key}, status=status.HTTP_200_OK)
