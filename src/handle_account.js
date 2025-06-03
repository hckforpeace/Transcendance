import cron from 'node-cron';
import { getDB } from './database/database.js';

async function check_token_validity()
{
    cron.schedule('0 8 * * *', async () => {
      const db = getDB();
    
      const nowInSeconds = Math.floor(Date.now() / 1000); // temps actuel en secondes
    
      try {
        const users = await db.all('SELECT id, token_exp FROM users');
    
        for (const user of users) {
          if (user.token_exp < nowInSeconds) {
            console.log(`User ${user.id} supprimé car token expiré.`);
            await db.run('DELETE FROM users WHERE id = ?', [user.id]);
          } else {
            const diff = user.token_exp - nowInSeconds;
            console.log(`User ${user.id} token valide, expire dans ${diff} secondes`);
          }
        }
      } catch (error) {
        console.error('Erreur dans la tâche cron:', error);
      }
    });
}

export { check_token_validity }