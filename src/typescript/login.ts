const headerLoginRequest = (uname: string, pw: string ) => ({
  method: 'POST',
  headers: {"Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: uname,
    password: pw,
  }),
})

async function login(url:string,  header:any){
  
  await fetch(url, header)
    .then((response) => {
      if (response.ok) {
        console.log("Login successful!");
      } else {
        console.error("Login failed!");
        throw new Error("Login failed");
      }
    })
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form");
  const url:string = "https://localhost:8080/api/login"

  if (!form) 
    return;
  function logSubmit(event: any)

  {
    event.preventDefault(); // Prevent default form submission
    const uname = document.getElementById('uname') as HTMLInputElement;
    const pw = document.getElementById('pw') as HTMLInputElement;
    if (!uname || !pw) 
      return;
    // console.log(uname.value, pw.innerHTML);
    login(url, headerLoginRequest(uname.value, pw.value));
  }
  form.addEventListener("submit", logSubmit);
});

