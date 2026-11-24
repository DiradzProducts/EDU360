import asyncio
import asyncpg

DATABASE_URL = "postgresql://postgres:123456789@localhost:5432/edu360"

async def migrate():
    conn = await asyncpg.connect(DATABASE_URL)
    print("Connected to PostgreSQL edu360.")

    cols_to_add = [
        ("barcode_hash", "VARCHAR(100)"),
        ("sealed_at", "TIMESTAMP"),
        ("sealed_by", "VARCHAR(100)"),
        ("revision_notes", "TEXT"),
        ("due_date", "VARCHAR(30)"),
        ("created_by_teacher_id", "INTEGER REFERENCES users(id)"),
        ("created_by_teacher_name", "VARCHAR(100)"),
        ("reviewed_by_academic_id", "INTEGER REFERENCES users(id)"),
        ("handed_over_at", "TIMESTAMP"),
    ]

    for col_name, col_type in cols_to_add:
        try:
            await conn.execute(f"ALTER TABLE question_papers ADD COLUMN IF NOT EXISTS {col_name} {col_type};")
            print(f"Ensured column: {col_name}")
        except Exception as e:
            print(f"Error adding {col_name}: {e}")

    # Check if paper 1 exists; if not, create seed paper 1
    existing = await conn.fetchrow("SELECT id FROM question_papers WHERE id = 1;")
    if not existing:
        await conn.execute("""
            INSERT INTO question_papers (
                id, title, subject, class_name, section, term, blueprint_json,
                status, barcode_hash, created_by_teacher_id, created_by_teacher_name,
                created_at, updated_at
            ) VALUES (
                1, 'Term 1 Mathematics Comprehensive Final', 'Mathematics', 'Class 8', 'B', 'Term 1',
                '{"bloom_distribution": {"knowledge": 20, "understanding": 30, "application": 30, "hots": 20}}',
                'sent_to_exam_cell', 'BC-8B-MATH-2026-X99', 1, 'Mrs. Ananya Verma',
                NOW(), NOW()
            ) ON CONFLICT (id) DO NOTHING;
        """)
        print("Seeded question paper 1.")
    else:
        await conn.execute("UPDATE question_papers SET barcode_hash = 'BC-8B-MATH-2026-X99' WHERE id = 1 AND barcode_hash IS NULL;")
        print("Updated question paper 1 barcode_hash.")

    await conn.close()
    print("Migration finished successfully.")

if __name__ == "__main__":
    asyncio.run(migrate())
