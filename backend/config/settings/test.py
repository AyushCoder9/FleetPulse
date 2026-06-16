import os
os.environ.setdefault('DJANGO_SECRET_KEY', 'test-secret-key-not-for-prod')
os.environ.setdefault('DATABASE_URL', 'sqlite://:memory:')
os.environ.setdefault('REDIS_URL', 'redis://localhost:6379/0')

from .base import *  # noqa: F401, F403

DEBUG = True
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
