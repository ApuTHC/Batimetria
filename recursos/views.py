from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from . models import Recursos
from . serializers import RecursosSerializer


@api_view(['GET'])
def get_recursos(request):
    if request.user.is_staff:
        recursos = Recursos.objects.filter(id_empresa=request.user.id_empresa)
        serializer = RecursosSerializer(recursos, many=True)
        print(serializer.data)
        return Response(serializer.data)
    return Response({'detail': 'Not authorized to create a product'}, status=status.HTTP_401_UNAUTHORIZED)

