import {getDB} from '../database/database.js';
import { nanoid } from 'nanoid';

const googleAuth = async (payload) => {
  const db = await getDB()  
  const id = payload.sub;
  const email = payload.email;
  const username = payload.given_name;
  var uniqueUname = username;
  var res;

  res = await db.get('SELECT id FROM users WHERE id = ?', [id])
  if (res) {
    await db.run("UPDATE users SET connected = 1 WHERE id = ?", [id]) 
  } else {
    while ((res = await db.get('SELECT id FROM users WHERE name = ?', [uniqueUname]))) {
      uniqueUname = username + nanoid(6);
    }

    res = await db.get('SELECT * FROM users WHERE email = ?', [email])
    if (res)
      throw new Error('email already used by another user')

    await db.run("INSERT INTO users (id, name, email, isGoogleAuth, connected, token_exp) VALUES (?, ?, ?, ?, ?, ?)", [id, uniqueUname, email, 1, 1, Date.now()])
  }
  return ({
    userId: id, email: email, name: uniqueUname, 
  })
}


export default {googleAuth}
