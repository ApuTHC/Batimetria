from django.contrib import admin
from .models import TipoRecurso, MetodosAdquisicion, Recursos, RecursosGenerados, Perfiles

admin.site.register(TipoRecurso)
admin.site.register(MetodosAdquisicion)
admin.site.register(Recursos)
admin.site.register(RecursosGenerados)
admin.site.register(Perfiles)
