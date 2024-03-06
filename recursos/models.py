from django.db import models
from django.utils import timezone
from empresas.models import Empresas
from proyectos.models import Proyectos
from proyectos.models import Embalses


class TipoRecurso(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=100)
    published_date = models.DateTimeField(blank=True, null=True)

    def publish(self):
        self.published_date = timezone.now()
        self.save()


class MetodosAdquisicion(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=100)
    published_date = models.DateTimeField(blank=True, null=True)

    def publish(self):
        self.published_date = timezone.now()
        self.save()


class Recursos(models.Model):
    id = models.AutoField(primary_key=True)
    id_empresa = models.ForeignKey(Empresas, on_delete=models.CASCADE)
    id_embalse = models.ForeignKey(Embalses, on_delete=models.CASCADE)
    id_tipo_recurso = models.ForeignKey(TipoRecurso, on_delete=models.CASCADE)
    id_metodo_adquisicion = models.ForeignKey(MetodosAdquisicion, on_delete=models.CASCADE)
    id_proyecto = models.ForeignKey(Proyectos, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    capa = models.CharField(max_length=100)
    ruta = models.CharField(max_length=100)
    env = models.CharField(max_length=100, null=True)
    nombre_file = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=100)
    fecha_adquisicion = models.DateTimeField(blank=True, null=True)
    published_date = models.DateTimeField(blank=True, null=True)

    def publish(self):
        self.published_date = timezone.now()
        self.save()


class RecursosGenerados(models.Model):
    id = models.AutoField(primary_key=True)
    id_empresa = models.ForeignKey(Empresas, on_delete=models.CASCADE)
    id_embalse = models.ForeignKey(Embalses, on_delete=models.CASCADE)
    id_tipo_recurso = models.ForeignKey(TipoRecurso, on_delete=models.CASCADE)
    # id_usuario = models.ForeignKey(settings.AUTH_USER_MODEL,null=True, blank=True, on_delete=models.CASCADE)
    id_recurso_1 = models.ForeignKey(Recursos, related_name='recurso_generado_1', on_delete=models.CASCADE)
    id_recurso_2 = models.ForeignKey(Recursos, related_name='recurso_generado_2', on_delete=models.CASCADE)
    env = models.CharField(max_length=100)
    nombre = models.CharField(max_length=100)
    capa = models.CharField(max_length=100)
    ruta = models.CharField(max_length=100)
    nombre_file = models.CharField(max_length=100)
    published_date = models.DateTimeField(blank=True, null=True)

    def publish(self):
        self.published_date = timezone.now()
        self.save()


class Perfiles(models.Model):
    id = models.AutoField(primary_key=True)
    id_empresa = models.ForeignKey(Empresas, on_delete=models.CASCADE, null=True)
    id_embalse = models.ForeignKey(Embalses, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    proyectos = models.CharField(max_length=100)
    ukey = models.CharField(max_length=100)
    img = models.CharField(max_length=100)
    geojson = models.TextField(blank=True, null=True)
    nombres = models.TextField()
    dems = models.TextField()
    ids = models.TextField()

    published_date = models.DateTimeField(blank=True, null=True)

    def publish(self):
        self.published_date = timezone.now()
        self.save()
