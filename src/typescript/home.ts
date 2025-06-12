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

function injectViewToContentDiv(data: string): Promise<void> {
    return new Promise((resolve) => {
        const contentDiv = document.getElementById('content-div') as HTMLDivElement;
        contentDiv.innerHTML = data;
        resolve(); // Resolve after DOM update
    });
}

async function handleCredentialResponse(response: any) {
	const errorMsg = document.getElementById("form-error-msg");
	if (!errorMsg)
		return;
  const res = await fetch('/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ Token: response.credential }),
  });
  if (res.ok)
    console.log('success')
  else if (res.status === 400)
  {
    const response = await res.json();
    console.log(response.error)
    errorMsg.textContent = response.error;

  }
  // Send to backend for verification
}

function oauth2() {
  var btn = document.getElementById("g_id_signin") as HTMLDivElement;
  if (btn) {    google.accounts.id.initialize({
      client_id: "998291091717-69t8ub79jvhdfq195vqtc93buajcgsaf.apps.googleusercontent.com",
      callback: handleCredentialResponse,
      auto_select: false,
    });
    google.accounts.id.renderButton(
      btn,
      { theme: "outline", size: "large", type: "standard"   })
  }
}


