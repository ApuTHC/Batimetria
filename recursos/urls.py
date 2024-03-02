from django.urls import path
from . import views

urlpatterns = [
  path('get/', views.get_recursos),
  path('get_gen/', views.get_recursos_generados),
]