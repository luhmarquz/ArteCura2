// frontend/js/perfilProfissional.js
// VERSÃO CORRIGIDA E COM BOTÕES DE EDITAR/EXCLUIR POSTS

// ====================================================
// 1. FUNÇÃO PARA CONTROLAR OS BOTÕES (Ações do Usuário)
// ====================================================
function renderizarAcoes(usuarioLogado, idProfissional) {
    const editButton = document.getElementById("btnEditarPerfil");
    const postButton = document.getElementById("btnCriarPostagem"); 
    const followButtonContainer = document.getElementById("followButtonContainer"); 
    const labelFoto = document.getElementById("labelFotoProf");
    const btnSair = document.getElementById("btnSair"); // Pega o botão Sair

    // Esconde tudo primeiro
    [editButton, postButton, labelFoto, btnSair].forEach(el => {
        if (el) el.style.display = 'none'; // Esconde usando JS
    });
    if (followButtonContainer) followButtonContainer.style.display = 'none';

    // Se for o PRÓPRIO profissional logado
    if (usuarioLogado && usuarioLogado.tipo === 'profissional' && usuarioLogado.dados.id == idProfissional) {
        if (editButton) editButton.style.display = 'block';
        if (postButton) postButton.style.display = 'block'; 
        if (labelFoto) labelFoto.style.display = 'block';
        if (btnSair) btnSair.style.display = 'block'; // Mostra o botão Sair
    
    // Se for um VISITANTE logado
    } else if (usuarioLogado && usuarioLogado.tipo === 'visitante') {
        if (followButtonContainer) followButtonContainer.style.display = 'block';
        verificarStatusSeguindo(usuarioLogado.dados.id, idProfissional);
    }
}

// ====================================================
// 2. FUNÇÕES DE SEGUIR
// ====================================================
function verificarStatusSeguindo(visitanteId, profissionalId) {
    fetch(`http://localhost:3000/perfil/status-seguindo?seguidor_id=${visitanteId}&seguido_id=${profissionalId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderizarBotaoSeguir(data.estaSeguindo, visitanteId, profissionalId);
            }
        });
}
function renderizarBotaoSeguir(estaSeguindo, visitanteId, profissionalId) {
    const container = document.getElementById("followButtonContainer");
    if (!container) return;
    if (estaSeguindo) {
        container.innerHTML = `<button class="btn-acao-secundaria" onclick="deixarDeSeguir(${visitanteId}, ${profissionalId})">Deixar de Seguir</button>`;
    } else {
        container.innerHTML = `<button class="btn-acao-primaria" onclick="seguir(${visitanteId}, ${profissionalId})">Seguir</button>`;
    }
}
function seguir(visitanteId, profissionalId) {
    fetch('http://localhost:3000/perfil/seguir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seguidor_id: visitanteId, seguido_id: profissionalId })
    })
    .then(res => res.json())
    .then(data => { if (data.success) location.reload(); });
}
function deixarDeSeguir(visitanteId, profissionalId) {
    fetch('http://localhost:3000/perfil/deixardeseguir', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seguidor_id: visitanteId, seguido_id: profissionalId })
    })
    .then(res => res.json())
    .then(data => { if (data.success) location.reload(); });
}

// ====================================================
// 3. FUNÇÃO DE BUSCAR POSTAGENS (Links Corrigidos e Botões Adicionados)
// ====================================================
// Aceita 'isOwner' para saber se mostra os botões
function buscarPostagensProfissional(profissionalId, isOwner, tipo = '', categoria = '') {
    const listaPostsContainer = document.getElementById("listaPosts");
    const numPublicacoesElement = document.getElementById("numPublicacoes");
    
    // ==================================================================
    // Rota corrigida (como fizemos anteriormente)
    let url = `http://localhost:3000/postagens/perfil/${profissionalId}?`;
    // ==================================================================
    
    if (tipo) url += `tipo=${tipo}&`;
    if (categoria) url += `categoria=${categoria}&`;
    
    listaPostsContainer.innerHTML = "<p>Carregando postagens...</p>";
    
    fetch(url)
        .then(res => res.json())
        .then(posts => {
            listaPostsContainer.innerHTML = '';
            if (numPublicacoesElement) {
                numPublicacoesElement.textContent = posts.length || 0;
            }
            if (posts.length === 0) {
                listaPostsContainer.innerHTML = "<p>Nenhuma postagem encontrada.</p>";
                return;
            }
            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('post-item');
                
                // Link unificado para a página de visualização
                const link = `../artigo-completo.html?id=${post.id}`;

                postElement.innerHTML = `
                    <h4>${post.titulo} (Tipo: ${post.tipo})</h4>
                    <p>Categoria: ${post.categoria}</p>
                    <a href="${link}" class="ver-conteudo-link">Ver conteúdo</a>
                `;

                // Adiciona botões de Ação se for o dono
                if (isOwner) {
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'post-actions';
                    actionsDiv.style.marginTop = '10px';
                    
                    // ====================================================
                    // ✅✅✅ CORREÇÃO DA COR ✅✅✅
                    // ====================================================
                    actionsDiv.innerHTML = `
                        <a href="editarPostagem.html?id=${post.id}" class="btn-editar-post" style="margin-right: 10px; background: #add8e6; color: #333; padding: 5px 8px; border-radius: 4px; text-decoration: none; font-size: 0.9em;">Editar</a>
                        <button onclick="deletarPost(${post.id})" class="btn-deletar-post" style="background: #dc3545; color: white; padding: 5px 8px; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">Excluir</button>
                    `;
                    postElement.appendChild(actionsDiv);
                }
                
                listaPostsContainer.appendChild(postElement);
            });
        })
        .catch(err => {
            listaPostsContainer.innerHTML = "<p>Erro ao carregar postagens.</p>";
            console.error("Erro na busca de postagens:", err); // Loga o erro
        });
}

