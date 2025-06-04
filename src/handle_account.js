import cron from 'node-cron';
import { getDB } from './database/database.js';

function check_token_validity() {
  cron.schedule('* * * * *', async () => {
    console.log('CRON TAB LAUNCH !!!');

    const db = getDB();
    const oneMonthInSeconds = 30 * 24 * 60 * 60; // 30 days
    const nowInSeconds = Math.floor(Date.now() / 1000);

    try {
      const users = await db.all('SELECT id, token_exp FROM users');

      for (const user of users) {
        const tokenExpSeconds = Math.floor(user.token_exp / 1000);
        const diff = nowInSeconds - tokenExpSeconds;

        if (nowInSeconds - tokenExpSeconds > oneMonthInSeconds) {
          console.log(`User ${user.id} supprimé car token expiré.`);
          await db.run('DELETE FROM users WHERE id = ?', [user.id]);
        } else {
          console.log(`User ${user.id} token valide, expire dans ${diff} secondes`);
        }
      }
    } catch (error) {
      console.error('Erreur dans la tâche cron:', error);
    }
  });
}

export { check_token_validity };
