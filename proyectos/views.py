from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from . models import Embalses
from . serializers import EmbalsesSerializer


@api_view(['GET'])
def get_embalses(request):
    if request.user.is_staff:
        embalses = Embalses.objects.filter(id_empresa=request.user.id_empresa)
        serializer = EmbalsesSerializer(embalses, many=True)
        return Response(serializer.data)
    return Response({'detail': 'Not authorized to create a product'}, status=status.HTTP_401_UNAUTHORIZED)
