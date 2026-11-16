import sys
import os
import sqlite3
import psycopg2
from psycopg2.extras import execute_batch
from sqlalchemy import create_engine

sys.path.append(os.path.abspath('backend'))
from app.models.models import Base

SQLITE_PATH = os.path.abspath('backend/edu360.db')
PG_CONN_STR = "postgresql://postgres:123456789@localhost:5432/edu360"
PG_ENGINE_STR = "postgresql+psycopg2://postgres:123456789@localhost:5432/edu360"

print("--- EDU360 SQLITE TO POSTGRESQL MIGRATION ---")
print(f"Source: {SQLITE_PATH}")
print(f"Destination: {PG_CONN_STR}\n")

# 1. Create all tables in PostgreSQL
print("1. Creating schema and all tables in PostgreSQL via SQLAlchemy Base...")
pg_engine = create_engine(PG_ENGINE_STR)
Base.metadata.drop_all(pg_engine)
Base.metadata.create_all(pg_engine)
print("Schema creation complete.\n")

# 2. Connect directly via DB-API for fast batch migration
sqlite_conn = sqlite3.connect(SQLITE_PATH)
sqlite_conn.row_factory = sqlite3.Row
sqlite_cur = sqlite_conn.cursor()

pg_conn = psycopg2.connect(PG_CONN_STR)
pg_cur = pg_conn.cursor()

# Disable foreign keys during load
print("2. Disabling session foreign key checks...")
pg_cur.execute("SET session_replication_role = 'replica';")
pg_conn.commit()

# Get all tables from Base metadata in topological order
tables = Base.metadata.sorted_tables
total_tables = len(tables)
total_migrated_rows = 0

print(f"3. Migrating {total_tables} tables...\n")

for i, table in enumerate(tables, 1):
    table_name = table.name
    
    # Check if table exists in SQLite
    sqlite_cur.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}';")
    if not sqlite_cur.fetchone():
        print(f"[{i:02d}/{total_tables}] {table_name:<32} -> Not in SQLite source, skipped.")
        continue
    
    # Read rows from SQLite
    sqlite_cur.execute(f"SELECT * FROM {table_name};")
    rows = sqlite_cur.fetchall()
    row_count = len(rows)
    
    if row_count == 0:
        print(f"[{i:02d}/{total_tables}] {table_name:<32} -> 0 rows.")
        continue

    # Get column names that exist in PostgreSQL model
    col_names = [col.name for col in table.columns]
    
    # Truncate PG table first just in case
    pg_cur.execute(f'TRUNCATE TABLE "{table_name}" CASCADE;')
    
    # Prepare INSERT statement
    cols_quoted = [f'"{c}"' for c in col_names]
    placeholders = [f"%({c})s" for c in col_names]
    insert_sql = f'INSERT INTO "{table_name}" ({", ".join(cols_quoted)}) VALUES ({", ".join(placeholders)})'
    
    # Format batch data
    batch_data = []
    for r in rows:
        row_dict = dict(r)
        # Ensure all model columns exist in dict (fill None if missing)
        record = {c: row_dict.get(c, None) for c in col_names}
        # In SQLite booleans are 0/1, convert where needed
        for col in table.columns:
            if col.type.python_type is bool and record[col.name] is not None:
                record[col.name] = bool(record[col.name])
        batch_data.append(record)

    # Batch insert
    execute_batch(pg_cur, insert_sql, batch_data, page_size=500)
    pg_conn.commit()
    
    # Reset sequence if table has integer auto-increment id column
    if 'id' in col_names and table.c.id.type.python_type is int:
        try:
            pg_cur.execute(f"""
                SELECT setval(pg_get_serial_sequence('"{table_name}"', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) 
                FROM "{table_name}";
            """)
            pg_conn.commit()
        except Exception:
            pg_conn.rollback()

    total_migrated_rows += row_count
    print(f"[{i:02d}/{total_tables}] {table_name:<32} -> {row_count:>4} rows migrated.")

# Re-enable foreign keys
print("\n4. Re-enabling foreign key checks...")
pg_cur.execute("SET session_replication_role = 'origin';")
pg_conn.commit()

sqlite_conn.close()
pg_conn.close()

print(f"\nSUCCESS! Total {total_migrated_rows} rows migrated across all tables into PostgreSQL edu360!")
