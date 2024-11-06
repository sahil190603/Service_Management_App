from rest_framework import serializers
from .models import Task ,TaskHistory , TaskStatusRequest , TaskTransferRequest

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

class TaskHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskHistory
        fields = ['id', 'task_id','Activty_name','time_spent', 'created_at']


class TaskStatusRequestSerializers(serializers.ModelSerializer):
    class Meta:
        model = TaskStatusRequest
        fields = '__all__'

class TaskTransferRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskTransferRequest
        fields = '__all__'