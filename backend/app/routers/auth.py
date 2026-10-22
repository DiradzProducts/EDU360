from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import User, Student
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

async def resolve_student_tier_details(user: User, db: AsyncSession):
    """Helper to determine grade_tier ('k5' vs 'secondary') and student_id for student accounts."""
    if not user or user.role != "student":
        return "secondary", False, None
    s_res = await db.execute(select(Student).where(Student.user_id == user.id))
    student = s_res.scalars().first()
    if not student:
        s_res = await db.execute(select(Student).where(Student.name == user.name))
        student = s_res.scalars().first()
    
    if student:
        tier = student.grade_tier or ("k5" if any(k in student.class_name.lower() for k in ["3", "1", "2", "4", "5", "nursery", "kg", "prep"]) else "secondary")
        return tier, (tier == "k5"), student.id
    return "secondary", False, None

PORTAL_REDIRECTS = {
    "admin": "/admin",
    "academic_coordinator": "/academic_coordinator",
    "exam_coordinator": "/exam_coordinator",
    "transport_coordinator": "/transport_coordinator",
    "inventory_coordinator": "/inventory_coordinator",
    "admissions_coordinator": "/admissions_coordinator",
    "accounts_coordinator": "/accounts_coordinator",
    "teacher": "/teacher",
    "parent": "/parent",
    "student": "/student"
}

