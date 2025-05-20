import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export const initDB = async () => {
  try {
    db = await open({ filename: 'mydatabase.db', driver: sqlite3.Database });
    console.log('Database opened successfully.');

    await db.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL, 
        avatarPath TEXT
    )`);

    await db.exec(`CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_wins INTEGER DEFAULT 0,
        tournament_wins INTEGER DEFAULT 0,
        tournaments_played INTEGER DEFAULT 0,
        matches_played INTEGER DEFAULT 0,
        player_id INTEGER NOT NULL,
        FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE
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

