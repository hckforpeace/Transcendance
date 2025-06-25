function showQRCode(qrCode: string, secret: string) {
	const mainDiv = document.getElementById("content-div");
	if (!mainDiv)
		return;

	mainDiv.innerHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div class="bg-white p-6 rounded-lg shadow-lg text-center">
                <h2 class="text-xl font-bold mb-4">Scan this QR Code</h2>
                <img src="${qrCode}" alt="Scan this QR code with your authentication app" class="w-full max-w-xs mx-auto">
                <div class="relative mt-4">
                  <p class="text-gray-700">Hover to reveal the secret:</p>
                  <div class="relative w-full max-w-xs mx-auto h-12 bg-noise hover:bg-transparent text-gray-700 py-2 px-4 rounded-lg cursor-pointer">
                    <span class="bg-noise absolute inset-0 flex items-center justify-center text-transparent hover:text-black break-all">${secret}</span>
                  </div>
                </div>
                 <button onclick="navigateTo('/login')" class="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg">Done</button>
              </div>
            </div>
          `;
}

/**
 * @brief Register a new user if not exist
 */
function register() {
	const formElement = document.getElementById("register-form") as HTMLFormElement;
	if (!formElement)
		return;
	const errorMsg = document.getElementById("form-error-msg");
	if (!errorMsg)
		return;
	errorMsg.textContent = ""; // Reset previous error
	errorMsg.style.color = "red";
	const formData = new FormData(formElement);
	const xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function ()
	{
		if (this.readyState === 4)
		{
			try
			{
				if (this.status === 400 || this.status === 500)
				{
					const response = JSON.parse(this.responseText);
				 	errorMsg.textContent = response.error || "An error occurred.";
				}
				if (this.status === 200) {
					const response = JSON.parse(this.responseText);
					const qrcode = response.qrCode;
					// const qrcode = this.response;
					const secret = decodeURIComponent(response.secret);
					if (!qrcode) {
						navigateTo('/login');
						errorMsg.style.color = "green";
						errorMsg.textContent = "User registered successfully!";
					} else {
						showQRCode(qrcode, secret);
					}
				}
			}
			catch (e)
			{
				errorMsg.textContent = "Unexpected error";
			}
		}
	};

	xhttp.open("POST", "/api/register", true);
	// console.log(formData);
	xhttp.send(formData);

}


function previewAvatar(event: Event): void {
  const input = event.target as HTMLInputElement;
  const preview = document.getElementById('avatar-preview') as HTMLImageElement | null;

  if (!input || !input.files || !preview) return;

  const file = input.files[0];
  if (!file) {
    preview.src = "";
    preview.classList.add('hidden');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    if (!e.target || !preview) return;
    preview.src = e.target.result as string;
    preview.classList.remove('hidden');
  };

  reader.readAsDataURL(file);
}
