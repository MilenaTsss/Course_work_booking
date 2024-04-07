from django.contrib.auth.hashers import check_password
from django.db.models import ProtectedError
from rest_framework.permissions import IsAuthenticated

from .models import User, Service, CUSTOMER, BUSINESS_ADMIN
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
            return Response({"old_password": ["Invalid old password."]}, status=status.HTTP_403_FORBIDDEN)

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
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceSerializer

    def get(self, request, *args, **kwargs):
        business_id = self.kwargs['business_id']
        user = User.objects.filter(id=business_id).first()

        if not user:
            return Response('Given business id not exists', status=status.HTTP_400_BAD_REQUEST)
        if user.user_type != BUSINESS_ADMIN:
            return Response('Given id is not a business id', status=status.HTTP_400_BAD_REQUEST)

        serializer = ServiceSerializer(Service.objects.filter(owner=business_id), many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        business_id = self.kwargs['business_id']
        user = User.objects.filter(id=business_id).first()

        if not user:
            return Response('Given business id not exists', status=status.HTTP_400_BAD_REQUEST)
        if user.user_type != BUSINESS_ADMIN:
            return Response('Given id is not a business id', status=status.HTTP_400_BAD_REQUEST)

        if request.user.id != business_id or request.user.user_type == CUSTOMER:
            return Response('Permission denied', status.HTTP_403_FORBIDDEN)

        service_data = request.data
        service_data['owner'] = request.user.id
        serializer = ServiceSerializer(data=service_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ServiceView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceSerializer

    def get(self, request, *args, **kwargs):
        business_id = self.kwargs['business_id']
        service_id = self.kwargs['service_id']

        user = User.objects.filter(id=business_id).first()

        if not user:
            return Response('Given business id not exists', status=status.HTTP_400_BAD_REQUEST)
        if user.user_type != BUSINESS_ADMIN:
            return Response('Given id is not a business id', status=status.HTTP_400_BAD_REQUEST)

        service = Service.objects.filter(id=service_id).first()

        if not service:
            return Response('Incorrect service id', status=status.HTTP_400_BAD_REQUEST)
        if service.owner_id != user.id:
            return Response('Service id is not for given business id', status=status.HTTP_400_BAD_REQUEST)

        return Response(ServiceSerializer(service).data)

    def patch(self, request, *args, **kwargs):
        business_id = self.kwargs['business_id']
        service_id = self.kwargs['service_id']

        user = User.objects.filter(id=business_id).first()

        if not user:
            return Response('Given business id not exists', status=status.HTTP_400_BAD_REQUEST)
        if user.user_type != BUSINESS_ADMIN:
            return Response('Given id is not a business id', status=status.HTTP_400_BAD_REQUEST)

        if request.user.id != business_id or request.user.user_type == CUSTOMER:
            return Response('Permission denied', status.HTTP_403_FORBIDDEN)

        service = Service.objects.filter(id=service_id).first()

        if not service:
            return Response('Incorrect service id', status=status.HTTP_400_BAD_REQUEST)
        if service.owner_id != user.id:
            return Response('Service id is not for given business id', status=status.HTTP_400_BAD_REQUEST)

        serializer = ServiceSerializer(service, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        business_id = self.kwargs['business_id']
        service_id = self.kwargs['service_id']

        user = User.objects.filter(id=business_id).first()

        if not user:
            return Response('Given business id not exists', status=status.HTTP_400_BAD_REQUEST)
        if user.user_type != BUSINESS_ADMIN:
            return Response('Given id is not a business id', status=status.HTTP_400_BAD_REQUEST)

        if request.user.id != business_id or request.user.user_type == CUSTOMER:
            return Response('Permission denied', status=status.HTTP_403_FORBIDDEN)

        service = Service.objects.filter(id=service_id).first()

        if not service:
            return Response('Incorrect service id', status=status.HTTP_400_BAD_REQUEST)
        if service.owner_id != user.id:
            return Response('Service id is not for given business id', status=status.HTTP_400_BAD_REQUEST)

        try:
            service.delete()
            return Response('Service deleted successfully', status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response('Deletion not allowed.', status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response('Unexpected error occurred: ' + str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProvidersView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceProviderSerializer

    def get(self, request):
        return Response(request.user)

    def post(self, request):
        return Response(request.user)


class ProviderView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceProviderSerializer

    def get(self, request):
        return Response(request.user)

    def patch(self, request):
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


class BookingView(APIView):
    serializer_class = BookingSerializer

    def get(self, request):
        return Response(request.user)

    def patch(self, request):
        return Response(request.user)

    def delete(self, request):
        return Response(request.user)


class AvailabilityView(APIView):
    def get(self, request):
        return Response()


class ReviewView(APIView):
    def post(self, request):
        return Response()
