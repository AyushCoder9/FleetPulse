from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet, ContractRateViewSet

router = DefaultRouter()
router.register('suppliers', SupplierViewSet, basename='supplier')
router.register('contract-rates', ContractRateViewSet, basename='contractrate')

urlpatterns = router.urls
