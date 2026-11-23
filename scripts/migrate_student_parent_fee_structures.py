import asyncio
import asyncpg

DATABASE_URL = "postgresql://postgres:123456789@localhost:5432/edu360"

async def migrate():
    conn = await asyncpg.connect(DATABASE_URL)
    print("Connected to PostgreSQL edu360.")

    # 1. Add parent_user_id to students table
    await conn.execute("""
        ALTER TABLE students 
        ADD COLUMN IF NOT EXISTS parent_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    """)
    await conn.execute("CREATE INDEX IF NOT EXISTS idx_students_parent_user_id ON students(parent_user_id);")
    print("Ensured students.parent_user_id column and index.")

    # 2. Backfill parent_user_id for existing demo students
    parent_user = await conn.fetchrow("SELECT id FROM users WHERE role = 'parent' OR username = 'parent' ORDER BY id ASC LIMIT 1;")
    if parent_user:
        parent_id = parent_user['id']
        await conn.execute("""
            UPDATE students 
            SET parent_user_id = $1 
            WHERE id IN (1, 2) AND (parent_user_id IS NULL OR parent_user_id = 0);
        """, parent_id)
        print(f"Backfilled parent_user_id={parent_id} for demo students Aarav Sharma & Ananya Sharma.")

    # 3. Create fee_structures table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS fee_structures (
            id SERIAL PRIMARY KEY,
            class_name VARCHAR(50) NOT NULL UNIQUE,
            academic_year VARCHAR(20) DEFAULT '2026-2027',
            tuition_fee NUMERIC(10, 2) DEFAULT 70000.00,
            term1_amount NUMERIC(10, 2) DEFAULT 35000.00,
            term1_due_date VARCHAR(30) DEFAULT '15 Jul 2026',
            term2_amount NUMERIC(10, 2) DEFAULT 35000.00,
            term2_due_date VARCHAR(30) DEFAULT '25 Oct 2026',
            lms_digital_fee NUMERIC(10, 2) DEFAULT 14500.00,
            lab_library_fee NUMERIC(10, 2) DEFAULT 12000.00,
            activity_fee NUMERIC(10, 2) DEFAULT 5000.00,
            total_annual_fee NUMERIC(10, 2) DEFAULT 136500.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    await conn.execute("CREATE INDEX IF NOT EXISTS idx_fee_structures_class ON fee_structures(class_name);")
    print("Ensured fee_structures table and index.")

    # 4. Seed blueprints for various grades
    blueprints = [
        ("Class 8", "2026-2027", 70000.00, 35000.00, "15 Jul 2026", 35000.00, "25 Oct 2026", 14500.00, 12000.00, 5000.00, 136500.00),
        ("Class 3", "2026-2027", 30600.00, 15300.00, "15 Jul 2026", 15300.00, "25 Oct 2026", 6200.00, 4500.00, 5000.00, 61600.00),
        ("Class 5", "2026-2027", 36000.00, 18000.00, "15 Jul 2026", 18000.00, "25 Oct 2026", 8000.00, 6000.00, 5000.00, 73000.00),
        ("Class 10", "2026-2027", 84000.00, 42000.00, "15 Jul 2026", 42000.00, "25 Oct 2026", 18000.00, 15000.00, 7000.00, 166000.00),
        ("Default", "2026-2027", 50000.00, 25000.00, "15 Jul 2026", 25000.00, "25 Oct 2026", 10000.00, 8000.00, 5000.00, 98000.00),
    ]

    for b in blueprints:
        await conn.execute("""
            INSERT INTO fee_structures (
                class_name, academic_year, tuition_fee, term1_amount, term1_due_date,
                term2_amount, term2_due_date, lms_digital_fee, lab_library_fee,
                activity_fee, total_annual_fee
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (class_name) DO UPDATE SET
                term1_amount = EXCLUDED.term1_amount,
                term2_amount = EXCLUDED.term2_amount,
                total_annual_fee = EXCLUDED.total_annual_fee;
        """, *b)
    print("Seeded standard class fee structures.")

    # 5. Ensure fee_milestones table exists
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS fee_milestones (
            id SERIAL PRIMARY KEY,
            student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            title VARCHAR(150) NOT NULL,
            amount NUMERIC(10, 2) NOT NULL,
            due_date VARCHAR(30) NOT NULL,
            status VARCHAR(20) DEFAULT 'Upcoming',
            receipt_no VARCHAR(50),
            paid_at VARCHAR(50),
            payment_method VARCHAR(50)
        );
    """)
    await conn.execute("CREATE INDEX IF NOT EXISTS idx_fee_milestones_st ON fee_milestones(student_id);")
    print("Ensured fee_milestones table.")

    # 6. Seed initial milestones for student 1 (Aarav Sharma) if none exist
    aarav_milestones = await conn.fetch("SELECT id FROM fee_milestones WHERE student_id = 1;")
    if not aarav_milestones:
        initial_milestones = [
            (1, "Milestone 1: Term 1 Tuition & Curriculum Fee", 35000.00, "15 Jul 2026", "Paid", "REC-2026-FEE-5821", "12 Jul 2026, 11:20 AM", "UPI (Google Pay)"),
            (1, "Milestone 2: Digital Learning Platform & Cloud LMS Fee", 14500.00, "15 Jul 2026", "Paid", "REC-2026-FEE-5822", "15 Jul 2026, 03:40 PM", "Net Banking (HDFC)"),
            (1, "Milestone 3: STEM Robotics, Composite Lab & Library Fee", 12000.00, "18 Aug 2026", "Paid", "REC-2026-FEE-5823", "18 Aug 2026, 09:15 AM", "Debit Card"),
            (1, "Milestone 4: Term 2 Tuition & Infrastructure Fee", 35000.00, "25 Oct 2026", "Overdue", None, None, None),
            (1, "Milestone 5: Interactive Virtual Labs & AI Proctoring Fee", 14500.00, "10 Nov 2026", "Upcoming", None, None, None)
        ]
        for m in initial_milestones:
            await conn.execute("""
                INSERT INTO fee_milestones (student_id, title, amount, due_date, status, receipt_no, paid_at, payment_method)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
            """, *m)
        print("Seeded standard fee milestones for Aarav Sharma (student 1).")

    await conn.close()
    print("All migrations and backfills completed successfully!")

if __name__ == "__main__":
    asyncio.run(migrate())
