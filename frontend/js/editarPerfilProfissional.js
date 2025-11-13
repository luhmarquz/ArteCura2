// Depende de perfilUtils.js para getUsuarioLogado(), logout() e deletarContaProfissional()

document.addEventListener("DOMContentLoaded", () => {
    const usuario = getUsuarioLogado(); 
    if (!usuario || usuario.tipo !== 'profissional') return;

    // 1. Preencher o formulário com dados atuais do localStorage
    document.getElementById('email').value = usuario.dados.email || '';
    document.getElementById('username').value = usuario.dados.nome || '';
    document.getElementById('cidade').value = usuario.dados.cidade || '';
    document.getElementById('especialidade').value = usuario.dados.especialidade || ''; // NOVO: CARREGAR ESPECIALIDADE
    document.getElementById('bio').value = usuario.dados.bio || ''; // NOVO
    document.getElementById('whatsapp').value = usuario.dados.whatsapp || ''; // NOVO
    document.getElementById('instagram').value = usuario.dados.instagram || ''; // NOVO
    // Adicionar outros campos de bio/contato aqui, se você os incluir no HTML
});

function salvarAlteracoesProfissional(event) {
    if (event) event.preventDefault();
    
    const usuario = getUsuarioLogado();
    if (!usuario || usuario.tipo !== 'profissional') return;

    const id = usuario.dados.id;
    const email = document.getElementById('email').value;
    const nome = document.getElementById('username').value;
    const senha = document.getElementById('senha').value; // Senha opcional
    const cidade = document.getElementById('cidade').value;
    const especialidade = document.getElementById('especialidade').value; // NOVO: OBTER ESPECIALIDADE
    const bio = document.getElementById('bio').value;
    const whatsapp = document.getElementById('whatsapp').value;
    const instagram = document.getElementById('instagram').value;
    // Adicionar outros campos (bio, whatsapp, instagram) aqui

  const bodyData = { email, nome, cidade, especialidade, bio, whatsapp, instagram };
    if (senha) {
        bodyData.senha = senha;
    }

    fetch(`http://localhost:3000/perfil/profissional/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
    })
.then(res => res.json())
.then(data => {
    if (data.success) {
        alert(data.message);
        
        // NOVO PASSO CRÍTICO: Atualizar o localStorage
        if (data.profissionalAtualizado) {
             localStorage.setItem("usuarioLogado", JSON.stringify({
                tipo: "profissional",
                dados: data.profissionalAtualizado // Assume que o backend retorna o objeto completo
            }));
        }
            
window.location.href = "perfilProfissional.html"; 
    } else {
        alert("Erro ao salvar: " + data.message);
    }
})
    .catch(err => {
        console.error("Erro na requisição:", err);
        alert("Erro de conexão com o servidor.");
    });
}