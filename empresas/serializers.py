from rest_framework import serializers
from . models import Empresas

class EmpresasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresas
        fields = '__all__'

