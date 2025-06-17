function delete_account() {
	const confirmed = confirm("Are you sure you want to delete your account ?");

	if (confirmed) {
		fetch("/api/delete_account", {
			method: "GET",
			credentials: "include", // Important: include cookies
		})
			.then(response => {
				if (response.ok) {
					updateUserAvatar('/images/avatar.jpg'); // Optionally clear avatar
					isLoggedIn = false;
					navigateTo('/');
				} else {
					console.error("Account deletion failed");
				}
			})
			.catch(err => {
				console.error("Error:", err);
			});
	}

}