// ====================================================
// 3.5. FUNÇÃO DE DELETAR POSTAGEM
// ====================================================
function deletarPost(postId) {
    if (!confirm("Tem certeza que deseja deletar esta postagem?")) {
        return;
    }
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado || usuarioLogado.tipo !== 'profissional') {
        alert("Erro: Ação não permitida.");
        return;
    }
    const profissionalId = usuarioLogado.dados.id;

    fetch(`http://localhost:3000/postagens/${postId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profissional_id: profissionalId }) 
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Postagem deletada com sucesso!");
            location.reload(); // Recarrega a página
        } else {
            alert("Erro ao deletar: " + data.message);
        }
    })
    .catch(err => {
        console.error("Erro na requisição:", err);
        alert("Erro de conexão ao deletar.");
    });
}

// ====================================================
// 4. PRINCIPAL: CARREGAMENTO DOS DADOS (Negrito Corrigido)
// ====================================================
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id"); 
    const usuarioLogado = getUsuarioLogado();
    let profissionalId = id; 

    if (!profissionalId && usuarioLogado && usuarioLogado.tipo === 'profissional') {
        profissionalId = usuarioLogado.dados.id;
        if (profissionalId && window.location.search === "") {
             window.location.href = `perfilProfissional.html?id=${profissionalId}`;
             return; 
        }
    }
    if (!profissionalId) {
        document.getElementById("nomeUsuario").textContent = "Perfil não encontrado.";
        return;
    }

    // Calcula se o usuário logado é o dono
    const isOwner = usuarioLogado && usuarioLogado.tipo === 'profissional' && usuarioLogado.dados.id == profissionalId;

    // Fetch principal
    fetch(`http://localhost:3000/perfil/profissional/${profissionalId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const prof = data.profissional;
                document.getElementById("nomeUsuario").textContent = prof.nome;
                document.getElementById("nickname").textContent = `@${prof.nome.toLowerCase().replace(/\s/g, '')}`;
                
                document.getElementById("localizacao").innerHTML = `<strong>Localização:</strong> ${prof.cidade || 'N/D'}`;
                document.getElementById("formacao").innerHTML = `<strong>Formação:</strong> ${prof.especialidade || 'N/D'}`;
                
                document.getElementById("bio").innerHTML = `<p>${prof.bio || "Sem biografia."}</p>`;
                document.getElementById("numSeguidores").textContent = prof.num_seguidores || 0;
                
                const whatsappLink = prof.whatsapp ? `https://wa.me/${prof.whatsapp}` : '#';
                const instagramLink = prof.instagram ? `https://instagram.com/${prof.instagram}` : '#';
                
                const socialContainer = document.querySelector(".social-links");
                if (socialContainer) {
                     socialContainer.innerHTML = `
                        <p><a id="linkInstagram" href="${instagramLink}">Instagram: ${prof.instagram || 'N/D'}</a></p>
                        <p><a id="linkWhatsapp" href="${whatsappLink}">Whatsapp: ${prof.whatsapp || 'N/D'}</a></p>
                     `;
                }

                const fotoURL = prof.foto_perfil 
                    ? `http://localhost:3000/uploads/${prof.foto_perfil}` 
                    : '../assets/placeholder-perfil.png'; 
                document.getElementById("fotoPerfilPreview").src = fotoURL;

                renderizarAcoes(usuarioLogado, profissionalId);
                // Passa 'isOwner' para a função
                buscarPostagensProfissional(profissionalId, isOwner);
            } else {
                document.getElementById("nomeUsuario").textContent = data.message;
            }
        })
        .catch(err => {
            console.error("Erro ao carregar perfil:", err);
            document.getElementById("nomeUsuario").textContent = "Erro de conexão.";
        });
        
    const btnFiltrar = document.getElementById('btnFiltrarPosts');
    btnFiltrar?.addEventListener('click', () => {
        const tipo = document.getElementById('filtroTipo').value;
        const categoria = document.getElementById('filtroCategoria').value;
        // Passa 'isOwner' aqui também
        const isOwner = usuarioLogado && usuarioLogado.tipo === 'profissional' && usuarioLogado.dados.id == profissionalId;
        buscarPostagensProfissional(profissionalId, isOwner, tipo, categoria);
    });

    // ====================================================
    // 5. LÓGICA DE UPLOAD DA FOTO
    // ====================================================
    const inputFoto = document.getElementById("inputFotoProf");
    const formFoto = document.getElementById("formFotoProf");
    const fotoPreview = document.getElementById("fotoPerfilPreview");
    inputFoto?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => { fotoPreview.src = e.target.result; }
        reader.readAsDataURL(file);

        if (usuarioLogado && usuarioLogado.tipo === 'profissional' && usuarioLogado.dados.id == profissionalId) {
            const formData = new FormData(formFoto);
            fetch(`http://localhost:3000/perfil/profissional/${profissionalId}/foto`, { 
                method: "POST", 
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert(data.message || "Foto atualizada!");
                } else {
                    alert("Erro ao trocar foto: " + data.message);
                    location.reload(); 
                }
            })
            .catch(err => {
                console.error("Erro ao enviar foto:", err);
                alert("Erro de conexão ao trocar foto.");
            });
        }
    });
    
    // ====================================================
    // 6. LÓGICA DO BOTÃO SAIR
    // ====================================================
    const btnSair = document.getElementById("btnSair");
    btnSair?.addEventListener("click", () => {
        if (confirm("Tem certeza que deseja sair da sua conta?")) {
            logout(); // Esta função deve estar no seu perfilUtils.js
        }
    });
});