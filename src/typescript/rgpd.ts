document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('RGPD');

  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      try {
        await fetch("/rgpd")
          .then(response => response.text())
          .then(html => {
      var content = document.getElementById("content-div");
      if (!content)
        throw new Error("Content div not found");
      content.innerHTML = html;
      })
      } catch (err) {
        console.error('Error loading login rgpd view:', err);
      }
    });
  }
});
