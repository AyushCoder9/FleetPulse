from django.urls import path

from .views import FleetHealthView, MonthlyStatsView, SpendTrendView

urlpatterns = [
    path('spend-trend/', SpendTrendView.as_view(), name='analytics-spend-trend'),
    path('fleet-health/', FleetHealthView.as_view(), name='analytics-fleet-health'),
    path('monthly-stats/', MonthlyStatsView.as_view(), name='analytics-monthly-stats'),
]
