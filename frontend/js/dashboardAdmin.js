// frontend/js/dashboardAdmin.js

document.addEventListener("DOMContentLoaded", () => {
    // Elementos do Formulário
    const form = document.getElementById("formCadastrarProfissional");
    const msgErroForm = document.getElementById("msgErroForm");
    const msgSucessoForm = document.getElementById("msgSucessoForm");
    
    // Tabela
    const tabelaBody = document.getElementById("tabelaProfissionaisBody");
    
    // Autenticação
    const usuarioLogado = getUsuarioLogado();
    if (!usuarioLogado || usuarioLogado.tipo !== 'administrador') {
        alert("Acesso negado. Você precisa estar logado como Administrador.");
        window.location.href = './loginAdmin.html'; // Volta para o login
        return;
    }

    // Exibe o email do ADM logado
    document.getElementById('usuarioLogado').textContent = `Logado como: ${usuarioLogado.dados.email}`;
    document.getElementById('linkSair').addEventListener('click', () => {
        localStorage.removeItem('usuarioLogado');
        window.location.href = '../paginaInicial.html';
    });

    // ====================================================
    // 1. FUNÇÃO PARA BUSCAR E RENDERIZAR PROFISSIONAIS (GET)
    // ====================================================
    function buscarProfissionais() {
        tabelaBody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>'; // Limpa a tabela

        fetch('http://localhost:3000/admin/profissionais')
            .then(res => res.json())
            .then(data => {
                tabelaBody.innerHTML = ''; // Limpa "Carregando"
                
                if (data.success && data.profissionais.length > 0) {
                    data.profissionais.forEach(prof => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${prof.id}</td>
                            <td>${prof.nome}</td>
                            <td>${prof.email}</td>
                            <td>${prof.especialidade || 'N/D'}</td>
                            <td>${prof.cidade || 'N/D'}</td>
                        `;
                        tabelaBody.appendChild(tr);
                    });
                } else if (!data.success) {
                    tabelaBody.innerHTML = `<tr><td colspan="5" style="color: red;">${data.message}</td></tr>`;
                } else {
                    tabelaBody.innerHTML = `<tr><td colspan="5">Nenhum profissional cadastrado.</td></tr>`;
                }
            })
            .catch(err => {
                console.error("Erro ao buscar profissionais:", err);
                tabelaBody.innerHTML = `<tr><td colspan="5" style="color: red;">Erro de conexão ao buscar dados.</td></tr>`;
            });
    }

    // ====================================================
    // 2. FUNÇÃO PARA CADASTRAR PROFISSIONAL (POST)
    // ====================================================
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        msgErroForm.textContent = '';
        msgSucessoForm.textContent = '';

        // Coleta os dados do formulário
        const dadosForm = new FormData(form);
        const dados = Object.fromEntries(dadosForm.entries());
        
        // Envia para a rota do ADM
        fetch('http://localhost:3000/admin/profissional/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                msgSucessoForm.textContent = "Profissional cadastrado com sucesso!";
                form.reset(); // Limpa o formulário
                buscarProfissionais(); // Atualiza a tabela
            } else {
                msgErroForm.textContent = "Erro: " + data.message;
            }
        })
        .catch(err => {
            console.error("Erro ao cadastrar profissional:", err);
            msgErroForm.textContent = "Erro de conexão com o servidor.";
        });
    });

    // ====================================================
    // 3. CARGA INICIAL
    // ====================================================
    buscarProfissionais();
});