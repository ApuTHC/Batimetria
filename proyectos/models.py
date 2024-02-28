from django.db import models
from django.utils import timezone
from empresas.models import Empresas


class Embalses(models.Model):
    id = models.AutoField(primary_key=True)
    id_empresa = models.ForeignKey(Empresas, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    area = models.FloatField()
    longitud = models.FloatField()
    latitud = models.FloatField()
    published_date = models.DateTimeField(blank=True, null=True)

    def publish(self):
        self.published_date = timezone.now()
        self.save()


class Proyectos(models.Model):
    id = models.AutoField(primary_key=True)
    id_empresa = models.ForeignKey(Empresas, on_delete=models.CASCADE)
    id_embalse = models.ForeignKey(Embalses, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    fecha_inicio = models.DateTimeField(blank=True, null=True)
    fecha_fin = models.DateTimeField(blank=True, null=True)
    published_date = models.DateTimeField(blank=True, null=True)

    def publish(self):
        self.published_date = timezone.now()
        self.save()


