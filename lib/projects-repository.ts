import { db } from "./db";

export type ProjectSummary = {
  id: string;
};

/**
 * Returns the most recently created project for a user when a database connection
 * is available. If no database is configured or the query fails (missing table,
 * etc.), we fall back to `null` so the API can still respond gracefully.
 */
export async function findLatestProjectForUser(userId: string): Promise<ProjectSummary | null> {
  if (!userId) return null;
  if (!db) {
    return null;
  }

  try {
    const result = await db.query(
      `SELECT id
       FROM projects
       WHERE user_id = $1
       ORDER BY id DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id
    };
  } catch (error) {
    console.warn("[projects-repository] Failed to fetch latest project:", error);
    return null;
  }
}
