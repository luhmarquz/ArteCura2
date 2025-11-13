// frontend/js/listarConteudo.js
// VERSÃO ATUALIZADA (Novo Card Roxo + Link Interno)

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("listaConteudo");
    const inputBusca = document.getElementById("inputBusca");
    const selectCategoria = document.getElementById("filtroCategoria"); // ID corrigido
    const btnBusca = document.getElementById("btnBusca");

    if (!container) {
        console.error("❌ Elemento 'listaConteudo' não encontrado.");
        return;
    }

    // =====================================================
    // Detecta automaticamente se a página é de ARTIGOS ou VÍDEOS
    // =====================================================
    const pagina = window.location.pathname.toLowerCase();
    let baseUrl = 'http://localhost:3000/postagens/';

    if (pagina.includes('artigo')) {
        baseUrl += 'artigos';
        console.log("📄 Página detectada: ARTIGOS");
    } else if (pagina.includes('video')) {
        baseUrl += 'videos';
        console.log("🎥 Página detectada: VÍDEOS");
    } else {
        // Fallback
        baseUrl += 'artigos';
        console.log("📚 Página genérica detectada — carregando ARTIGOS por padrão");
    }

    // =====================================================
    // Função para buscar e renderizar os dados
    // =====================================================
    function carregarConteudo(categoria = '', busca = '') {
        container.innerHTML = '<p>Carregando...</p>';

        // Constrói a URL com os filtros
        const params = new URLSearchParams();
        if (categoria) params.append('categoria', categoria);
        if (busca) params.append('busca', busca);
        
        const url = `${baseUrl}?${params.toString()}`;

        fetch(url)
            .then(async res => {
                if (!res.ok) {
                    throw new Error(`Erro HTTP: ${res.status}`);
                }
                const data = await res.json();
                console.log("✅ Dados recebidos do servidor:", data);
                return data;
            })
            .then(data => {
                // Se nenhum resultado foi encontrado
                if (!Array.isArray(data) || data.length === 0) {
                    container.innerHTML = `<p>Nenhum conteúdo encontrado.</p>`;
                    return;
                }

                // =====================================================
                // Monta visualmente cada postagem (NOVO DESIGN)
                // =====================================================
                const html = data.map(post => {
                    const nomeAutor = post.nome_autor || "Profissional Anônimo";

                    // ✅✅✅ CORREÇÃO DOS LINKS (Conforme sua solicitação) ✅✅✅
                    // Define para qual página interna o link vai
                    const isVideo = post.tipo.toLowerCase().includes('video');
                    const link = isVideo
                        ? `videosPaginaLayout.html?id=${post.id}`
                        : `artigo-completo.html?id=${post.id}`;
                    
                    const linkText = isVideo ? 'Assistir Vídeo' : 'Ler Artigo Completo';

                    return `
                        <div class="card-conteudo">
                            <div class="card-header">
                                <h3>${post.titulo}</h3>
                            </div>
                            <div class="card-body">
                                <p class="card-meta">
                                    Por: <a href="perfilProfissional.html?id=${post.autor_id}" class="autor-link">${nomeAutor}</a>
                                </p>
                                <p class="card-meta">
                                    Categoria: <strong>${post.categoria || 'N/A'}</strong>
                                </p>
                                
                                <div class="card-footer">
                                    <a href="${link}" class="btn-ler-mais">${linkText}</a>
                                </div>
                            </div>
                        </div>
                    `;
                }).join("");

                container.innerHTML = html;
            })
            .catch(err => {
                console.error("❌ Erro ao carregar conteúdo:", err);
                container.innerHTML = `<p style="color:red;">Erro ao carregar o conteúdo. Verifique se o servidor Node está rodando.</p>`;
            });
    }

    // =====================================================
    // Listeners dos Filtros
    // =====================================================
    if (btnBusca) {
        btnBusca.addEventListener('click', () => {
            carregarConteudo(selectCategoria.value, inputBusca.value);
        });
    } else {
        console.warn("Botão de busca não encontrado.");
    }
    
    // (NOVO) Adiciona listener para o select também
    if(selectCategoria) {
        selectCategoria.addEventListener('change', () => {
             carregarConteudo(selectCategoria.value, inputBusca.value);
        });
    }

    // Carga inicial
    carregarConteudo();
});