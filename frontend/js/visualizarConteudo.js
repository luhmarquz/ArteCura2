// js/visualizarConteudo.js
// VERSÃO ATUALIZADA - "Inteligente" (funciona para Artigos e Vídeos)

document.addEventListener("DOMContentLoaded", () => {
    // Elementos da página
    const tituloElement = document.getElementById("tituloPagina");
    const h1Element = document.querySelector("#conteudoPostagem h1");
    const autorElement = document.getElementById("nomeAutor");
    const dataElement = document.getElementById("dataPublicacao");
    const categoriaElement = document.getElementById("categoriaPostagem");
    const corpoConteudoElement = document.getElementById("corpoConteudo");
    const msgErroElement = document.querySelector(".msg-erro");

    // 1. Pegar o ID da URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        msgErroElement.textContent = "Erro: ID da postagem não fornecido.";
        return;
    }

    // 2. (NOVO) Função para extrair ID do YouTube
    function extrairVideoID(url) {
        let videoId = null;
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === "youtu.be") {
                videoId = urlObj.pathname.slice(1);
            } else if (urlObj.hostname.includes("youtube.com")) {
                videoId = urlObj.searchParams.get("v");
            }
        } catch (e) {
            console.error("URL de vídeo inválida:", e);
        }
        return videoId;
    }

    // 3. Buscar os dados da postagem usando a rota de detalhe
    fetch(`http://localhost:3000/postagens/detalhe/${postId}`)
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => { throw new Error(err.message); });
            }
            return res.json();
        })
        .then(data => {
            if (data.success && data.postagem) {
                const post = data.postagem;

                // 4. Preencher os dados comuns na página
                tituloElement.textContent = post.titulo; // Título da aba
                h1Element.textContent = post.titulo; // Título H1
                autorElement.textContent = post.nome_autor || 'Desconhecido';
                categoriaElement.textContent = post.categoria || 'N/A';
                
                const dataFormatada = new Date(post.data_criacao).toLocaleDateString('pt-BR');
                dataElement.textContent = dataFormatada;

                // Limpa o "Carregando..."
                corpoConteudoElement.innerHTML = '';

                // =======================================================
                // 5. (NOVO) LÓGICA DE RENDERIZAÇÃO (Artigo vs Vídeo)
                // =======================================================
                
                if (post.tipo.toLowerCase() === 'video') {
                    // Se for VÍDEO, incorpora o player
                    const videoId = extrairVideoID(post.conteudo_url);
                    
                    if (videoId) {
                        const videoContainer = document.createElement('div');
                        videoContainer.className = 'video-embed-container'; // Classe para estilização
                        videoContainer.innerHTML = `
                            <iframe 
                                width="100%" 
                                height="480" 
                                src="https://www.youtube.com/embed/${videoId}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        `;
                        corpoConteudoElement.appendChild(videoContainer);
                    } else {
                        // Fallback se a URL do YouTube for inválida
                        corpoConteudoElement.innerHTML = `<p style="color:red;">Link do YouTube inválido ou não reconhecido. <a href="${post.conteudo_url}" target="_blank">Ver link direto</a></p>`;
                    }

                } else {
                    // Se for ARTIGO, mostra o link externo (Lógica antiga)
                    const p = document.createElement('p');
                    p.textContent = "Este conteúdo está disponível em um link externo. Clique no botão abaixo para acessá-lo:";
                    
                    const a = document.createElement('a');
                    a.href = post.conteudo_url; // O link externo
                    a.target = "_blank"; // Abre em nova aba
                    a.textContent = "Acessar Artigo"; 
                    a.classList.add("link-externo-artigo"); // Classe para estilização (verde)

                    corpoConteudoElement.appendChild(p);
                    corpoConteudoElement.appendChild(a);
                }

            } else {
                msgErroElement.textContent = data.message || "Postagem não encontrada.";
            }
        })
        .catch(err => {
            console.error("Erro ao buscar postagem:", err);
            msgErroElement.textContent = `Erro de conexão: ${err.message}`;
        });
});