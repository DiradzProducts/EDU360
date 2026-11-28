"""
EDU360 - Core Security & Cryptography Utilities
Provides salted password hashing and HMAC-SHA256 token generation/verification
using Python's standard library without requiring external C-extensions.
"""

import os
import hmac
import hashlib
import base64
import json
import secrets
import time
from typing import Optional, Dict, Any

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "edu360-jwt-secret-key-change-in-production-2026")
TOKEN_EXPIRY_SECONDS = 86400 * 7  # 7 days
DEV_DEMO_LOGIN = os.getenv("EDU360_DEV_DEMO_LOGIN", "true").lower() == "true"

ACCEPTED_DEMO_PASSWORDS = {
    "password123", "admin123", "teacher123", "parent123", "student123", "123456"
}


def hash_password(password: str) -> str:
    """Generate salted PBKDF2-HMAC-SHA256 password hash."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100_000
    )
    return f"pbkdf2:sha256:100000${salt}${key.hex()}"


def verify_password(plain_password: str, stored_password_or_hash: Optional[str]) -> bool:
    """
    Verify password against salted hash or legacy/demo plaintext.
    Maintains 100% backward compatibility with demo accounts.
    """
    if not plain_password:
        return False

    clean_plain = plain_password.strip()

    # 1. Universal demo passwords succeed only when DEV_DEMO_LOGIN is enabled
    if DEV_DEMO_LOGIN and (clean_plain.lower() in ACCEPTED_DEMO_PASSWORDS or clean_plain == "Password123"):
        return True

    if not stored_password_or_hash:
        return False

    # 2. Check if stored is PBKDF2 hash
    if stored_password_or_hash.startswith("pbkdf2:sha256:"):
        try:
            parts = stored_password_or_hash.split("$")
            if len(parts) == 3:
                salt = parts[1]
                expected_key_hex = parts[2]
                computed = hashlib.pbkdf2_hmac(
                    "sha256",
                    clean_plain.encode("utf-8"),
                    salt.encode("utf-8"),
                    100_000
                )
                return hmac.compare_digest(computed.hex(), expected_key_hex)
        except Exception:
            return False

    # 3. Legacy plaintext comparison
    return hmac.compare_digest(clean_plain, stored_password_or_hash.strip())


def create_access_token(data: Dict[str, Any], expires_in: int = TOKEN_EXPIRY_SECONDS) -> str:
    """Create a URL-safe signed HMAC-SHA256 authentication token."""
    payload = data.copy()
    payload["exp"] = int(time.time()) + expires_in
    payload["iat"] = int(time.time())

    payload_json = json.dumps(payload, separators=(",", ":"))
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode("utf-8")).decode("utf-8").rstrip("=")

    signature = hmac.new(
        SECRET_KEY.encode("utf-8"),
        payload_b64.encode("utf-8"),
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")

    return f"{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify HMAC-SHA256 signature and expiration."""
    if not token or "." not in token:
        return None

    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None

        payload_b64, sig_b64 = parts[0], parts[1]

        # Verify signature
        expected_sig = hmac.new(
            SECRET_KEY.encode("utf-8"),
            payload_b64.encode("utf-8"),
            hashlib.sha256
        ).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode("utf-8").rstrip("=")

        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            return None

        # Re-add padding for base64
        padded = payload_b64 + "=" * (-len(payload_b64) % 4)
        payload_json = base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8")
        payload = json.loads(payload_json)

        # Check expiration
        if payload.get("exp") and time.time() > payload["exp"]:
            return None

        return payload
    except Exception:
        return None
