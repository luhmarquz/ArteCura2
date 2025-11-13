document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogado = getUsuarioLogado();
    const form = document.getElementById("formEditarPerfilVisitante");

    if (!usuarioLogado || usuarioLogado.tipo !== 'visitante') {
        alert("Você precisa estar logado como Visitante para editar o perfil.");
        window.location.href = '../Visitantes/loginVisitantes.html';
        return;
    }

    const visitanteId = usuarioLogado.dados.id;

    // ====================================================
    // 1. CARREGAR DADOS EXISTENTES
    // ====================================================
    fetch(`http://localhost:3000/perfil/visitante/${visitanteId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const visitante = data.visitante;
                
                // Preencher o formulário
                document.getElementById("nome").value = visitante.nome || '';
                document.getElementById("email").value = visitante.email || '';

                // NOTA: 'bio' foi removida do formulário e, portanto, do JS

            } else {
                alert("Erro ao carregar dados do perfil: " + data.message);
            }
        })
        .catch(err => {
            console.error("Erro de conexão ao carregar perfil:", err);
            alert("Erro de conexão com o servidor ao carregar perfil.");
        });


    // ====================================================
    // 2. ENVIAR FORMULÁRIO DE EDIÇÃO
    // ====================================================
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value; // Pode estar vazio

        const dadosAtualizados = {
            nome: nome,
            email: email,
        };

        // CORREÇÃO NO FRONTEND: Adiciona a senha APENAS se houver um valor
        if (senha && senha.trim() !== '') { // Verifica se não é vazio nem só espaços
            dadosAtualizados.senha = senha;
        }
        // Rota PUT para atualizar os dados do visitante
        fetch(`http://localhost:3000/perfil/visitante/${visitanteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosAtualizados)
        })
        .then(res => {
            // Se a resposta não for OK (status 400, 500, etc.), lança um erro
            if (!res.ok) {
                return res.json().then(error => { throw new Error(error.message || "Falha na edição."); });
            }
            return res.json();
        })
        .then(data => {
            if (data.success) {
                alert("Perfil atualizado com sucesso!");
                window.location.href = 'perfilVisitante.html'; 
            } else {
                alert("Erro ao atualizar perfil: " + data.message);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert("Erro ao tentar salvar alterações: " + error.message);
        });
    });
});