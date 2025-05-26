document.addEventListener('DOMContentLoaded', () => {
  const registerBtn = document.getElementById('register');

  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
      try {
        // const res = await fetch('/api/register', {});
        // .then
        // const html = await res.text();
        await fetch("/api/register")
          .then(response => response.text())
          .then(html => {
      var content = document.getElementById("content-div");
      if (!content)
        throw new Error("Content div not found");
      content.innerHTML = html;
      })
        // Optionally load related JS (like form handling)
        //import('./public/js/register.js');
      } catch (err) {
        console.error('Error loading register view:', err);
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login');

  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      try {
        // const res = await fetch('/api/register', {});
        // .then
        // const html = await res.text();
        await fetch("/api/login")
          .then(response => response.text())
          .then(html => {
      var content = document.getElementById("content-div");
      if (!content)
        throw new Error("Content div not found");
      content.innerHTML = html;
      })
        // Optionally load related JS (like form handling)
        //import('./public/js/register.js');
      } catch (err) {
        console.error('Error loading login view:', err);
      }
    });
  }
});
