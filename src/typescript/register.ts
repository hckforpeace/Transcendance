// // Construct the register URL dynamically
const currentUrl = window.location.hostname;
const currentPort = window.location.port;

// public/js/register.ts
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
      };

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok) {
          alert('Registered successfully');
          // Optionally: redirect or load another view
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (err) {
        console.error('Registration failed:', err);
      }
    });
  }
});
