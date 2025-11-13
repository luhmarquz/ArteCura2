// backend/routes/postagens.js
const express = require('express');
const connection = require('../dbd_config');
console.log("ARQUIVO 'postagens.js' (VERSÃO PDF UPLOAD) CARREGADO!");

// (MUDANÇA) Agora recebe 'upload' do server.js
module.exports = function (upload) { 
    const router = express.Router();

    // ======================================================
    // 1️⃣ CRIAR NOVA POSTAGEM (MODIFICADO PARA UPLOAD DE PDF)
    // ======================================================
    
    // Rota: POST /postagens/adicionar
    // (MUDANÇA) Adicionado middleware 'upload.single()' para capturar o arquivo PDF
    router.post('/adicionar', upload.single('arquivo_pdf'), (req, res) => {
        
        // 1. Campos de texto agora vêm de 'req.body' (pois é FormData)
        const { profissional_id, tipo, titulo, categoria } = req.body;
        
        // 2. (MUDANÇA) A URL do conteúdo agora é dinâmica
        let urlDoConteudo;

        if (tipo === 'video') {
            // Se for vídeo, pegamos a URL do corpo da requisição
            urlDoConteudo = req.body.conteudo_url; 
            if (!urlDoConteudo) {
                 return res.status(400).json({ success: false, message: "Tipo 'video' selecionado, mas nenhuma URL foi enviada." });
            }
        } else if (tipo === 'artigo') {
            // Se for artigo, verificamos se um arquivo (req.file) foi enviado
            if (req.file) {
                // Se sim, montamos a URL pública para o arquivo salvo
                urlDoConteudo = `http://localhost:3000/uploads/${req.file.filename}`;
            } else {
                // Se não, é um erro
                return res.status(400).json({ success: false, message: "Tipo 'artigo' selecionado, mas nenhum arquivo PDF foi enviado." });
            }
        } else {
             return res.status(400).json({ success: false, message: "Tipo de postagem inválido." });
        }

        // 3. Validação final
        if (!profissional_id || !titulo || !categoria) {
            return res.status(400).json({ success: false, message: "Campos obrigatórios (ID, Título, Categoria) ausentes." });
        }
        
        // 4. Query atualizada para incluir data_criacao e null para capa_url
        const query = `
            INSERT INTO postagem (profissional_id, tipo, titulo, categoria, capa_url, conteudo_url, data_criacao)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        
        connection.query(
            query,
            [profissional_id, tipo.toLowerCase().trim(), titulo, categoria, null, urlDoConteudo],
            (err, results) => {
                if (err) {
                    console.error("❌ Erro ao criar postagem:", err.sqlMessage);
                    return res.status(500).json({ success: false, message: "Erro ao criar postagem: " + err.sqlMessage });
                }
                console.log("✅ Postagem criada com sucesso!");
                res.status(201).json({ success: true, message: "Postagem criada com sucesso!", postId: results.insertId });
            }
        );
    });

    // ======================================================
    // 2️⃣ LISTAR ARTIGOS (página pública)
    // ======================================================
    router.get('/artigos', (req, res) => {
        console.log("📖 ROTA /artigos executada");
        const { categoria, busca } = req.query;

        let query = `
            SELECT p.*, prof.nome AS nome_autor, prof.id AS autor_id 
            FROM postagem p
            LEFT JOIN profissional prof ON p.profissional_id = prof.id
            WHERE LOWER(TRIM(p.tipo)) = 'artigo'
        `;
        const params = [];
        if (categoria) {
            query += ` AND LOWER(TRIM(p.categoria)) = LOWER(?)`;
            params.push(categoria);
        }
        if (busca) {
            query += ` AND p.titulo LIKE ?`;
            params.push(`%${busca}%`);
        }
        query += ` ORDER BY p.data_criacao DESC`;

        connection.query(query, params, (err, results) => {
            if (err) {
                console.error("❌ Erro ao buscar artigos:", err);
                return res.status(500).json({ success: false, message: "Erro ao buscar artigos." });
            }
            res.json(results);
        });
    });

    // ======================================================
    // 3️⃣ LISTAR VÍDEOS (página pública)
    // ======================================================
    router.get('/videos', (req, res) => {
        console.log("🎥 ROTA /videos executada");
        const { categoria, busca } = req.query;

        let query = `
            SELECT p.*, prof.nome AS nome_autor, prof.id AS autor_id 
            FROM postagem p
            LEFT JOIN profissional prof ON p.profissional_id = prof.id
            WHERE LOWER(TRIM(p.tipo)) = 'video'
        `;
        const params = [];
        if (categoria) {
            query += ` AND LOWER(TRIM(p.categoria)) = LOWER(?)`;
            params.push(categoria);
        }
        if (busca) {
            query += ` AND p.titulo LIKE ?`;
            params.push(`%${busca}%`);
        }
        query += ` ORDER BY p.data_criacao DESC`;

        connection.query(query, params, (err, results) => {
            if (err) {
                console.error("❌ Erro ao buscar vídeos:", err);
                return res.status(500).json({ success: false, message: "Erro ao buscar vídeos." });
            }
            res.json(results);
        });
    });

    // ======================================================
    // 4️⃣ DETALHE DE UMA POSTAGEM
    // ======================================================
    router.get('/detalhe/:postId', (req, res) => {
        const postId = req.params.postId;
        if (isNaN(parseInt(postId))) {
             return res.status(400).json({ success: false, message: "ID de post inválido." });
        }
        const query = `
            SELECT p.*, prof.nome AS nome_autor, prof.foto_perfil AS foto_autor
            FROM postagem p
            JOIN profissional prof ON p.profissional_id = prof.id
            WHERE p.id = ?
        `;
        connection.query(query, [postId], (err, results) => {
            if (err) {
                console.error("❌ Erro ao buscar detalhes:", err);
                return res.status(500).json({ success: false, message: "Erro ao buscar detalhes." });
            }
            if (results.length === 0) {
                return res.status(404).json({ success: false, message: "Postagem não encontrada." });
            }
            res.json({ success: true, postagem: results[0] });
        });
    });

    // ======================================================
    // 5️⃣ LISTAR POSTAGENS DO PERFIL (por profissional)
    // ======================================================
    router.get('/perfil/:profissionalId', (req, res) => {
        const profissionalId = req.params.profissionalId;
        if (!profissionalId || isNaN(profissionalId)) {
            return res.status(400).json({ success: false, message: "ID de profissional inválido." });
        }
        const { tipo, categoria } = req.query;
        let query = `
            SELECT p.*, prof.nome AS nome_autor 
            FROM postagem p
            JOIN profissional prof ON p.profissional_id = prof.id
            WHERE p.profissional_id = ?
        `;
        const params = [profissionalId];
        if (tipo) {
            query += ` AND LOWER(TRIM(p.tipo)) = LOWER(?)`;
            params.push(tipo);
        }
        if (categoria) {
            query += ` AND LOWER(TRIM(p.categoria)) = LOWER(?)`;
            params.push(categoria);
        }
        query += ` ORDER BY p.data_criacao DESC`;

        connection.query(query, params, (err, results) => {
            if (err) {
                console.error("❌ Erro ao buscar postagens do perfil:", err);
                return res.status(500).json({ success: false, message: "Erro ao buscar postagens: " + err.sqlMessage });
            }
            res.json(results);
        });
    });

    // ======================================================
    // 6️⃣ ATUALIZAR POSTAGEM (EDITAR)
    // ======================================================
    router.put('/:postId', (req, res) => {
        const postId = req.params.postId;
        const { profissional_id, titulo, categoria, capa_url, conteudo_url } = req.body;
        
        if (isNaN(parseInt(postId))) {
             return res.status(400).json({ success: false, message: "ID de post inválido." });
        }
        if (!profissional_id) {
            return res.status(401).json({ success: false, message: "Acesso não autorizado." });
        }

        const query = `
            UPDATE postagem 
            SET titulo = ?, categoria = ?, capa_url = ?, conteudo_url = ?
            WHERE id = ? AND profissional_id = ?
        `;
        connection.query(
            query,
            [titulo, categoria, capa_url, conteudo_url, postId, profissional_id],
            (err, results) => {
                if (err) {
                    console.error("❌ Erro ao atualizar postagem:", err);
                    return res.status(500).json({ success: false, message: "Erro ao atualizar postagem." });
                }
                if (results.affectedRows === 0) {
                    return res.status(403).json({ success: false, message: "Postagem não encontrada ou não pertence a este profissional." });
                }
                res.json({ success: true, message: "Postagem atualizada com sucesso!" });
            }
        );
    });

    // ======================================================
    // 7️⃣ DELETAR POSTAGEM (EXCLUIR)
    // ======================================================
    router.delete('/:postId', (req, res) => {
        const postId = req.params.postId;
        const { profissional_id } = req.body;

        if (isNaN(parseInt(postId))) {
             return res.status(400).json({ success: false, message: "ID de post inválido." });
        }
        if (!profissional_id) {
            return res.status(401).json({ success: false, message: "Acesso não autorizado." });
        }

        const query = `DELETE FROM postagem WHERE id = ? AND profissional_id = ?`;
        connection.query(query, [postId, profissional_id], (err, results) => {
            if (err) {
                console.error("❌ Erro ao deletar postagem:", err);
                return res.status(500).json({ success: false, message: "Erro ao deletar postagem." });
            }
            if (results.affectedRows === 0) {
                return res.status(403).json({ success: false, message: "Postagem não encontrada ou não pertence a este profissional." });
            }
            res.json({ success: true, message: "Postagem deletada com sucesso!" });
        });
    });

    // Retorna o router
    return router;
};