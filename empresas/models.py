from django.db import models
from django.utils import timezone


class Empresas(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    emal_contacto = models.CharField(max_length=100)
    telefono_contacto = models.CharField(max_length=100)
    published_date = models.DateTimeField(blank=True, null=True)

    def publish(self):
        self.published_date = timezone.now()
        self.save()

