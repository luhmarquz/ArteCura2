// frontend/js/perfilVisitante.js
// VERSÃO REFATORADA PARA O LAYOUT UNIFICADO (profile-banner)

// ====================================================
// 1. FUNÇÃO PARA CONTROLAR OS BOTÕES (Ações do Usuário)
// ====================================================
function renderizarAcoes(usuarioLogado, idPerfil) {
    // (CORRIGIDO) Seletores atualizados para os IDs do novo layout
    const editButton = document.getElementById("btnEditarPerfil");
    const logoutButton = document.getElementById("btnLogout"); // Botão Sair
    const labelFoto = document.getElementById("labelFotoVisitante");
    const statsButton = document.getElementById("btnAbrirModalSeguindo");
    // (REMOVIDO) O botão Deletar não está mais nesta página

    // Esconde todos os botões de ação primeiro
    [editButton, logoutButton, labelFoto, statsButton].forEach(el => {
        if (el) el.style.display = 'none';
    });

    // Se o usuário logado for o dono deste perfil
    if (usuarioLogado && usuarioLogado.tipo === 'visitante' && usuarioLogado.dados.id == idPerfil) {
        if (editButton) editButton.style.display = 'block'; 
        if (logoutButton) logoutButton.style.display = 'block';
        if (labelFoto) labelFoto.style.display = 'block'; 
        if (statsButton) statsButton.style.display = 'block'; // Mostra "Seguindo"
    } 
}

// ====================================================
// 2. FUNÇÕES DO MODAL "SEGUINDO" (Mantidas)
// ====================================================

function abrirModalSeguindo(visitanteId) {
    const modal = document.getElementById("modalSeguindo");
    const listaContainer = document.getElementById("listaModalSeguindo");
    if (!modal || !listaContainer) return;

    modal.style.display = 'flex'; 
    listaContainer.innerHTML = '<p>Carregando...</p>';

    fetch(`http://localhost:3000/perfil/visitante/${visitanteId}/seguindo`)
        .then(res => res.json())
        .then(data => {
            listaContainer.innerHTML = ''; 
            
            if (data.success && data.profissionais.length > 0) {
                data.profissionais.forEach(prof => {
                    const item = document.createElement('div');
                    item.classList.add('modal-list-item');
                    
                    const fotoURL = prof.foto_perfil 
                        ? `http://localhost:3000/uploads/${prof.foto_perfil}` 
                        : '../assets/placeholder-perfil.png';
                    
                    const username = `@${prof.nome.replace(/\s/g, '').toLowerCase()}`;

                    item.innerHTML = `
                        <img src="${fotoURL}" alt="Foto de ${prof.nome}">
                        <a href="../Profissionais/perfilProfissional.html?id=${prof.id}">
                            <p>${username}</p>
                        </a>
                    `;
                    listaContainer.appendChild(item);
                });
            } else if (data.success) {
                listaContainer.innerHTML = `<p>Você ainda não segue nenhum profissional.</p>`;
            } else {
                listaContainer.innerHTML = `<p style="color: red;">${data.message}</p>`;
            }
        })
        .catch(err => {
            console.error("Erro ao buscar quem segue:", err);
            listaContainer.innerHTML = `<p style="color: red;">Erro de conexão.</p>`;
        });
}

function fecharModalSeguindo() {
    const modal = document.getElementById("modalSeguindo");
    if (modal) modal.style.display = 'none';
}

