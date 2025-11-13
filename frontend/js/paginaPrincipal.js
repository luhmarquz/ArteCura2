document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (!usuarioLogado) {
        window.location.href = "../frontend/Visitantes/loginVisitantes.html";
        return;
    }

    const usuario = JSON.parse(usuarioLogado);
    document.getElementById("usuarioLogado").textContent = `Olá, ${usuario.dados.nome}!`;
document.getElementById("linkPerfil").href = usuario.tipo === "profissional"
    ? `Profissionais/perfilProfissional.html?id=${usuario.dados.id}` // O ID deve vir daqui!
    : `Visitantes/perfilVisitante.html?id=${usuario.dados.id}`;
});

function logout() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "../frontend/Visitantes/loginVisitantes.html";
}


  let slideAtual = 0;
  function mudarSlide(n) {
    const slides = document.getElementById('slides');
    slideAtual = n;
    slides.style.transform = `translateX(-${n * 100}%)`;
  }