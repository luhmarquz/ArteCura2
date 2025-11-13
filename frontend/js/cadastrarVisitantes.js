function cadastrarVisitante() {
  const email = document.getElementById('email').value;
  const nome = document.getElementById('username').value; // 'username' no HTML é o nome
  const senha = document.getElementById('senha').value;

  fetch('http://localhost:3000/visitante/cadastrar', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      nome: nome,
      senha: senha
    })
  })
  .then(res => res.json())
  .then(results => {
    if (results.success) {
      alert(results.message);
      window.location.href = "loginVisitantes.html"; 
    } else {
      alert("Erro: " + results.message);
    }
  })
  .catch(err => {
    console.error("Erro na requisição:", err);
    alert("Erro de conexão com o servidor.");
  });
}
