async function pong_ia_redir() {
  if(!username)
    return;
  try {
    const response = await fetch("/pong_ia");
    const html = await response.text();
    const content = document.getElementById("content-div");
    if (!content) throw new Error("Content div not found");
      content.innerHTML = html;
      load_script(username, "Bot");

      var left_name = document.getElementById("left-player-name") as HTMLDivElement
      if (left_name)
        left_name.innerHTML = username;
    }

   catch (err) {
    console.error("Error loading pong_ia view:", err);
  }
}
