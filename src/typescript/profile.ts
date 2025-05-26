interface UserData {
  name: string;
  email: string;
  avatarPath: string
}

// Function to fetch and update profile data 
const getProfileData = () =>
{
  fetch('/api/profile')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      return response.json(); // ✅ return the parsed JSON
    })
  .then(data => {console.log(data)
    updateFields(data);})
}

// Function to update the input fields with user data
const updateFields = (data: UserData) => {
  const mail: string = data.email
  const username: string = data.name
  const avatar_file_name: string = data.avatarPath

  const mail_input = document.getElementById('email') as HTMLInputElement;
  const username_input = document.getElementById('uname') as HTMLInputElement;
  const img_avatar = document.getElementById('avatar-preview') as HTMLImageElement;

  if (!mail || !username || !img_avatar){
    console.log("error while reading user data");
    return ;
  }
  if (mail_input && username_input) {
    mail_input.value = mail;
    username_input.value = username;
    img_avatar.src = "images/" + avatar_file_name
  }
}

function getFriends(): void {
  // Select all checked checkboxes inside the document
  const checkedBoxes: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[type="checkbox"]:checked');

  // Extract values (friend names)
  const selectedFriends: string[] = Array.from(checkedBoxes).map(cb => cb.value);

  if (selectedFriends.length === 0) {
    alert("No friends selected");
  } else {
    alert("Selected friends: " + selectedFriends.join(", "));
  }
}

// function updateUser() {
// 	const formElement = document.getElementById("updateForm") as HTMLFormElement;
// 	// if (!formElement)
// 	// 	return;
// 	// const errorMsg = document.getElementById("form-error-msg");
// 	// if (!errorMsg)
// 	// 	return;
// 	// errorMsg.textContent = ""; // Reset previous error
// 	// errorMsg.style.color = "red";
// 	const formData = new FormData(formElement);
// 	const xhttp = new XMLHttpRequest();

// 	xhttp.onreadystatechange = function ()
// 	{
// 		if (this.readyState === 4)
// 		{
// 			try
// 			{
// 				if (this.status === 400 || this.status === 500)
// 				{
// 					const response = JSON.parse(this.responseText);
// 				 	// errorMsg.textContent = response.error || "An error occurred.";
// 				}
// 				if (this.status === 200)
// 				{
//           alert("User updated successfully!");
// 					// errorMsg.style.color = "green";
// 					// errorMsg.textContent = "User registered successfully!";
// 				}
// 			}
// 			catch (e)
// 			{
// 				// errorMsg.textContent = "Unexpected errro";
// 			}
// 		}
// 	};

// 	xhttp.open("POST", "/api/profile", true);
// 	// console.log(formData);
// 	xhttp.send(formData);
// }
