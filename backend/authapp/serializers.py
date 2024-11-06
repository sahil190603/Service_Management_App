from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Roles , CustomUser


User = get_user_model()

class RolesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id','first_name', 'last_name', 'email','contact_no' , 'role' ,'Profile','password')

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        
        user = super().create(validated_data)

        if password:
            user.set_password(password) 
            user.save() 
        return user

