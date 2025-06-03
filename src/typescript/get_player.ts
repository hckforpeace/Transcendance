export async function getPlayerUsername(token: string): Promise<string | null> {
  try {
    const response = await fetch('/api/player', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur serveur: ${response.status}`);
    }

    const username = await response.text(); // ou .json() selon ta réponse backend
    return username;
  } catch (error) {
    console.error("Erreur lors de la récupération du joueur:", error);
    return null;
  }
}