async function isLoggedIn(): Promise<boolean> {
	try {
		const response = await fetch("/api/isLoggedIn", {
  			method: "GET",
  			credentials: "include"
		});
		if (response.status == 400 || response.status == 404) {
			console.error("User doesn't exist");
			return (false);
		}

		if (response.status == 500) {
			console.error("Backend error");
			return (false);
		}

		const data = await response.json();
		return (data.connected);
	}
	catch (err) {
		console.error("isLoggedIn error:", err);
		return false;
	}
}
