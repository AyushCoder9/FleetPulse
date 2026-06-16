"""
Clerk JWT authentication for DRF.

When CLERK_JWKS_URL and CLERK_ISSUER are set in settings, this class validates
Clerk session JWTs and auto-creates Django users + organizations on first login.

If those env vars are absent, this class returns None so DRF falls through to
the next authentication class (SimpleJWT — the existing fallback).
"""
import logging
import time
from typing import Optional, Tuple

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.request import Request

logger = logging.getLogger(__name__)
User = get_user_model()

_JWKS_CACHE: dict = {}
_JWKS_FETCHED_AT: float = 0
_JWKS_TTL: float = 300  # refresh JWKS every 5 min


def _get_jwks() -> dict:
    global _JWKS_CACHE, _JWKS_FETCHED_AT
    now = time.time()
    if _JWKS_CACHE and (now - _JWKS_FETCHED_AT) < _JWKS_TTL:
        return _JWKS_CACHE

    jwks_url = getattr(settings, 'CLERK_JWKS_URL', None)
    if not jwks_url:
        return {}

    try:
        import httpx
        resp = httpx.get(jwks_url, timeout=5)
        resp.raise_for_status()
        _JWKS_CACHE = resp.json()
        _JWKS_FETCHED_AT = now
        return _JWKS_CACHE
    except Exception as e:
        logger.warning('Failed to fetch Clerk JWKS: %s', e)
        return _JWKS_CACHE or {}


def _verify_clerk_jwt(token: str) -> dict:
    """Verify a Clerk JWT and return its payload."""
    try:
        import jwt
        from jwt import InvalidTokenError, PyJWKClient
    except ImportError:
        raise AuthenticationFailed('PyJWT not installed')

    jwks_url = getattr(settings, 'CLERK_JWKS_URL', None)
    issuer = getattr(settings, 'CLERK_ISSUER', None)
    if not jwks_url or not issuer:
        raise AuthenticationFailed('Clerk not configured (missing CLERK_JWKS_URL or CLERK_ISSUER)')

    try:
        jwks_client = PyJWKClient(jwks_url)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=['RS256'],
            issuer=issuer,
            options={'require': ['exp', 'iat', 'sub']},
        )
        return payload
    except Exception as e:
        raise AuthenticationFailed(f'Invalid Clerk token: {e}')


def _get_or_create_user_from_clerk(payload: dict):
    """Get or create a Django user from a Clerk JWT payload."""
    from apps.organizations.models import Membership, Organization

    clerk_user_id: str = payload['sub']
    email: str = payload.get('email', '') or f'{clerk_user_id}@clerk.local'
    first_name: str = payload.get('first_name', '')
    last_name: str = payload.get('last_name', '')

    username = f'clerk_{clerk_user_id}'

    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
        },
    )

    if not created and (user.email != email or user.first_name != first_name):
        user.email = email
        user.first_name = first_name
        user.last_name = last_name
        user.save(update_fields=['email', 'first_name', 'last_name'])

    if not user.memberships.exists():
        display_name = f"{first_name} {last_name}".strip() or email.split('@')[0]
        org = Organization.objects.create(name=f"{display_name}'s Fleet", plan='starter')
        Membership.objects.create(user=user, organization=org, role='admin')

    return user


class ClerkJWTAuthentication(BaseAuthentication):
    """
    DRF authentication class that validates Clerk session tokens.

    Reads: Authorization: Bearer <clerk-session-token>

    Returns None (unauthenticated) if:
    - Clerk is not configured (CLERK_JWKS_URL missing) → falls through to SimpleJWT
    - No Authorization header present

    Raises AuthenticationFailed if:
    - Token is present but invalid/expired
    """

    def authenticate(self, request: Request) -> Optional[Tuple]:
        if not getattr(settings, 'CLERK_JWKS_URL', None):
            return None

        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header[7:]

        if not token:
            return None

        payload = _verify_clerk_jwt(token)
        user = _get_or_create_user_from_clerk(payload)
        return (user, token)

    def authenticate_header(self, request: Request) -> str:
        return 'Bearer realm="FleetPulse"'
