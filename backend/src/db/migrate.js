import fs from 'fs'
import path from 'path'
import url from 'url'
import pool from './pool.js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const migrationsDir = path.join(__dirname, '../../migrations')

async function ensureMigrationsTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS _migrations (
    id serial PRIMARY KEY,
    filename text UNIQUE NOT NULL,
    run_at timestamptz NOT NULL DEFAULT now()
  )`)
}

async function alreadyRan(filename) {
  const { rows } = await pool.query('SELECT 1 FROM _migrations WHERE filename=$1', [filename])
  return rows.length > 0
}

export async function runMigrations() {
  await ensureMigrationsTable()
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
  for (const f of files) {
    if (await alreadyRan(f)) continue
    const sql = fs.readFileSync(path.join(migrationsDir, f), 'utf-8')
    console.log('[migrate] Running', f)
    await pool.query('BEGIN')
    try {
      await pool.query(sql)
      await pool.query('INSERT INTO _migrations(filename) VALUES($1)', [f])
      await pool.query('COMMIT')
      console.log('[migrate] OK', f)
    } catch (e) {
      await pool.query('ROLLBACK')
      console.error('[migrate] FAILED', f, e)
      throw e
    }
  }
}
