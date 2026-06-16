import os

os.environ.setdefault('DJANGO_SECRET_KEY', 'test-secret-key-not-for-prod')
os.environ.setdefault('DATABASE_URL', 'sqlite://:memory:')
os.environ.setdefault('REDIS_URL', 'redis://localhost:6379/0')
