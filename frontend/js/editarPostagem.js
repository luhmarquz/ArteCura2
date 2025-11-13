// js/editarPostagem.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('formEditarPostagem');
    const msgErro = document.getElementById('msgErro');
    const btnCancelar = document.getElementById('btnCancelar');
    const linkPerfil = document.getElementById('linkPerfil');

    // 1. Verificar autenticação
    const usuario = getUsuarioLogado();
    if (!usuario || usuario.tipo !== 'profissional') {
        alert("Acesso negado. Apenas profissionais podem editar.");
        window.location.href = "../paginaInicial.html";
        return;
    }
    
    // Atualiza o link "Meu Perfil" no header
    linkPerfil.href = `perfilProfissional.html?id=${usuario.dados.id}`;

    // 2. Pegar o ID da postagem pela URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        alert("ID da postagem não encontrado.");
        window.location.href = `perfilProfissional.html?id=${usuario.dados.id}`;
        return;
    }

    // 3. Buscar dados da postagem e preencher o formulário
    fetch(`http://localhost:3000/postagens/detalhe/${postId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.postagem) {
                const post = data.postagem;
                
                // Segurança: Verifica se o ID do dono do post é o mesmo do usuário logado
                if (post.profissional_id !== usuario.dados.id) {
                    alert("Acesso negado. Você não é o dono desta postagem.");
                    window.location.href = `perfilProfissional.html?id=${usuario.dados.id}`;
                    return;
                }
                
                // Preenche o formulário
                form.tipo.value = post.tipo;
                form.categoria.value = post.categoria;
                form.titulo.value = post.titulo;
                form.capa_url.value = post.capa_url || '';
                form.conteudo_url.value = post.conteudo_url;

            } else {
                alert("Erro ao carregar postagem: " + data.message);
                msgErro.textContent = data.message;
            }
        })
        .catch(err => {
            console.error(err);
            msgErro.textContent = "Erro de conexão ao carregar dados.";
        });

    // 4. Lidar com o envio do formulário (PUT)
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const postData = {
            titulo: form.titulo.value,
            categoria: form.categoria.value,
            capa_url: form.capa_url.value || null,
            conteudo_url: form.conteudo_url.value,
            profissional_id: usuario.dados.id // ID do dono (para segurança no backend)
        };

        fetch(`http://localhost:3000/postagens/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                // Volta para o perfil
                window.location.href = `perfilProfissional.html?id=${usuario.dados.id}`;
            } else {
                alert("Erro ao salvar: " + data.message);
                msgErro.textContent = data.message;
            }
        })
        .catch(err => {
            console.error("Erro na requisição PUT:", err);
            msgErro.textContent = "Erro de conexão ao salvar.";
        });
    });
    
    // 5. Botão Cancelar
    btnCancelar.addEventListener('click', () => {
         // Apenas volta para o perfil
         window.location.href = `perfilProfissional.html?id=${usuario.dados.id}`;
    });
});