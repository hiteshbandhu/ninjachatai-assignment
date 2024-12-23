import { Database } from 'sqlite3';
import { open } from 'sqlite';

const dbFilePath = './fileTracker.db';

export async function initializeDatabase() {
    const db = await open({
        filename: dbFilePath,
        driver: Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS "FILE_TRACKER" (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            filename TEXT NOT NULL,
            namespace TEXT NOT NULL
        )
    `);

    console.log("Database initialized and table created if it did not exist.");
    return db;
}

export async function insertFileTrackerEntry(filename: string, namespace: string) {
    const db = await initializeDatabase();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt; // Set updated_at to the same value as created_at initially

    await db.run(`
        INSERT INTO "FILE_TRACKER" (created_at, updated_at, filename, namespace) 
        VALUES (?, ?, ?, ?)`, [createdAt, updatedAt, filename, namespace]);

    console.log(`Entry added: ${filename}, Namespace: ${namespace}`);
}

export async function getFileTrackerEntries() {
    const db = await initializeDatabase();
    try {
        const entries = await db.all(`
            SELECT filename, created_at, updated_at, namespace 
            FROM "FILE_TRACKER"
            ORDER BY created_at DESC
        `);
        return entries;
    } catch (error) {
        console.error('Error fetching file entries:', error);
        return [];
    }
}

export async function updateFileTimestamp(filename: string): Promise<boolean> {
    const db = await initializeDatabase();
    const newTimestamp = new Date().toISOString();

    try {
        const result = await db.run(`
            UPDATE "FILE_TRACKER" 
            SET created_at = ?
            WHERE filename = ?
        `, [newTimestamp, filename]);

        if (result.changes === 0) {
            console.log(`No entry found for file: ${filename}`);
            return false; // No rows were updated
        }

        console.log(`Timestamp updated for file: ${filename}`);
        return true;
    } catch (error) {
        console.error('Error updating timestamp:', error);
        return false;
    }
}

export async function getLatestFileEntryNamespace() {
    const db = await initializeDatabase();
    try {
        const entry = await db.get(`
            SELECT namespace 
            FROM "FILE_TRACKER" 
            ORDER BY created_at DESC 
            LIMIT 1
        `);
        return entry ? entry.namespace : null; // Return the namespace or null if no entry exists
    } catch (error) {
        console.error('Error fetching latest file entry namespace:', error);
        return null;
    }
}
