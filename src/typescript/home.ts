document.addEventListener('DOMContentLoaded', () => {
  const registerBtn = document.getElementById('register');

  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/register');
        const html = await res.text();

        const contentDiv = document.getElementById('content-div');
        if (contentDiv) contentDiv.innerHTML = html;

        // Optionally load related JS (like form handling)
        //import('./public/js/register.js');
      } catch (err) {
        console.error('Error loading register view:', err);
      }
    });
  }
});

