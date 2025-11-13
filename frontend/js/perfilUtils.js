// Função utilitária para pegar os dados do usuário logado
function getUsuarioLogado() {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (!usuarioLogado) {
        // Redireciona se não estiver logado
        window.location.href = "../Visitantes/loginVisitantes.html";
        return null;
    }
    return JSON.parse(usuarioLogado);
}

// ----------------------------------------------------
// 1. LOGOUT
// ----------------------------------------------------
function logout() {
    if (confirm("Tem certeza que deseja sair?")) {
        localStorage.removeItem("usuarioLogado");
        // Redireciona para a página inicial pública
        window.location.href = "../paginaInicial.html"; 
    }
}

// ----------------------------------------------------
// 2. DELETAR CONTA (Visitante)
// ----------------------------------------------------
function deletarContaVisitante() {
    if (!confirm("AVISO: Esta ação é irreversível. Tem certeza que deseja DELETAR sua conta de visitante?")) {
        return;
    }

    const usuario = getUsuarioLogado();
    if (!usuario || usuario.tipo !== 'visitante') {
        alert("Erro: Usuário não logado ou tipo incorreto.");
        return;
    }

fetch(`http://localhost:3000/perfil/visitante/${usuario.dados.id}`, { 
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            localStorage.removeItem("usuarioLogado");
            window.location.href = "../paginaInicial.html";
        } else {
            alert("Erro ao deletar conta: " + data.message);
        }
    })
    .catch(err => {
        console.error("Erro na requisição:", err);
        alert("Erro de conexão com o servidor.");
    });
}

// ----------------------------------------------------
// 2. DELETAR CONTA (Profissional)
// ----------------------------------------------------
function deletarContaProfissional() {
    if (!confirm("AVISO: Esta ação é irreversível. Tem certeza que deseja DELETAR sua conta de profissional?")) {
        return;
    }

    const usuario = getUsuarioLogado();
    if (!usuario || usuario.tipo !== 'profissional') {
        alert("Erro: Usuário não logado ou tipo incorreto.");
        return;
    }

    // CORREÇÃO CRÍTICA: Adicionar o prefixo '/perfil' na URL
fetch(`http://localhost:3000/perfil/profissional/${usuario.dados.id}`, { // <--- ESTÁ DELETANDO PROFISSIONAL
    method: 'DELETE'
})
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            localStorage.removeItem("usuarioLogado");
            window.location.href = "../paginaInicial.html";
        } else {
            alert("Erro ao deletar conta: " + data.message);
        }
    })
    .catch(err => {
        console.error("Erro na requisição:", err);
        alert("Erro de conexão com o servidor.");
    });
} // <--- A FUNÇÃO TERMINA AQUI. NENHUMA CHAVE DEVE VIR DEPOIS.