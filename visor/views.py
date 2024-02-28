from django.http import JsonResponse

from . import spatial_analytics


def eval_embalse(request):
    response = spatial_analytics.eval_embalse(request.POST, request.user)
    return JsonResponse(response)


def eval_perfil(request):
    response = spatial_analytics.eval_perfil(request.POST)
    return JsonResponse(response, safe=False)

