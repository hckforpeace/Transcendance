import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export const initDB = async () => {
  db = await open({
    filename: 'mydatabase.db',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    )
  `);

  console.log("Database and table initialized.");
};

export const getDB = () => db;
