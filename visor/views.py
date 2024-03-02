from rest_framework.response import Response
from rest_framework.decorators import api_view

from recursos.serializers import RecursosGeneradosSerializer
from . import spatial_analytics


@api_view(['POST'])
def eval_embalse(request):
    recurso_generado_obj = spatial_analytics.eval_embalse(request.data)
    if not recurso_generado_obj['existe']:
        del recurso_generado_obj['existe']
        recurso_generado_serializer = RecursosGeneradosSerializer(data=recurso_generado_obj)
        if recurso_generado_serializer.is_valid():
            recurso_generado_serializer.save()
            print(recurso_generado_serializer.data)
        return Response(recurso_generado_serializer.data)
    else:
        return Response({'detail': 'Este producto ya existe'})


@api_view(['POST'])
def eval_perfil(request):
    response = spatial_analytics.eval_perfil(request.POST)
    # return JsonResponse(response, safe=False)

