document.addEventListener("DOMContentLoaded", () => {
    const selectFiltro = document.querySelector(".filtro");
    const grid = document.querySelector(".grid-videos");

    function carregarVideos(categoria = "") {
        fetch("http://localhost:3000/postagens/tipo/video")
  .then(res => res.json())
  .then(posts => {
    console.log("Vídeos:", posts);
                grid.innerHTML = "";
                videos.forEach(video => {
                    const div = document.createElement("div");
                    div.className = "video-item";
                    div.innerHTML = `
                        <img src="${video.thumb}" alt="Capa do vídeo">
                        <h3>${video.titulo}</h3>
                        <span>${video.categoria}</span>
                    `;
                    grid.appendChild(div);
                });
            });
    }

    selectFiltro?.addEventListener("change", () => {
        carregarVideos(selectFiltro.value);
    });

    carregarVideos();
});
