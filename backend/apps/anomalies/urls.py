from rest_framework.routers import DefaultRouter

from .views import AnomalyFlagViewSet, IdleEventViewSet

router = DefaultRouter()
router.register('anomaly-flags', AnomalyFlagViewSet, basename='anomalyflag')
router.register('idle-events', IdleEventViewSet, basename='idleevent')

urlpatterns = router.urls
