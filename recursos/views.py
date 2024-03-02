from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from .models import Recursos, RecursosGenerados
from .serializers import RecursosSerializer, RecursosGeneradosSerializer


@api_view(['GET'])
def get_recursos(request):
    if request.user.is_staff:
        recursos = Recursos.objects.filter(id_empresa=request.user.id_empresa)
        serializer = RecursosSerializer(recursos, many=True)
        return Response(serializer.data)
    return (Response({'detail': 'Not authorized to create a product'}, status=status.HTTP_401_UNAUTHORIZED))


@api_view(['GET'])
def get_recursos_generados(request):
    if request.user.is_staff:
        recursos = RecursosGenerados.objects.filter(id_empresa=request.user.id_empresa)
        serializer = RecursosGeneradosSerializer(recursos, many=True)
        return Response(serializer.data)
    return Response({'detail': 'Not authorized to create a product'}, status=status.HTTP_401_UNAUTHORIZED)

