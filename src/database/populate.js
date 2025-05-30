import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { populate } from 'dotenv';

const sql_add_user = "INSERT INTO users (name, hashed_password, email, connected, avatarPath, friends) VALUES (?, ?, ?, ?, ?, ?)";

const populateDB = async (db) => 
{
  await db.run(sql_add_user, ['pablo', "password", "sjahdad@gmail.com", 1, "avatar.jpg", '[]'], function(err) {
    if (err) {
      console.error('Error inserting admin user:', err);
    } else {
      console.log("user added");
    }
  })
  await db.run(sql_add_user, ['mel', "password", "hsadkdh@gmail.com", 1, "avatar.jpg", '[]'], function(err) {
    if (err) {
      console.error('Error inserting admin user:', err);
    } else {
      console.log("user added");
    }
  })
  await db.run(sql_add_user, ['momo', "password", "shs@gmail.com", 0, "avatar.jpg", '[]'], function(err) {
    if (err) {
      console.error('Error inserting admin user:', err);
    } else {
      console.log("user added");
    }
  })
  await db.run(sql_add_user, ['admin', "password", "admin@gmail.com", 1, "avatar.jpg", '[]'], function(err) {
    if (err) {
      console.error('Error inserting admin user:', err);
    } else {
      console.log("user added");
    }
  })
  await db.run(sql_add_user, ['georges', "pomme", "ajhskdjasgd@gmail.com", 1, "avatar_1747840269281.png", '[]'], function(err) {
    if (err) {
      console.error('Error inserting admin user:', err);
    } else {
      console.log("user added");
    }
  })
}

export default {populateDB}
