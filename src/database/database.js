// import sqlite from 'node:sqlite';

// import { DatabaseSync } from 'node:sqlite';
// const database = new DatabaseSync(':memory:');

// // Execute SQL statements from strings.
// database.exec(`
//   CREATE TABLE data(
//     key INTEGER PRIMARY KEY,
//     value TEXT
//   ) STRICT
// `);

// // Create a prepared statement to insert data into the database.
// const insert = database.prepare('INSERT INTO data (key, value) VALUES (?, ?)');

// // Execute the prepared statement with bound values.
// insert.run(1, 'hello');
// insert.run(2, 'world');

// // Create a prepared statement to read data from the database.
// const query = database.prepare('SELECT * FROM data ORDER BY key');

// // Execute the prepared statement and log the result set.
// console.log(query.all());
// // Prints: [ { key: 1, value: 'hello' }, { key: 2, value: 'world' } ]

//-------------------------------------------------------------------------------------

// const sqlite3 = require('sqlite3').verbose();

// // Create or open a database file
// const db = new sqlite3.Database('mydatabase.db', (err) => {
//     if (err) {
//         console.error('Error opening database', err.message);
//     } else {
//         console.log('Connected to SQLite database.');
//     }
// });

// db.run(`
//     CREATE TABLE IF NOT EXISTS users (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         name TEXT NOT NULL,
//         email TEXT UNIQUE NOT NULL
//     )
// `, (err) => {
//     if (err) {
//         console.error('Error creating table', err.message);
//     } else {
//         console.log('Users table created or already exists.');
//     }
// });

// // Insert a user
// db.run(`INSERT INTO users (name, email) VALUES (?, ?)`, 
//     ['John Doe', 'john@example.com'], 
//     function (err) {
//         if (err) {
//             console.error('Error inserting data', err.message);
//         } else {
//             console.log(`User added with ID: ${this.lastID}`);
//         }
//     }
// );

// // Fetch all users
// db.all(`SELECT * FROM users`, [], (err, rows) => {
//     if (err) {
//         console.error('Error fetching users', err.message);
//     } else {
//         console.log('Users:', rows);
//     }
// });


// // Close the database connection
// db.close((err) => {
//     if (err) {
//         console.error('Error closing database', err.message);
//     } else {
//         console.log('Database connection closed.');
//     }
// });

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open the database with async/await
const db = await open({ filename: 'mydatabase.db', driver: sqlite3.Database });

// Create a table
await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULLdatabase
    )
`);

console.log("Database and table initialized.");

// Close the database
await db.close();