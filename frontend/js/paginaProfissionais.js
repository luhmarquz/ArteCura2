// frontend/js/paginaProfissionais.js
// VERSÃO CORRIGIDA (Caminho do href ajustado)

document.addEventListener("DOMContentLoaded", () => {
    // 1. Elementos da página
    const container = document.getElementById("listaProfissionais");
    const formBusca = document.getElementById("formBusca");
    const inputBusca = document.getElementById("inputBusca");

    if (!container || !formBusca) {
        console.error("Erro: Elementos essenciais (container ou form) não encontrados.");
        return;
    }

    // 2. Função para buscar e renderizar os profissionais
    function buscarProfissionais(termoBusca = '') {
        container.innerHTML = '<p style="width: 100%; text-align: center;">Carregando profissionais...</p>';
        
        // Usa a Rota G de 'perfil.js' (GET /perfil/profissionais)
        const url = `http://localhost:3000/perfil/profissionais?busca=${encodeURIComponent(termoBusca)}`;

        fetch(url)
            .then(res => res.json())
            .then(profissionais => {
                container.innerHTML = ''; // Limpa "Carregando"

                if (Array.isArray(profissionais) && profissionais.length > 0) {
                    profissionais.forEach(prof => {
                        const fotoURL = prof.foto_perfil 
                            ? `http://localhost:3000/uploads/${prof.foto_perfil}` 
                            : './assets/placeholder-perfil.png'; // Caminho relativo da página

                        const perfilURL = `Profissionais/perfilProfissional.html?id=${prof.id}`;

                        const card = document.createElement('div');
                        card.className = 'card-profissional';
                        card.innerHTML = `
                            <a href="${perfilURL}">
                                <img src="${fotoURL}" alt="Foto de ${prof.nome}" class="foto-perfil-card">
                                <div class="info-card">
                                    <h3>${prof.nome}</h3>
                                    <p>${prof.especialidade || 'Sem especialidade'}</p>
                                    <p><strong>${prof.cidade || 'Sem localização'}</strong></p>
                                </div>
                            </a>
                            <a href="${perfilURL}" class="ver-perfil-btn">
                                Ver Perfil
                            </a>
                        `;
                        container.appendChild(card);
                    });
                } else {
                    container.innerHTML = '<p style="width: 100%; text-align: center;">Nenhum profissional encontrado.</p>';
                }
            })
            .catch(err => {
                console.error("Erro ao buscar profissionais:", err);
                container.innerHTML = '<p style="width: 100%; text-align: center; color: red;">Erro de conexão. Verifique se o servidor está rodando.</p>';
            });
    }

    // 3. Listener do formulário de busca
    formBusca.addEventListener("submit", (e) => {
        e.preventDefault();
        buscarProfissionais(inputBusca.value);
    });

    // 4. Carga inicial (busca todos)
    buscarProfissionais();
});