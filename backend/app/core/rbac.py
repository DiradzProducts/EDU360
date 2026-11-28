"""
EDU360 - Role-Based Access Control (RBAC) & Security Dependencies
Enforces role-based permissions with dual-mode support:
1. Signed HMAC-SHA256 Bearer Tokens
2. Frontend X-User-Role / X-User-Id Headers (for backwards compatibility)
3. Session cookies

Blocks all unauthenticated and unauthorized callers.
"""

import os
from fastapi import Depends, HTTPException, Header, Cookie, status
from typing import Optional, List, Callable, Dict, Any
from app.core.security import decode_access_token

ADMIN_ROLES = {"admin", "principal", "super_admin"}
COORDINATOR_ROLES = {
    "academic_coordinator", "exam_coordinator", "transport_coordinator",
    "inventory_coordinator", "admissions_coordinator", "accounts_coordinator"
}
ALL_STAFF_ROLES = ADMIN_ROLES | COORDINATOR_ROLES | {"teacher"}


def resolve_caller_identity(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    session_cookie: Optional[str] = Cookie(None, alias="edu360_session")
) -> Dict[str, Any]:
    """
    Extracts authenticated user identity from request.
    Priority: Bearer Token -> X-User-Role header -> Session Cookie.
    """
    # 1. Bearer Token
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
        payload = decode_access_token(token)
        if payload:
            return {
                "role": payload.get("role", "anonymous").lower().strip(),
                "user_id": str(payload.get("sub", "0")),
                "name": payload.get("name", "User"),
                "auth_type": "bearer_token",
                "is_authenticated": True
            }

    # 2. X-User-Role & X-User-Id headers (disabled when EDU360_STRICT_AUTH=true)
    strict_auth = os.getenv("EDU360_STRICT_AUTH", "false").lower() == "true"
    if not strict_auth and x_user_role and x_user_role.strip():
        clean_role = x_user_role.lower().strip()
        if clean_role != "anonymous":
            return {
                "role": clean_role,
                "user_id": (x_user_id or "0").strip(),
                "name": clean_role.capitalize(),
                "auth_type": "role_header",
                "is_authenticated": True
            }

    # 3. Session cookie (Next.js middleware fallback; disabled in strict mode)
    if not strict_auth and session_cookie and session_cookie.strip():
        clean_role = session_cookie.lower().strip()
        if clean_role != "anonymous":
            return {
                "role": clean_role,
                "user_id": (x_user_id or "0").strip(),
                "name": clean_role.capitalize(),
                "auth_type": "cookie",
                "is_authenticated": True
            }

    return {
        "role": "anonymous",
        "user_id": "0",
        "name": "Anonymous",
        "auth_type": "none",
        "is_authenticated": False
    }


def get_current_user_role(
    identity: Dict[str, Any] = Depends(resolve_caller_identity)
) -> dict:
    """Returns the caller's identity dictionary."""
    return identity


def require_role(allowed_roles: List[str]) -> Callable:
    """
    Factory that returns a FastAPI dependency enforcing role membership.
    Blocks any caller whose declared role does not match permitted roles.
    """
    allowed_set = set(r.lower() for r in allowed_roles)

    def _role_guard(
        identity: Dict[str, Any] = Depends(resolve_caller_identity)
    ) -> str:
        role = identity["role"]

        if not identity["is_authenticated"] or role == "anonymous":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required. Please sign in to access this resource."
            )

        # Super admin / system override
        if role in {"system", "super_admin", "admin"}:
            return role

        if role not in allowed_set:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(sorted(allowed_set))}. Your role: {role}."
            )
        return role

    return _role_guard


def require_admin(
    identity: Dict[str, Any] = Depends(resolve_caller_identity)
) -> str:
    """Only admin / principal / super_admin roles can access."""
    role = identity["role"]
    if not identity["is_authenticated"] or role == "anonymous":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in as an Administrator."
        )
    if role not in ADMIN_ROLES and role != "system":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Admin access required. Your role: {role}."
        )
    return role


def require_staff(
    identity: Dict[str, Any] = Depends(resolve_caller_identity)
) -> str:
    """Any staff member (admin, coordinator, teacher) can access."""
    role = identity["role"]
    if not identity["is_authenticated"] or role == "anonymous":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in as a faculty or staff member."
        )
    if role not in ALL_STAFF_ROLES and role != "system":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Staff access required. Your role: {role}."
        )
    return role
