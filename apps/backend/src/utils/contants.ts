export const CREATE_LOG_TABLE_QUERY = `
      CREATE TABLE IF NOT EXISTS run_logs (
        id SERIAL PRIMARY KEY,
        prompt TEXT NOT NULL,
        tool TEXT NOT NULL,
        response TEXT NOT NULL,
        timestamp TIMESTAMPTZ NOT NULL,
        tokens INTEGER NOT NULL
      );
    `;
export const SAVE_LOG_QUERY = `
    INSERT INTO run_logs (prompt, tool, response, timestamp, tokens)
    VALUES ($1, $2, $3, $4, $5)
  `;

