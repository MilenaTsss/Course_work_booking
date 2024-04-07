from django.contrib.auth.hashers import check_password
from rest_framework.exceptions import ValidationError, PermissionDenied, APIException
from rest_framework.permissions import IsAuthenticated

from .models import User, Service, CUSTOMER, BUSINESS_ADMIN, Provider
from .serializers import RegisterSerializer, LoginSerializer, ChangePasswordSerializer, ServiceSerializer, \
    ProviderSerializer, BookingSerializer, UserSerializer
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
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if User.objects.filter(email=request.data.get('email')).exists():
            return Response({'message': 'This email already exists.'}, status=status.HTTP_409_CONFLICT)

        try:
            user = self.perform_create(serializer)
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
        return instance


class LoginAPIView(APIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

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

    def change_password(self, user, new_password):
        user.set_password(new_password)
        user.save()

    def post(self, request):
        serializer = self.serializer_class(data=request.data)

        serializer.is_valid(raise_exception=True)

        old_password = serializer.validated_data.get("old_password")
        new_password = serializer.validated_data.get("new_password")

        if not check_password(old_password, request.user.password):
            return Response({"detail": "Invalid old password."}, status=status.HTTP_403_FORBIDDEN)

        self.change_password(request.user, new_password)

        return Response({"success": "Password changed successfully"}, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(instance=self.get_object(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()


def get_user(business_id):
    user = User.objects.filter(id=business_id).first()
    if not user or user.user_type != BUSINESS_ADMIN:
        raise ValidationError('Invalid business id')
    return user


def get_service(business_id, service_id):
    service = Service.objects.filter(id=service_id).first()
    if not service or service.owner_id != business_id:
        raise ValidationError('Incorrect service id')

    return service


def get_provider(business_id, provider_id):
    provider = Provider.objects.filter(id=provider_id).first()
    if not provider or provider.owner_id != business_id:
        raise ValidationError('Incorrect provider id')

    return provider


def check_user_permissions(request, user):
    if request.user.id != user.id or request.user.user_type == CUSTOMER:
        raise PermissionDenied('Permission denied')


class ServicesView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceSerializer

    def get(self, request, *args, **kwargs):
        business_id = self.kwargs['business_id']
        user = get_user(business_id)
        serializer = self.serializer_class(Service.objects.filter(owner=user, is_active=True), many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        business_id = self.kwargs['business_id']
        user = get_user(business_id)
        check_user_permissions(request, user)

        service_data = request.data
        service_data['owner'] = request.user.id
        serializer = self.serializer_class(data=service_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ServiceView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceSerializer

    def get(self, request, *args, **kwargs):
        business_id, service_id = self.kwargs['business_id'], self.kwargs['service_id']
        user, service = get_user(business_id), get_service(business_id, service_id)
        return Response(ServiceSerializer(service).data)

    def patch(self, request, *args, **kwargs):
        business_id, service_id = self.kwargs['business_id'], self.kwargs['service_id']
        user, service = get_user(business_id), get_service(business_id, service_id)
        check_user_permissions(request, user)

        serializer = ServiceSerializer(service, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        business_id, service_id = self.kwargs['business_id'], self.kwargs['service_id']
        user, service = get_user(business_id), get_service(business_id, service_id)
        check_user_permissions(request, user)

        try:
            service.is_active = False
            service.save()
            return Response('Service deactivated successfully', status=status.HTTP_200_OK)
        except Exception as e:
            raise APIException('Unexpected error occurred: ' + str(e))


class ProvidersView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProviderSerializer

    def get(self, request, *args, **kwargs):
        business_id = self.kwargs['business_id']
        user = get_user(business_id)
        serializer = self.serializer_class(Provider.objects.filter(owner=user, is_active=True), many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        business_id = self.kwargs['business_id']
        user = get_user(business_id)
        check_user_permissions(request, user)

        provider_data = request.data
        provider_data['owner'] = request.user.id
        serializer = self.serializer_class(data=provider_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProviderView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProviderSerializer

    def get(self, request, *args, **kwargs):
        business_id, provider_id = self.kwargs['business_id'], self.kwargs['provider_id']
        user, provider = get_user(business_id), get_provider(business_id, provider_id)
        return Response(ProviderSerializer(provider).data)

    def patch(self, request, *args, **kwargs):
        business_id, provider_id = self.kwargs['business_id'], self.kwargs['provider_id']
        user, provider = get_user(business_id), get_provider(business_id, provider_id)
        check_user_permissions(request, user)

        serializer = ProviderSerializer(provider, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        business_id, provider_id = self.kwargs['business_id'], self.kwargs['provider_id']
        user, provider = get_user(business_id), get_provider(business_id, provider_id)
        check_user_permissions(request, user)

        try:
            provider.is_active = False
            provider.save()
            return Response('Provider deactivated successfully', status=status.HTTP_200_OK)
        except Exception as e:
            raise APIException('Unexpected error occurred: ' + str(e))


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
