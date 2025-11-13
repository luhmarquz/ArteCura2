// frontend/js/adicionarPostagem.js
// (VERSÃO ATUALIZADA - Sem 'append' duplicado)

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formAdicionarPostagem");

    // Verifica se a função getUsuarioLogado está disponível
    if (typeof getUsuarioLogado !== 'function') {
        console.error("Erro: perfilUtils.js não foi carregado ou a função getUsuarioLogado não existe.");
        alert("Erro crítico na página. Verifique o console.");
        return;
    }

    const usuarioLogado = getUsuarioLogado();
    if (!usuarioLogado || usuarioLogado.tipo !== 'profissional') {
        alert("Acesso negado. Você deve estar logado como profissional.");
        window.location.href = '../loginProfissional.html';
        return;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const profissionalId = usuarioLogado.dados.id;
        
        // =======================================================
        // Envio de FormData em vez de JSON
        // =======================================================

        // 1. Cria um FormData a partir do formulário
        // (Isto já inclui o título, tipo, categoria E o arquivo PDF)
        const formData = new FormData(form);

        // 2. Adiciona o ID do profissional ao FormData
        formData.append('profissional_id', profissionalId);
        
        // 3. (REMOVIDO) O bloco 'if (tipo === 'artigo')' foi removido
        // pois era redundante e causava o erro 'Unexpected field'.

        // 4. Envia o FormData para o backend
        fetch('http://localhost:3000/postagens/adicionar', {
            method: 'POST',
            body: formData 
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Postagem criada com sucesso!");
                // Redireciona para o perfil
                window.location.href = `../Profissionais/perfilProfissional.html?id=${profissionalId}`;
            } else {
                alert("Erro ao criar postagem: " + data.message);
            }
        })
        .catch(err => {
            console.error("Erro no fetch:", err);
            alert("Erro de conexão ao criar postagem.");
        });
    });
});