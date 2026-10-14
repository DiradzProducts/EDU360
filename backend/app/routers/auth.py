from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import User
from app.schemas.schemas import (
    UserResponse, 
    SchoolCodeVerifyRequest, 
    SchoolCodeVerifyResponse,
    UserRegisterRequest,
    UserLoginRequest,
    AuthResponse
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Recognized Institution School Codes (EDU360 Clients)
SCHOOL_DIRECTORY = {
    "EDU-GLOBAL-360": {
        "school_name": "EDU360 Demonstration Academy",
        "campus_city": "Bengaluru Central",
        "affiliation": "CBSE Affiliation #883921"
    },
    "DPS-BLR-2026": {
        "school_name": "Delhi Public School (Bangalore South)",
        "campus_city": "Bengaluru",
        "affiliation": "CBSE Affiliation #830029"
    },
    "OAK-INTL-88": {
        "school_name": "Oakridge International School",
        "campus_city": "Bengaluru East",
        "affiliation": "IB & Cambridge International"
    },
    "NPS-INR-100": {
        "school_name": "National Public School (Indiranagar)",
        "campus_city": "Bengaluru",
        "affiliation": "CBSE Affiliation #830014"
    }
}

@router.post("/verify-school-code", response_model=SchoolCodeVerifyResponse)
async def verify_school_code(req: SchoolCodeVerifyRequest):
    code_normalized = req.code.strip().upper()
    if code_normalized in SCHOOL_DIRECTORY:
        info = SCHOOL_DIRECTORY[code_normalized]
        return SchoolCodeVerifyResponse(
            valid=True,
            school_name=info["school_name"],
            code=code_normalized,
            campus_city=info["campus_city"],
            affiliation=info["affiliation"]
        )
    # Allow any structured 4+ character school code for client onboarding
    if len(code_normalized) >= 4 and "-" in code_normalized:
        return SchoolCodeVerifyResponse(
            valid=True,
            school_name=f"{code_normalized.split('-')[0]} Partner Academy",
            code=code_normalized,
            campus_city="Regional Campus",
            affiliation="Accredited School System"
        )
    raise HTTPException(status_code=400, detail="Invalid Institutional School Code. Contact your School Administration for your official school code.")

@router.post("/register", response_model=AuthResponse)
async def register_user(req: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    code_normalized = req.school_code.strip().upper()
    if code_normalized not in SCHOOL_DIRECTORY and ("-" not in code_normalized or len(code_normalized) < 4):
        raise HTTPException(status_code=400, detail="Invalid School Client Code. Please verify your institution's registration code.")

    # Check if email exists
    result = await db.execute(select(User).where(User.email == req.email.lower()))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email address is already registered.")

    role_clean = req.role.lower().strip()
    if role_clean not in ["admin", "teacher", "parent", "student"]:
        role_clean = "student"

    new_user = User(
        name=req.name.strip(),
        email=req.email.lower().strip(),
        role=role_clean,
        school_code=code_normalized,
        password=req.password,
        phone=req.phone or "+91 98000 00000",
        avatar=f"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    redirects = {
        "admin": "/admin",
        "teacher": "/teacher",
        "parent": "/parent",
        "student": "/student"
    }

    return AuthResponse(
        success=True,
        message=f"Welcome {new_user.name}! Your account has been registered under {code_normalized}.",
        user=new_user,
        portal_redirect=redirects.get(role_clean, "/student")
    )

@router.post("/login", response_model=AuthResponse)
async def login_user(req: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    # Look up by email
    result = await db.execute(select(User).where(User.email == req.email.lower().strip()))
    user = result.scalars().first()

    # Accept demo password shortcuts if user exists
    default_passwords = ["admin123", "teacher123", "parent123", "student123", "password123"]
    if user:
        if user.password == req.password or req.password in default_passwords or req.password == "123456":
            redirects = {
                "admin": "/admin",
                "teacher": "/teacher",
                "parent": "/parent",
                "student": "/student"
            }
            return AuthResponse(
                success=True,
                message=f"Logged in successfully as {user.name} ({user.role.capitalize()})",
                user=user,
                portal_redirect=redirects.get(user.role.lower(), "/student")
            )
        else:
            raise HTTPException(status_code=401, detail="Incorrect password. For demo accounts use admin123, teacher123, parent123, or student123.")
    
    # If not found directly by email in DB, check demo presets & aliases
    demo_accounts = {
        "principal@edu360.internal": "admin",
        "admin@edu360.internal": "admin",
        "ananya.verma@edu360.internal": "teacher",
        "teacher@edu360.internal": "teacher",
        "rajesh.sharma@example.com": "parent",
        "rajesh.sharma@gmail.com": "parent",
        "parent@edu360.internal": "parent",
        "aarav.sharma@student.edu360.internal": "student",
        "aarav.sharma@student.edu360": "student",
        "student@edu360.internal": "student"
    }
    
    clean_email = req.email.lower().strip()
    if clean_email in demo_accounts or "principal" in clean_email or "admin" in clean_email or "teacher" in clean_email or "parent" in clean_email or "student" in clean_email:
        target_role = demo_accounts.get(clean_email)
        if not target_role:
            if "principal" in clean_email or "admin" in clean_email:
                target_role = "admin"
            elif "teacher" in clean_email or "ananya" in clean_email:
                target_role = "teacher"
            elif "parent" in clean_email or "rajesh" in clean_email:
                target_role = "parent"
            else:
                target_role = "student"

        u_res = await db.execute(select(User).where(User.role == target_role))
        fallback_u = u_res.scalars().first()
        if fallback_u:
            redirects = { "admin": "/admin", "teacher": "/teacher", "parent": "/parent", "student": "/student" }
            return AuthResponse(
                success=True,
                message=f"Logged in as {fallback_u.name} ({target_role.capitalize()})",
                user=fallback_u,
                portal_redirect=redirects.get(target_role, "/student")
            )

    raise HTTPException(status_code=404, detail="Account not found. Please check your email or click Register to create your account.")

@router.get("/users", response_model=list[UserResponse])
async def list_demo_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()

@router.get("/current/{role}", response_model=UserResponse)
async def get_user_by_role(role: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.role == role.lower()))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail=f"No default user found for role {role}")
    return user
