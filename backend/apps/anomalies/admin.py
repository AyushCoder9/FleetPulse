from django.contrib import admin
from .models import AnomalyFlag, IdleEvent

admin.site.register(AnomalyFlag)
admin.site.register(IdleEvent)
