from django.urls import path
from . import views

urlpatterns = [
  path('get/', views.get_recursos),
  path('get_gen/', views.get_recursos_generados),
  path('get_mediciones/', views.get_mediciones),
  path('get_perfiles/', views.get_perfiles),
  path('post/', views.create_perfil),
  path('edit/<int:pk>/', views.edit_perfil),
  path('delete/<int:pk>/', views.delete_perfil),
]