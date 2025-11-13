// frontend/js/loginAdmin.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formLoginAdmin");
    const msgErro = document.getElementById("msgErro");

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            msgErro.textContent = '';
            
            fetch('http://localhost:3000/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Armazena o ADM no localStorage (CRÍTICO: Diferenciar o tipo!)
                    localStorage.setItem('usuarioLogado', JSON.stringify({ 
                        tipo: 'administrador', 
                        dados: data.administrador 
                    }));
                    alert(data.message);
                    
                    // Redireciona para a página de cadastro de profissional
                    window.location.href = '../Admin/dashboardAdmin.html';
                    
                } else {
                    msgErro.textContent = data.message;
                }
            })
            .catch(err => {
                console.error("Erro de conexão:", err);
                msgErro.textContent = "Erro de conexão com o servidor.";
            });
        });
    }
});