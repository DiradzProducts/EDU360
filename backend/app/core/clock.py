"""
Dynamic Clock Provider for EDU360.
Replaces static simulation anchors (such as 2026-10-17 21:57:00) with a unified,
production-ready clock service supporting real UTC time and dynamic simulation overrides.
"""
import datetime
import os
from typing import Optional

class ClockProvider:
    """
    Centralized Clock Provider.
    - Default: Real UTC time (`datetime.datetime.utcnow()`).
    - Override: Controlled via `set_override(dt)` or environment variable `EDU360_CLOCK_OVERRIDE`.
    """
    _override_datetime: Optional[datetime.datetime] = None

    @classmethod
    def set_override(cls, dt: Optional[datetime.datetime]):
        cls._override_datetime = dt

    @classmethod
    def get_current_time(cls) -> datetime.datetime:
        if cls._override_datetime is not None:
            return cls._override_datetime
        env_override = os.getenv("EDU360_CLOCK_OVERRIDE")
        if env_override:
            try:
                return datetime.datetime.fromisoformat(env_override)
            except Exception:
                pass
        return datetime.datetime.utcnow()

    @classmethod
    def get_current_date(cls) -> datetime.date:
        return cls.get_current_time().date()

    @classmethod
    def get_current_date_str(cls) -> str:
        return cls.get_current_time().strftime("%Y-%m-%d")

    @classmethod
    def get_current_iso(cls) -> str:
        return cls.get_current_time().isoformat() + "Z"

    @classmethod
    def to_dict(cls) -> dict:
        now = cls.get_current_time()
        is_overridden = cls._override_datetime is not None or bool(os.getenv("EDU360_CLOCK_OVERRIDE"))
        return {
            "iso": cls.get_current_iso(),
            "date": cls.get_current_date_str(),
            "time": now.strftime("%H:%M:%S"),
            "timestamp": int(now.timestamp()),
            "is_overridden": is_overridden,
            "mode": "SIMULATED" if is_overridden else "LIVE_REALTIME"
        }

# Global convenience functions
def get_current_time() -> datetime.datetime:
    return ClockProvider.get_current_time()

def get_current_date_str() -> str:
    return ClockProvider.get_current_date_str()
