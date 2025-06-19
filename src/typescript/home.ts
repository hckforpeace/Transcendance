var isLoggedIn = false;

function injectViewToContentDiv(data: string): Promise<void> {
    return new Promise((resolve) => {
        const contentDiv = document.getElementById('content-div') as HTMLDivElement;
        contentDiv.innerHTML = data;
        resolve(); // Resolve after DOM update
    });
}

// document.addEventListener('DOMContentLoaded', () => {
//   const loginBtn = document.getElementById('login');

//   if (loginBtn) {
//     loginBtn.addEventListener('click', async () => {
//       try {
//         // const res = await fetch('/api/register', {});
//         // .then
//         // const html = await res.text();
//         await fetch("/api/login")
//           .then(response => response.text())
//           .then(html => {
//       var content = document.getElementById("content-div");
//       if (!content)
//         throw new Error("Content div not found");
//       content.innerHTML = html;
//       })
//         // Optionally load related JS (like form handling)
//         //import('./public/js/register.js');
//       } catch (err) {
//         console.error('Error loading login view:', err);
//       }
//     });
//   }
// });


const registerRedir = async () =>
{

      try {
// //         // const res = await fetch('/api/register', {});
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

}

const loginRedir = async () => {
    try {
        // //         // const res = await fetch('/api/register', {});
        // .then
        // const html = await res.text();
        await fetch("/api/login")
            .then(response => response.text())
            .then(html => {
        var content = document.getElementById("content-div");
        if (!content)
            throw new Error("Content div not found");
        content.innerHTML = html;
        });
        // Optionally load related JS (like form handling)
        //import('./public/js/register.js');
    }
    catch (err) {
        console.error('Error loading login view:', err);
    }
};
