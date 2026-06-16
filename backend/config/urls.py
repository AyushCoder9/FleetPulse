from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/v1/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/', include('apps.organizations.urls')),
    path('api/v1/', include('apps.vehicles.urls')),
    path('api/v1/', include('apps.suppliers.urls')),
    path('api/v1/', include('apps.invoices.urls')),
    path('api/v1/', include('apps.anomalies.urls')),
    path('api/v1/', include('apps.dashboard.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
]
