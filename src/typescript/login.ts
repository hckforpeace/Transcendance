// console.log("login");

// var form = document.getElementById('login');

// var button = document.getElementById('submit');

// if (button != null)
// {
//   button.addEventListener('click', function() {
//     console.log("submited")
//   })
// }
// const form = document.getElementById('form');
// console.log(form);
// console.log('begin')
// function logSubmit(event: any) {
//   event.preventDefault();
//  console.log('submit');
// }


// if (form != null)
//   form.addEventListener("submit", logSubmit);
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form");
  const url:string = "https://localhost:8080/api/login"

  if (!form) 
    return;

  function logSubmit(event: any)
  {
    event.preventDefault(); // Prevent default form submission
    const uname = document.getElementById('uname');
    const pw = document.getElementById('pw');
    console.log("Submit event triggered!");
    fetch(url, {
      method: 'POST',
      headers: {"Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "test",
        password: "1234",
      }),
    })

  }

  form.addEventListener("submit", logSubmit);
  console.log("Event listener attached to form!");
});

