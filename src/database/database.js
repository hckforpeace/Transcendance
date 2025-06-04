import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export const initDB = async () => {
  try {
    db = await open({ filename: 'mydatabase.db', driver: sqlite3.Database });
    console.log('Database opened successfully.');

    // TODO Change id to make it unique wihtout auto increment
    await db.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL, 
        connected BOOLEAN DEFAULT 0, 
        avatarPath TEXT DEFAULT '/images/avatar.jpg',
        friends TEXT DEFAULT '[]',
        socketConnectionProfile BOOL DEFAULT 0,
        friendedMe TEXT DEFAULT '[]'
    )`);

    await db.exec(`CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        matchesWon INTEGER DEFAULT 0,
        matchesLost INTEGER DEFAULT 0,
        tournamentsWon INTEGER DEFAULT 0,
        tournamentsPlayed INTEGER DEFAULT 0,
        matchesPlayed INTEGER DEFAULT 0,
        playerId INTEGER NOT NULL,
        FOREIGN KEY (playerId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    await db.exec(`CREATE TABLE IF NOT EXISTS "2fa_code" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        code TEXT NOT NULL,
        validity BOOLEAN NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expired_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    await db.exec(`CREATE TABLE IF NOT EXISTS tournament (
        tournament_id INTEGER PRIMARY KEY AUTOINCREMENT,
        winner INTEGER, -- FK to users(id)
        date DATETIME,
        player1_id INTEGER,
        player2_id INTEGER,
        player1_alias TEXT,
        player2_alias TEXT,
        match1_id INTEGER,
        match2_id INTEGER,
        FOREIGN KEY (winner) REFERENCES users(id),
        FOREIGN KEY (player1_id) REFERENCES users(id),
        FOREIGN KEY (player2_id) REFERENCES users(id),
        FOREIGN KEY (match1_id) REFERENCES matches(match_id),
        FOREIGN KEY (match2_id) REFERENCES matches(match_id)
    )`);

    await db.exec(`CREATE TABLE IF NOT EXISTS matches (
        match_id INTEGER PRIMARY KEY AUTOINCREMENT,
        player1_alias TEXT NOT NULL,
        player2_alias TEXT NOT NULL,
        player1_id INTEGER NOT NULL,
        player2_id INTEGER NOT NULL,
        player1_score INTEGER DEFAULT 0,
        player2_score INTEGER DEFAULT 0,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player1_id) REFERENCES users(id),
        FOREIGN KEY (player2_id) REFERENCES users(id)
    )`);

  } catch (error) {
    console.error('Error initializing the database:', error);
  }
};

export const getDB = () => {
  if (!db)
    console.error('Database not initialized.');
  return db;
};

