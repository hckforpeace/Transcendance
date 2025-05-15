import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export const initDB = async () => {
  try {
    db = await open({ filename: 'mydatabase.db', driver: sqlite3.Database });
    console.log('Database opened successfully.');

    await db.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL, 
        avatar TEXT NOT NULL,
    )`);

    await db.exec(`CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        avatar TEXT NOT NULL,
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

