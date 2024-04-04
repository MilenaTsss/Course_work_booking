from rest_framework import serializers
from .models import Service, Provider, User, Booking


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name", "company_name", "user_type"]
        extra_kwargs = {"password": {"write_only": True, "required": True}}

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    email = serializers.CharField(required=True)
    password = serializers.CharField(required=True)


class ChangePasswordSerializer(serializers.Serializer):
    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "user_type", "email", "first_name", "last_name", "company_name"]
        extra_kwargs = {"user_type": {"read_only": True}, "email": {"read_only": True}}


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name", "owner", "description", "execution_duration"]
        extra_kwargs = {"name": {"required": True}, "execution_duration": {"required": True}, "id": {"read_only": True}}


class ServiceProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provider
        fields = ["first_name", "last_name", "is_active"]


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["customer", "service", "service_provider", "start_time"]
