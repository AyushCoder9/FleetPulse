from typing import Any, Generic, Type, TypeVar

from django.db import models

T = TypeVar('T', bound=models.Model)


class BaseRepository(Generic[T]):
    model: Type[T]

    def get_by_id(self, id: int) -> T:
        return self.model.objects.get(pk=id)

    def filter(self, **kwargs: Any):
        return self.model.objects.filter(**kwargs)

    def all(self):
        return self.model.objects.all()

    def create(self, **kwargs: Any) -> T:
        return self.model.objects.create(**kwargs)

    def update(self, instance: T, **kwargs: Any) -> T:
        for k, v in kwargs.items():
            setattr(instance, k, v)
        instance.save()
        return instance

    def delete(self, instance: T) -> None:
        instance.delete()
