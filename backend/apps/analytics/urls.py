from django.urls import path

from .views import FleetHealthView, SpendTrendView

urlpatterns = [
    path('spend-trend/', SpendTrendView.as_view(), name='analytics-spend-trend'),
    path('fleet-health/', FleetHealthView.as_view(), name='analytics-fleet-health'),
]
