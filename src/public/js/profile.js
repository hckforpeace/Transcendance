"use strict";
var socket;
// Function to fetch and update profile data 
const getProfileData = () => {
    fetch('/api/profile/info')
        .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        return response.json(); // ✅ return the parsed JSON
    })
        .then(data => {
        console.log(data);
        updateFields(data);
    });
};
// Function to update the input fields with user data
const updateFields = (data) => {
    const mail = data.email;
    const username = data.name;
    const avatar_file_name = data.avatarPath;
    const mail_input = document.getElementById('email');
    const username_input = document.getElementById('uname');
    const img_avatar = document.getElementById('avatar-preview');
    if (!mail || !username || !img_avatar) {
        console.log("error while reading user data");
        return;
    }
    if (mail_input && username_input) {
        mail_input.value = mail;
        username_input.value = username;
        img_avatar.src = "images/" + avatar_file_name;
    }
};
// Add Friends Section
const getFriendsList = () => {
    fetch('/api/profile/friends')
        .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        return response.json(); // ✅ return the parsed JSON
    })
        .then(data => {
        data.forEach((item) => {
            filladdFriendsDiv(item.id, item.name);
        });
    });
};
function filladdFriendsDiv(id, name) {
    var friendDiv, inputTag, labelTag;
    const div = document.getElementById('notFriends');
    if (!div)
        return;
    friendDiv = document.createElement('div');
    inputTag = document.createElement('input');
    inputTag.type = 'checkbox';
    inputTag.id = id.toString();
    inputTag.classList.add('peer', 'hidden');
    inputTag.value = name;
    inputTag.name = "addFriends";
    labelTag = document.createElement('label');
    labelTag.setAttribute("for", id.toString());
    labelTag.classList.add("flex", "justify-center", "py-2", "border-b", "cursor-pointer", "peer-checked:bg-blue-100", "transition-colors", "rounded", "text-lg", "font-medium");
    labelTag.innerHTML = name;
    friendDiv.appendChild(inputTag);
    friendDiv.appendChild(labelTag);
    div.appendChild(friendDiv);
}
function getFriends() {
    // Select all checked checkboxes inside the document
    const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
    // Extract values (friend name and ID)
    const selectedFriends = Array.from(checkedBoxes).map(cb => ({
        id: cb.id,
        name: cb.value
    }));
    if (selectedFriends.length === 0) {
        return;
    }
    else {
        selectedFriends.forEach(element => {
            fetch("/api/profile/friends/" + element.id, { method: "PATCH" })
                .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch');
                }
                return response.json(); // ✅ return the parsed JSON
            });
        });
    } // Remove each friend's container div
    checkedBoxes.forEach(cb => {
        const friendDiv = cb.closest('div');
        if (friendDiv) {
            friendDiv.remove();
        }
    });
}
// TODO
function UpdateActualFriends() {
    const div = document.createElement('div');
    const div1 = document.createElement('div');
    const p = document.createElement('p');
    const p1 = document.createElement('p');
}
// function 
function displayProfileFriends() {
    fetch('/api/profile/friends')
        .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        return response.json(); // ✅ return the parsed JSON
    })
        .then(data => {
        console.log(data);
        updateFields(data);
    });
}
function socketConnection() {
    const socket = new WebSocket('wss://' + currentRoot + '/api/profile/socket');
    socket.onopen = () => {
        console.log('WebSocket connected');
    };
    socket.onclose = () => {
        console.log('WebSocket disconnected');
    };
    socket.onmessage = (event) => {
        console.log('Message:', event.data);
    };
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
getProfileData();
