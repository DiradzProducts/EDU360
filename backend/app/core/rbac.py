"""
EDU360 - Role-Based Access Control (RBAC) Dependencies
Lightweight role-guard middleware for FastAPI route protection.

Usage:
    from app.core.rbac import require_role, require_admin

    @router.get("/admin-only", dependencies=[Depends(require_admin)])
    async def admin_endpoint(): ...

    @router.get("/coord-only", dependencies=[Depends(require_role(["admin", "academic_coordinator"]))])
    async def coordinator_endpoint(): ...
"""

from fastapi import Depends, HTTPException, Header, status
from typing import Optional, List, Callable


ADMIN_ROLES = {"admin", "principal", "super_admin"}
COORDINATOR_ROLES = {
    "academic_coordinator", "exam_coordinator", "transport_coordinator",
    "inventory_coordinator", "admissions_coordinator", "accounts_coordinator"
}
ALL_STAFF_ROLES = ADMIN_ROLES | COORDINATOR_ROLES | {"teacher"}


async def get_current_user_role(
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
) -> dict:
    """
    Extract user identity from request headers.
    In production, this would decode a JWT token.
    For now, the frontend sends X-User-Role and X-User-Id headers.
    """
    role = (x_user_role or "anonymous").lower().strip()
    user_id = x_user_id or "0"
    return {"role": role, "user_id": user_id}


def require_role(allowed_roles: List[str]) -> Callable:
    """
    Factory that returns a FastAPI dependency enforcing role membership.
    
    Example:
        @router.get("/endpoint", dependencies=[Depends(require_role(["admin", "teacher"]))])
    """
    allowed_set = set(r.lower() for r in allowed_roles)

    async def _role_guard(
        x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
    ):
        role = (x_user_role or "anonymous").lower().strip()
        if role not in allowed_set:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(sorted(allowed_set))}. Your role: {role}."
            )
        return role

    return _role_guard


# Pre-built guards for common patterns
async def require_admin(
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
) -> str:
    """Only admin / principal / super_admin roles can access."""
    role = (x_user_role or "anonymous").lower().strip()
    if role not in ADMIN_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Admin access required. Your role: {role}."
        )
    return role


async def require_staff(
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
) -> str:
    """Any staff member (admin, coordinator, teacher) can access."""
    role = (x_user_role or "anonymous").lower().strip()
    if role not in ALL_STAFF_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Staff access required. Your role: {role}."
        )
    return role
