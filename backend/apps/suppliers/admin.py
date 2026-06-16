from django.contrib import admin

from .models import ContractRate, Supplier

admin.site.register(Supplier)
admin.site.register(ContractRate)
