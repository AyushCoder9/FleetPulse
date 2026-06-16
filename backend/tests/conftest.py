import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
os.environ.setdefault('DJANGO_SECRET_KEY', 'test-secret-key')

import pytest
from django.test import TestCase


@pytest.fixture
def django_db_setup():
    pass
