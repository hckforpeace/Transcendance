import sqlite3 from 'sqlite3';
import fs from 'fs';
import { open } from 'sqlite';
import populate from './populate.js'

let db;
const dbPath = 'database/mydatabase.db';

export const initDB = async () => {
  const fileExists = fs.existsSync(dbPath);
  if (fileExists) {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    console.log('***** Database File already exists *****')
    return ;
  } else {
    console.log('***** NO database file found creating one ! *****')
    db = await open({ filename: dbPath, driver: sqlite3.Database });
  }
  try {

    // TODO Change id to make it unique wihtout auto increment
    await db.exec(`CREATE TABLE IF NOT EXISTS users (
        id TEXT UNIQUE,
        name TEXT UNIQUE, 
        hashed_password TEXT,
        email TEXT UNIQUE NOT NULL, 
        connected BOOLEAN DEFAULT 0, 
        avatarPath TEXT DEFAULT '/images/avatar.jpg',
        friends TEXT DEFAULT '[]',
        socketConnectionProfile BOOL DEFAULT 0,
        friendedMe TEXT DEFAULT '[]',
        isGoogleAuth BOOL DEFAULT 0,
        token_exp INTEGER,
        twofa_secret TEXT DEFAULT ''
    )`);

    await db.exec(`CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        matchesWon INTEGER DEFAULT 0,
        matchesLost INTEGER DEFAULT 0,
        tournamentsWon INTEGER DEFAULT 0,
        tournamentsPlayed INTEGER DEFAULT 0,
        matchesPlayed INTEGER DEFAULT 0,
        playerId TEXT NOT NULL,
        FOREIGN KEY (playerId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    await db.exec(`CREATE TABLE IF NOT EXISTS "twofa" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        code TEXT NOT NULL,
        validity BOOLEAN NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expired_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    await db.exec(`CREATE TABLE IF NOT EXISTS matches (
        match_id INTEGER PRIMARY KEY AUTOINCREMENT,
        player1_alias TEXT NOT NULL,
        player2_alias TEXT NOT NULL,
        player1_id TEXT NOT NULL,
        player2_id TEXT,
        player1_score INTEGER DEFAULT 0,
        player2_score INTEGER DEFAULT 0,
        date DATETIME DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (player1_id) REFERENCES users(id),
        FOREIGN KEY (player2_id) REFERENCES users(id)
    )`);
    
    populate.populateDB(db);
  } catch (error) {
    console.error('Error initializing the database:', error);
  }
};

export const getDB = () => {
  if (!db)
    console.error('Database not initialized.');
  return db;
};

