import { getDB } from "../database/database.js"

// TODO : get from the jwt the user id 
const get_profile_data = async (req, reply) => {
  const db = getDB();
  if (db)
  {
    const res = await db.get("SELECT name, email, avatarPath from users WHERE id = ? ", [2]);
    reply.send(res)
  }
  else 
  {    
    reply.code(500);
    console.log('error')
  }
}

const update_profile_data = async (req, reply) => {
  
  const formData = await req.formData();

}

export default { get_profile_data, update_profile_data };
