from rest_framework import serializers
from . models import Embalses, Proyectos


class EmbalsesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Embalses
        fields = '__all__'


class ProyectosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proyectos
        fields = '__all__'

