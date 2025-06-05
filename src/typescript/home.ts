var isLoggedIn = false;


const loginRedir = async () => {
  try {
    await fetch("/api/login")
      .then(response => response.text())
      .then(html => {
        var content = document.getElementById("content-div");
        if (!content)
          throw new Error("Content div not found");
        content.innerHTML = html;
      })
  } catch (err) {
    console.error('Error loading login view:', err);
  }
}

const registerRedir = async () => {
  try {
    await fetch("/api/register")
      .then(response => response.text())
      .then(html => {
        var content = document.getElementById("content-div");
        if (!content)
          throw new Error("Content div not found");
        content.innerHTML = html;
      })
  } catch (err) {
    console.error('Error loading register view:', err);
  }
}

function injectViewToContentDiv(data: any) {
  const contentDiv = document.getElementById('content-div') as HTMLDivElement;
  contentDiv.innerHTML = data;
}
