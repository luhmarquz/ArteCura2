document.addEventListener("DOMContentLoaded", () => {
    // Seleciona os elementos do formulário
    const form = document.querySelector(".form-login"); // Use a classe correta do seu formulário
    const emailInput = document.getElementById("email"); // Assumindo que seu input tem id="email"
    const senhaInput = document.getElementById("senha"); // Assumindo que seu input tem id="senha"
    const msgErro = document.getElementById("msgErro"); // Assumindo que você tem um <p id="msgErro"></p>

    // Se não encontrar o formulário, para a execução
    if (!form) {
        console.error("Formulário de login não encontrado.");
        return;
    }

    // Adiciona o listener para o envio do formulário
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // Impede o recarregamento da página

        const email = emailInput.value;
        const senha = senhaInput.value;

        // Limpa mensagens de erro anteriores
        if (msgErro) msgErro.textContent = '';

        // Validação simples
        if (!email || !senha) {
            if (msgErro) msgErro.textContent = "Por favor, preencha todos os campos.";
            return;
        }

        // ====================================================
        // BLOCO FETCH ATUALIZADO
        // ====================================================
        fetch('http://localhost:3000/profissional/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        })
        .then(res => {
            // Verifica se a resposta foi bem-sucedida (status 200-299)
            // Se for 401 (senha errada) ou 500 (erro server), !res.ok será true
            if (!res.ok) {
                // Tenta ler a mensagem de erro que o servidor enviou (em JSON)
                return res.json().then(errorData => {
                    // Lança um novo erro com a mensagem específica do servidor
                    throw new Error(errorData.message || 'Erro desconhecido no servidor.');
                });
            }
            // Se a resposta foi OK, passa os dados JSON para o próximo .then
            return res.json();
        })
        .then(data => {
            // 'data' aqui SÓ vai conter respostas de SUCESSO
            
            // Armazena os dados do usuário logado no localStorage
            localStorage.setItem('usuarioLogado', JSON.stringify({ tipo: 'profissional', dados: data.profissional }));
            
            alert(data.message); // "Login de profissional realizado!"
            
            // Redireciona para a página de perfil, passando o ID na URL
            window.location.href = `perfilProfissional.html?id=${data.profissional.id}`;
        })
        .catch(err => {
            // CRÍTICO: Este .catch() agora pega TODOS os erros
            // (Erros de rede, erros 401, erros 500, etc.)
            
            console.error("Erro de rede ou servidor:", err); // Linha 41
            
            // Mostra a mensagem de erro real (que jogamos com 'throw new Error')
            const mensagemFalha = "Falha no login: " + err.message;
            alert(mensagemFalha);
            if (msgErro) msgErro.textContent = err.message;
        });
    });
});