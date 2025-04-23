import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

(async () => {
    const db = await open({
        filename: 'mydatabase.db',
        driver: sqlite3.Database
    });

    // Create the 'users' table if it doesn't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
        )
    `);

    // Insert sample data if the table is empty
    const existingUsers = await db.get("SELECT COUNT(*) AS count FROM users");
    if (existingUsers.count === 0) {
        await db.run("INSERT INTO users (name, email) VALUES (?, ?)", ["Alice", "alice@example.com"]);
    }

    // Fetch users
    const users = await db.all("SELECT * FROM users");
    console.log("Users:", users);

    await db.close();
})();
