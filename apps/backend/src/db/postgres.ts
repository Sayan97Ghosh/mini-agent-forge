import { Pool } from 'pg';
import { RunLog } from '../utils/types';
import { CREATE_LOG_TABLE_QUERY, SAVE_LOG_QUERY } from '../utils/constants';
import dotenv from 'dotenv';

dotenv.config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB() {
  try {
    await pool.query('SELECT NOW()');
    console.log('Postgres DB connected');
    await pool.query(CREATE_LOG_TABLE_QUERY);
    console.log('run_logs table ensured');
  } catch (err) {
    console.error('Postgres DB initialization failed:', err);
  }
}

initDB();

export async function saveRunLog(log: RunLog): Promise<void> {
  const values = [log.prompt, log.tool, log.response, log.timestamp, log.tokens];

  try {
    await pool.query(SAVE_LOG_QUERY, values);
  } catch (err) {
    console.error('Failed to save run log to Postgres:', err);
  }
}
