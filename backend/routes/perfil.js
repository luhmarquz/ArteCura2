const express = require("express");
const connection = require("../dbd_config"); 

// A função 'upload' é passada do server.js
module.exports = function(upload) { 
    
    const router = express.Router();

    // ====================================================
    // 1. ROTAS DE UPLOAD DE FOTO (POST)
    // ====================================================
    
    // Rota de Upload de Foto do Profissional
    router.post("/profissional/:id/foto", upload.single('foto'), (req, res) => {
        const profissionalId = req.params.id;
        const nomeArquivo = req.file ? req.file.filename : null; 

        if (!nomeArquivo) {
            return res.status(400).json({ success: false, message: "Nenhum arquivo de foto enviado." });
        }

        const query = `UPDATE profissional SET foto_perfil = ? WHERE id = ?`;

        connection.query(query, [nomeArquivo, profissionalId], (err, results) => {
            if (err) {
                console.error("Erro no MySQL (UPLOAD FOTO PROFISSIONAL):", err);
                return res.status(500).json({ success: false, message: "Erro ao salvar o nome da foto no banco." });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ success: false, message: "Profissional não encontrado." });
            }
            res.json({ success: true, message: "Foto de perfil atualizada com sucesso!", filename: nomeArquivo });
        });
    });
    
    // Rota de Upload de Foto do Visitante
    router.post("/visitante/:id/foto", upload.single('foto'), (req, res) => {
        const visitanteId = req.params.id;
        const nomeArquivo = req.file ? req.file.filename : null; 
        if (!nomeArquivo) {
            return res.status(400).json({ success: false, message: "Nenhum arquivo de foto enviado." });
        }
        const query = `UPDATE visitante SET foto_perfil = ? WHERE id = ?`;
        connection.query(query, [nomeArquivo, visitanteId], (err, results) => {
            if (err) {
                console.error("Erro no MySQL (UPLOAD FOTO VISITANTE):", err);
                return res.status(500).json({ success: false, message: "Erro ao salvar o nome da foto no banco." });
            }
            res.json({ success: true, message: "Foto de perfil atualizada com sucesso!", filename: nomeArquivo });
        });
    });


    // ====================================================
    // 2. ROTAS DE "SEGUIR" (POST, DELETE, GET)
    // ====================================================

    // ROTA A: Seguir
    router.post("/seguir", (req, res) => {
        const { seguidor_id, seguido_id } = req.body; 
        if (!seguidor_id || !seguido_id) {
            return res.status(400).json({ success: false, message: "IDs obrigatórios." });
        }
        const query = "INSERT INTO seguidores (seguidor_id, seguido_id) VALUES (?, ?)";
        connection.query(query, [seguidor_id, seguido_id], (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') return res.json({ success: true });
                return res.status(500).json({ success: false, message: err.sqlMessage });
            }
            res.status(201).json({ success: true, message: "Começou a seguir!" });
        });
    });

    // ROTA B: Deixar de Seguir
    router.delete("/deixardeseguir", (req, res) => {
        const { seguidor_id, seguido_id } = req.body;
        if (!seguidor_id || !seguido_id) {
            return res.status(400).json({ success: false, message: "IDs obrigatórios." });
        }
        const query = "DELETE FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?";
        connection.query(query, [seguidor_id, seguido_id], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.sqlMessage });
            }
            res.json({ success: true, message: "Deixou de seguir." });
        });
    });

    // ROTA C: Verificar Status
    router.get("/status-seguindo", (req, res) => {
        const { seguidor_id, seguido_id } = req.query;
        const query = "SELECT COUNT(*) AS count FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?";
        connection.query(query, [seguidor_id, seguido_id], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.sqlMessage });
            }
            res.json({ success: true, estaSeguindo: results[0].count > 0 });
        });
    });

    // ROTA D: Lista de quem o Visitante segue
    router.get("/visitante/:id/seguindo", (req, res) => {
        const visitanteId = req.params.id;
        const query = `
            SELECT prof.id, prof.nome, prof.especialidade, prof.cidade, prof.foto_perfil 
            FROM profissional prof
            JOIN seguidores s ON prof.id = s.seguido_id
            WHERE s.seguidor_id = ?
        `;
        connection.query(query, [visitanteId], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.sqlMessage });
            }
            res.json({ success: true, profissionais: results });
        });
    });
    
    // ====================================================
    // 3. ROTAS DE LEITURA (GET)
    // ====================================================

    // ROTA E: Get Profissional (com contagem de seguidores)
    router.get("/profissional/:id", (req, res) => {
        const id = req.params.id;
        const queryProf = "SELECT id, nome, email, cidade, especialidade, bio, whatsapp, instagram, foto_perfil FROM profissional WHERE id = ?";
        const querySeg = "SELECT COUNT(*) AS num_seguidores FROM seguidores WHERE seguido_id = ?";

        connection.query(queryProf, [id], (errProf, resProf) => {
            if (errProf) return res.status(500).json({ success: false, message: errProf.sqlMessage });
            if (resProf.length === 0) return res.status(404).json({ success: false, message: "Profissional não encontrado." });
            
            const profissional = resProf[0];
            connection.query(querySeg, [id], (errSeg, resSeg) => {
                profissional.num_seguidores = (errSeg) ? 0 : resSeg[0].num_seguidores;
                res.json({ success: true, profissional: profissional });
            });
        });
    });

    // ROTA F: Get Visitante (com contagem)
    router.get("/visitante/:id", (req, res) => {
        const id = req.params.id;
        const queryVis = "SELECT id, nome, email, foto_perfil FROM visitante WHERE id = ?"; 
        const querySeg = "SELECT COUNT(*) AS num_seguindo FROM seguidores WHERE seguidor_id = ?";

        connection.query(queryVis, [id], (errVis, resVis) => {
            if (errVis) return res.status(500).json({ success: false, message: errVis.sqlMessage });
            if (resVis.length === 0) return res.status(404).json({ success: false, message: "Visitante não encontrado." });

            const visitante = resVis[0];
            connection.query(querySeg, [id], (errSeg, resSeg) => {
                visitante.num_seguindo = (errSeg) ? 0 : resSeg[0].num_seguindo;
                res.json({ success: true, visitante: visitante });
            });
        });
    });
    
    // ROTA G: Get Busca de Profissionais (Página de Profissionais)
    router.get("/profissionais", (req, res) => {
      const busca = req.query.busca || ''; 
      const termoBusca = `%${busca}%`;
      
      const query = `
        SELECT id, nome, cidade, especialidade, foto_perfil
        FROM profissional
        WHERE cidade LIKE ? OR nome LIKE ? OR especialidade LIKE ? 
        ORDER BY nome
      `;
      
      connection.query(query, [termoBusca, termoBusca, termoBusca], (err, results) => {
        if (err) {
          console.error("Erro no MySQL (GET PROFISSIONAIS FILTRADO):", err);
          return res.status(500).json({ success: false, message: err.sqlMessage });
        }
        res.json(results);
      });
    });
    
    // ====================================================
    // 4. ROTAS DE ATUALIZAÇÃO (PUT)
    // ====================================================

    // Rota de Atualização do Profissional
    router.put("/profissional/:id", (req, res) => { 
      const id = req.params.id;
      const { email, nome, senha, cidade, especialidade, bio, whatsapp, instagram } = req.body;
      
      let camposParaAtualizar = { email, nome, cidade, especialidade, bio, whatsapp, instagram };
      
      if (senha && senha.trim() !== "") {
          camposParaAtualizar.senha = senha; 
      }

      const chaves = Object.keys(camposParaAtualizar).filter(key => camposParaAtualizar[key] !== undefined);
      const valores = chaves.map(chave => camposParaAtualizar[chave]);
      
      if (chaves.length === 0) {
          return res.status(400).json({ success: false, message: "Nenhum dado fornecido para atualização." });
      }
      
      const setString = chaves.map(chave => `${chave} = ?`).join(', ');

      const query = `UPDATE profissional SET ${setString} WHERE id = ?`;
      valores.push(id); 

      connection.query(query, valores, (err, results) => {
        if (err) {
          console.error("Erro no MySQL (UPDATE PROFISSIONAL):", err);
          return res.status(400).json({ success: false, message: "Erro ao atualizar perfil: " + err.sqlMessage });
        }
        res.json({ success: true, message: "Perfil profissional atualizado com sucesso!" });
      });
    });
    
    // Rota de Atualização do Visitante
    router.put("/visitante/:id", (req, res) => {
        const visitanteId = req.params.id;
        const { nome, email, senha } = req.body;
        
        let fields = [];
        let values = [];

        if (nome) { fields.push("nome = ?"); values.push(nome); }
        if (email) { fields.push("email = ?"); values.push(email); }
        
        if (senha && senha.trim() !== '') {
            fields.push("senha = ?"); 
            values.push(senha); 
        }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: "Nenhum dado fornecido para atualização." });
        }

        const query = `UPDATE visitante SET ${fields.join(", ")} WHERE id = ?`;
        values.push(visitanteId); 

        connection.query(query, values, (err, results) => {
            if (err) {
                console.error("Erro no MySQL (PUT VISITANTE):", err);
                if (err.code === 'ER_DUP_ENTRY') {
                     return res.status(409).json({ success: false, message: "Este e-mail já está em uso." });
                }
                return res.status(500).json({ success: false, message: "Erro ao atualizar perfil." });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ success: false, message: "Visitante não encontrado ou nenhum dado alterado." });
            }
            res.json({ success: true, message: "Perfil atualizado com sucesso!" });
        });
    });

    // ====================================================
    // 5. ROTAS DE DELEÇÃO (DELETE)
    // ====================================================
    
    // Rota de Deleção do Profissional
    router.delete("/profissional/:id", (req, res) => {
      const id = req.params.id;
      const query = "DELETE FROM profissional WHERE id = ?";
      
      connection.query(query, [id], (err, results) => {
        if (err) {
          console.error("Erro no MySQL (DELETE PROFISSIONAL):", err);
          return res.status(500).json({ success: false, message: "Erro ao deletar conta: " + err.sqlMessage });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ success: false, message: "Profissional não encontrado." });
        }
        res.json({ success: true, message: "Conta deletada com sucesso!" });
      });
    });

    // Rota de Deleção do Visitante
    router.delete("/visitante/:id", (req, res) => {
      const id = req.params.id;
      const query = "DELETE FROM visitante WHERE id = ?";
      
      connection.query(query, [id], (err, results) => {
        if (err) {
          console.error("Erro no MySQL (DELETE VISITANTE):", err);
          return res.status(500).json({ success: false, message: "Erro ao deletar conta: " + err.sqlMessage });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ success: false, message: "Visitante não encontrado." });
        }
        res.json({ success: true, message: "Conta deletada com sucesso!" });
      });
    });


    return router;
};