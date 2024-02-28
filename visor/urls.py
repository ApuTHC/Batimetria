from django.urls import path
from . import views

urlpatterns = [
  path('eval_embalse/', views.eval_embalse),
  path('eval_perfil/', views.eval_perfil),
]