@router.post("/login", response_model=AuthResponse)
async def login_user(req: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    identifier = (req.username or req.email or "").strip().lower()
    if not identifier:
        raise HTTPException(status_code=400, detail="Username or email is required to sign in.")

    # 1. Search database by username or email
    result = await db.execute(
        select(User).where((User.username.ilike(identifier)) | (User.email.ilike(identifier)))
    )
    user = result.scalars().first()

    # Password validation: allow universal 'Password123' (case-insensitive) or existing hash/defaults
    accepted_passwords = ["Password123", "password123", "admin123", "teacher123", "parent123", "student123", "123456"]
    is_valid_pwd = (
        req.password == "Password123" or 
        req.password.lower() == "password123" or 
        req.password in accepted_passwords or 
        (user and user.password == req.password)
    )

    if user:
        if is_valid_pwd:
            grade_tier, is_junior, student_id = await resolve_student_tier_details(user, db)
            user_dto = UserResponse.model_validate(user)
            user_dto.grade_tier = grade_tier
            user_dto.is_junior_k5 = is_junior
            user_dto.student_id = student_id

            return AuthResponse(
                success=True,
                message=f"Logged in successfully as {user.name} (@{user.username or user.role})",
                user=user_dto,
                portal_redirect=PORTAL_REDIRECTS.get(user.role.lower(), "/student"),
                grade_tier=grade_tier,
                is_junior_k5=is_junior,
                student_id=student_id
            )
        else:
            raise HTTPException(status_code=401, detail="Incorrect password. For all institutional accounts, use 'Password123'.")

    # 2. Role Alias Fallback Map
    role_username_map = {
        # School Leadership & Coordinators
        "admin": ("admin", "Dr. Sunita Kapoor"),
        "principal": ("admin", "Dr. Sunita Kapoor"),
        "academic_coord": ("academic_coordinator", "Prof. Rajeshwari Nair"),
        "academic_coordinator": ("academic_coordinator", "Prof. Rajeshwari Nair"),
        "exam_coord": ("exam_coordinator", "Dr. Hemanth Sen"),
        "exam_coordinator": ("exam_coordinator", "Dr. Hemanth Sen"),
        "transport_coord": ("transport_coordinator", "Mr. Vikram Malhotra"),
        "transport_coordinator": ("transport_coordinator", "Mr. Vikram Malhotra"),
        "inventory_coord": ("inventory_coordinator", "Mrs. Shalini Rao"),
        "inventory_coordinator": ("inventory_coordinator", "Mrs. Shalini Rao"),
        "admissions_coord": ("admissions_coordinator", "Ms. Sneha Kulkarni"),
        "admissions_coordinator": ("admissions_coordinator", "Ms. Sneha Kulkarni"),
        "accounts_coord": ("accounts_coordinator", "Mr. Arvind Krishnan"),
        "accounts_coordinator": ("accounts_coordinator", "Mr. Arvind Krishnan"),

        # Faculty / Teachers
        "teacher_mat": ("teacher", "Mrs. Ananya Verma"),
        "teacher": ("teacher", "Mrs. Ananya Verma"),
        "teacher_math": ("teacher", "Mrs. Ananya Verma"),
        "teacher_maths": ("teacher", "Mrs. Ananya Verma"),
        "teacher_sci": ("teacher", "Dr. K. Raman"),
        "teacher_science": ("teacher", "Dr. K. Raman"),
        "teacher_chem": ("teacher", "Mrs. S. Sen"),
        "teacher_eng": ("teacher", "Mrs. Sunitha Rao"),
        "teacher_soc": ("teacher", "Mrs. Kalyani Murthy"),
        "teacher_bio": ("teacher", "Dr. Shalini Gupta"),

        # Students
        "sr_student": ("student", "Aarav Sharma"),
        "student": ("student", "Aarav Sharma"),
        "student_sr": ("student", "Aarav Sharma"),
        "jr_student": ("student", "Aarav Kumar"),
        "junior": ("student", "Aarav Kumar"),
        "junior_student": ("student", "Aarav Kumar"),

        # Parents
        "parent": ("parent", "Mr. Rajesh Sharma"),
    }

    if identifier in role_username_map or any(k in identifier for k in ["admin", "coord", "teacher", "student", "parent", "junior"]):
        mapped = role_username_map.get(identifier)
        target_role, target_name = mapped if mapped else (None, None)
        
        fallback_u = None
        if target_name:
            u_res = await db.execute(select(User).where(User.name.ilike(f"%{target_name}%")))
            fallback_u = u_res.scalars().first()

        if not fallback_u and target_role:
            u_res = await db.execute(select(User).where(User.role == target_role))
            fallback_u = u_res.scalars().first()

        if fallback_u and is_valid_pwd:
            grade_tier, is_junior, student_id = await resolve_student_tier_details(fallback_u, db)
            user_dto = UserResponse.model_validate(fallback_u)
            user_dto.grade_tier = grade_tier
            user_dto.is_junior_k5 = is_junior
            user_dto.student_id = student_id

            return AuthResponse(
                success=True,
                message=f"Logged in as {fallback_u.name} (@{fallback_u.username or fallback_u.role})",
                user=user_dto,
                portal_redirect=PORTAL_REDIRECTS.get(fallback_u.role.lower(), "/student"),
                grade_tier=grade_tier,
                is_junior_k5=is_junior,
                student_id=student_id
            )

    raise HTTPException(status_code=404, detail=f"Account with username or email '{identifier}' not found. Please verify your username (e.g. sr_student, teacher_mat, admin).")

@router.get("/users", response_model=list[UserResponse])
async def list_demo_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    out = []
    for u in users:
        grade_tier, is_junior, student_id = await resolve_student_tier_details(u, db)
        user_dto = UserResponse.model_validate(u)
        user_dto.grade_tier = grade_tier
        user_dto.is_junior_k5 = is_junior
        user_dto.student_id = student_id
        out.append(user_dto)
    return out

@router.get("/current/{role}", response_model=UserResponse)
async def get_user_by_role(role: str, db: AsyncSession = Depends(get_db)):
    clean_role = role.lower().strip()
    if clean_role in ["junior", "junior_student", "k5"]:
        result = await db.execute(select(User).where(User.email.like("%junior%")))
        user = result.scalars().first()
        if not user:
            result = await db.execute(select(User).where(User.name.like("%Kumar%")))
            user = result.scalars().first()
    else:
        result = await db.execute(select(User).where(User.role == clean_role))
        user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail=f"No default user found for role {role}")
    
    grade_tier, is_junior, student_id = await resolve_student_tier_details(user, db)
    user_dto = UserResponse.model_validate(user)
    user_dto.grade_tier = grade_tier
    user_dto.is_junior_k5 = is_junior
    user_dto.student_id = student_id
    return user_dto
