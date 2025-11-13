// frontend/js/loginVisitantes.js
document.addEventListener("DOMContentLoaded", () => {
    // Certifique-se que este ID corresponde ao seu form no HTML
    const form = document.getElementById('formLoginVisitante'); 

    // Adiciona um listener para o envio do formulário
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            // Captura os valores dos inputs
            const email = document.getElementById('email').value; // ID do campo email
            const senha = document.getElementById('senha').value; // ID do campo senha
            
            // CRÍTICO: Define a variável com os dados que o servidor espera
            const dadosDoFormulario = { email, senha };
            
            // Realiza o fetch para a rota correta: /loginVisitantes
            fetch('http://localhost:3000/visitante/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    })
    .then(res => res.json()) // Esta é a linha que falha
    .then(data => {
                if (data.success) {
                    // Salva o objeto completo no localStorage
                    localStorage.setItem('usuarioLogado', JSON.stringify({ tipo: 'visitante', dados: data.visitante }));
                    alert(data.message);
                    window.location.href = '../Visitantes/perfilVisitante.html'; 
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Erro de rede ou servidor:', error);
                alert("Falha no login: " + error.message);
            });
        });
    }
});