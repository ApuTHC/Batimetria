from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from .models import Recursos, RecursosGenerados, Perfiles, Mediciones
from .serializers import RecursosSerializer, RecursosGeneradosSerializer, PerfilesSerializer, MedicionesSerializer


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


@api_view(['GET'])
def get_mediciones(request):
    if request.user.is_staff:
        mediciones = Mediciones.objects.filter(id_empresa=request.user.id_empresa)
        serializer = MedicionesSerializer(mediciones, many=True)
        return Response(serializer.data)
    return Response({'detail': 'Not authorized to create a product'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def get_perfiles(request):
    if request.user.is_staff:
        recursos = Perfiles.objects.filter(id_empresa=request.user.id_empresa)
        serializer = PerfilesSerializer(recursos, many=True)
        return Response(serializer.data)
    return Response({'detail': 'Not authorized to create a product'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def create_perfil(request):
    serializer = PerfilesSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(id_empresa=request.user.id_empresa)
        print(serializer.data)
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['PUT'])
def edit_perfil(request, pk):
    perfil = Perfiles.objects.get(pk=pk)
    serializer = PerfilesSerializer(perfil, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['DELETE'])
def delete_perfil(pk):
    product = Perfiles.objects.get(pk=pk)
    product.delete()
    return Response({'detail': 'Product deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


