document.addEventListener('DOMContentLoaded', () => {
  const registerBtn = document.getElementById('matchBtn');

  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
      try {
        await fetch("/game_menu")
          .then(response => response.text())
          .then(html => {
      var content = document.getElementById("content-div");
      if (!content)
        throw new Error("Content div not found");
      content.innerHTML = html;
      })
      } catch (err) {
        console.error('Error loading game_menu view:', err);
      }
    });
  }
});

async function pongRedir() {
  try {
    const response = await fetch("/pong_ia");
    const html = await response.text();
    const content = document.getElementById("content-div");
    if (!content) throw new Error("Content div not found");
    content.innerHTML = html;

    // Now the canvas from pong_ia is in the DOM — call the game initializer
    ft_pong();

  } catch (err) {
    console.error('Error loading pong_ia view:', err);
  }
}

