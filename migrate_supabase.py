import os
import sys
import re
import argparse
from pathlib import Path

from dotenv import load_dotenv
import psycopg


def read_sql_file(sql_path: Path) -> str:
    sql = sql_path.read_text(encoding='utf-8')
    # Strip psql-style comments while keeping SQL comments if any
    return sql


def split_statements(sql: str):
    # Naive split on semicolons not inside strings; good enough for our schema
    statements = []
    buf = []
    in_single = False
    in_double = False
    for ch in sql:
        if ch == "'" and not in_double:
            in_single = not in_single
        elif ch == '"' and not in_single:
            in_double = not in_double
        if ch == ';' and not in_single and not in_double:
            statements.append(''.join(buf).strip())
            buf = []
        else:
            buf.append(ch)
    tail = ''.join(buf).strip()
    if tail:
        statements.append(tail)
    # Remove empty
    return [s for s in statements if s and not re.fullmatch(r"--.*", s)]


def main():
    parser = argparse.ArgumentParser(description='Apply supabase_schema.sql to Supabase Postgres')
    parser.add_argument('--db-url', dest='db_url', help='Postgres connection URL (overrides env)')
    args = parser.parse_args()

    # Load environment from project root .env
    load_dotenv(dotenv_path=Path(__file__).parent / '.env')

    db_url = (args.db_url or os.getenv('SUPABASE_DB_URL') or '').strip()
    # Normalize minor variations
    if db_url:
        db_url = db_url.strip('"').strip("'")
        if db_url.startswith('postgres://'):
            db_url = 'postgresql://' + db_url[len('postgres://'):]
        # Ensure sslmode=require for Supabase pooler
        if 'sslmode=' not in db_url:
            sep = '&' if '?' in db_url else '?'
            db_url = f"{db_url}{sep}sslmode=require"
    if not db_url:
        print('ERROR: Missing database connection info.')
        print('Provide SUPABASE_DB_URL in .env or pass --db-url "postgresql://..."')
        print('Example: postgresql://postgres:<db-password>@db.<project_ref>.supabase.co:5432/postgres?sslmode=require')
        sys.exit(1)

    sql_path = Path(__file__).parent / 'supabase_schema.sql'
    if not sql_path.exists():
        print(f'ERROR: Cannot find {sql_path}')
        sys.exit(1)

    sql = read_sql_file(sql_path)
    statements = split_statements(sql)
    if not statements:
        print('No SQL statements found in supabase_schema.sql')
        return

    print('Connecting to Supabase Postgres...')
    with psycopg.connect(db_url, autocommit=True) as conn:
        with conn.cursor() as cur:
            for idx, stmt in enumerate(statements, start=1):
                try:
                    cur.execute(stmt)
                    print(f"[{idx}/{len(statements)}] Executed")
                except Exception as e:
                    # Continue on "already exists" errors
                    msg = str(e).lower()
                    if 'already exists' in msg or 'duplicate key value' in msg:
                        print(f"[{idx}/{len(statements)}] Skipped (exists)")
                        continue
                    print(f"[{idx}/{len(statements)}] ERROR: {e}")
                    raise

    print('Migration completed successfully.')


if __name__ == '__main__':
    main()


