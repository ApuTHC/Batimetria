from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),
    path('visor/', include('visor.urls')),
    # path('empresas/', include('empresas.urls')),
    path('proyectos/', include('proyectos.urls')),
    path('recursos/', include('recursos.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
