from rest_framework.routers import DefaultRouter

from .views import ContractRateViewSet, SupplierViewSet

router = DefaultRouter()
router.register('suppliers', SupplierViewSet, basename='supplier')
router.register('contract-rates', ContractRateViewSet, basename='contractrate')

urlpatterns = router.urls
