from rest_framework import viewsets, permissions
from .models import AnomalyFlag, IdleEvent
from .serializers import AnomalyFlagSerializer, IdleEventSerializer


class AnomalyFlagViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AnomalyFlagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AnomalyFlag.objects.filter(
            invoice__organization__memberships__user=self.request.user
        )


class IdleEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = IdleEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return IdleEvent.objects.filter(
            vehicle__organization__memberships__user=self.request.user
        )
