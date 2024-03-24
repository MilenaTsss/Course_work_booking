from rest_framework import serializers
from .models import Service, Provider, User


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["name", "description", "execution_duration"]


class ServiceProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provider
        fields = ["first_name", "last_name", "is_active"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', "email", "password", "first_name", "last_name", "company_name", "user_type"]
        extra_kwargs = {'password': {'write_only': True}}


class LoginSerializer(serializers.Serializer):
    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    email = serializers.EmailField()
    password = serializers.CharField()
