async function pong_ia_redir() {
  try {
    const response = await fetch("/pong_ia");
    const html = await response.text();

    const content = document.getElementById("content-div");
    if (!content) throw new Error("Content div not found");

    // Injecte le HTML dans le DOM
    content.innerHTML = html;

    // Charge le script manuellement car les <script> injectés via innerHTML ne sont pas exécutés
    const script = document.createElement("script");
    script.src = "/js/pong_ia.js";
    script.onload = () => {
      if (typeof ft_pong_ia === "function") {
        ft_pong_ia(); // Appelle ft_pong une fois le script chargé
      } else {
        console.error("ft_pong n'est pas défini après chargement du script.");
      }
    };
    document.body.appendChild(script);

  } catch (err) {
    console.error("Error loading pong_ia view:", err);
  }
}

