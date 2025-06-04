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