// ====================================================
// 3. LÓGICA DE CARREGAMENTO DO PERFIL (ATUALIZADA)
// ====================================================
document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogado = getUsuarioLogado();
    const urlParams = new URLSearchParams(window.location.search);
    let visitanteId = urlParams.get('id');

    if (!visitanteId && usuarioLogado && usuarioLogado.tipo === 'visitante') {
        visitanteId = usuarioLogado.dados.id;
    }
    if (!visitanteId) {
        window.location.href = '../Visitantes/loginVisitantes.html';
        return;
    }

    // Elementos da página com novos IDs
    const h2Erro = document.getElementById("nomeUsuario"); 
    const nomeElement = document.getElementById("nomeUsuario");
    const nicknameElement = document.getElementById("nickname");
    const fotoElement = document.getElementById("fotoPerfilPreview");
    const numSeguindoElement = document.getElementById("numSeguindo");
    
    // Botões do Modal
    const btnAbrirModal = document.getElementById("btnAbrirModalSeguindo");
    const btnFecharModal = document.getElementById("btnFecharModalSeguindo");
    const modalOverlay = document.getElementById("modalSeguindo");
    
    // Botões de Ação
    const btnLogout = document.getElementById("btnLogout");
    // (REMOVIDO) btnDeletar

    // FETCH principal (Rota G)
    fetch(`http://localhost:3000/perfil/visitante/${visitanteId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const visitante = data.visitante;
                
                if (nomeElement) nomeElement.textContent = visitante.nome || "Visitante";
                if (nicknameElement) nicknameElement.textContent = `@${visitante.nome.replace(/\s/g, '').toLowerCase() || 'visitante'}`;
                
                if (numSeguindoElement) {
                     numSeguindoElement.textContent = visitante.num_seguindo || 0; 
                }

                if (fotoElement) {
                    const fotoURL = visitante.foto_perfil 
                        ? `http://localhost:3000/uploads/${visitante.foto_perfil}` 
                        : '../assets/placeholder-perfil.png';
                    fotoElement.setAttribute('src', fotoURL);
                }

                renderizarAcoes(usuarioLogado, visitanteId);
                
            } else {
                if (h2Erro) h2Erro.textContent = data.message || "Erro ao carregar perfil.";
            }
        })
        .catch(err => {
            console.error("Erro ao carregar perfil:", err);
            if (h2Erro) h2Erro.textContent = "Erro de conexão com o servidor.";
        });
        
    // Listeners do Modal
    if (btnAbrirModal) {
        btnAbrirModal.addEventListener('click', () => abrirModalSeguindo(visitanteId));
    }
    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', fecharModalSeguindo);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) fecharModalSeguindo();
        });
    }
    
    // (CORRIGIDO) Listeners dos Botões de Ação
    if (btnLogout) {
        btnLogout.addEventListener('click', logout); // Função de perfilUtils.js
    }
    // (REMOVIDO) Listener do btnDeletar
        
    // ====================================================
    // 4. LÓGICA DE UPLOAD DE FOTO (Atualizada para auto-submit)
    // ====================================================
    
    const inputFoto = document.getElementById("inputFotoVisitante"); 
    const fotoPreview = document.getElementById("fotoPerfilPreview"); 
    
    if (inputFoto && fotoPreview) {
        inputFoto.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    fotoPreview.src = e.target.result;
                }
                reader.readAsDataURL(file);
                
                // (NOVO) Auto-submit ao selecionar a foto
                submeterFoto(visitanteId);
            }
        });
    }

    function submeterFoto(visitanteId) {
        const formFoto = document.getElementById("formFotoVisitante"); 
        if (!formFoto) return;
        
        const formData = new FormData(formFoto);
        
        fetch(`http://localhost:3000/perfil/visitante/${visitanteId}/foto`, { 
            method: "POST",
            body: formData
        })
        .then(res => {
            if (!res.ok) {
                 return res.json().then(error => { throw new Error(error.message || "Falha na edição."); });
            }
            return res.json();
        })
        .then(data => {
            if (data.success) {
                alert(data.message || "Foto atualizada com sucesso!");
            } else {
                alert("Erro ao trocar foto: " + data.message);
                location.reload(); 
            }
        })
        .catch(err => {
            console.error("Erro ao enviar foto:", err);
            alert("Falha ao salvar a foto. Verifique se o servidor está rodando.");
            location.reload();
        });
    }
});