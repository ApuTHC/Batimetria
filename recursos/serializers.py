from rest_framework import serializers
from . models import Recursos, RecursosGenerados, TipoRecurso, MetodosAdquisicion


class RecursosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recursos
        fields = '__all__'


class RecursosGeneradosSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecursosGenerados
        fields = '__all__'


class TipoRecursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoRecurso
        fields = '__all__'


class MetodosAdquisicionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetodosAdquisicion
        fields = '__all__'
