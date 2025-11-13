const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const connection = require('./dbd_config'); // Importa a conexão com o MySQL

const app = express();
const port = 3000;

// ====================================================
// (CORRIGIDO) Configuração do CORS
// ====================================================
// Permite que o :5501 (Live Server) fale com o :3000
app.use(cors()); 

// Configuração para servir arquivos estáticos (CSS, JS, Imagens, etc.)
app.use(express.static(path.join(__dirname, '../frontend'))); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração do body-parser para JSON e dados de formulário
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ====================================================
// 1. CONFIGURAÇÃO DE UPLOAD DE ARQUIVOS (MULTER)
// ====================================================
const uploadsDir = path.join(__dirname, 'uploads');
if (!require('fs').existsSync(uploadsDir)) {
    require('fs').mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); 
    },
    filename: (req, file, cb) => {
        // (MUDANÇA SUTIL) Use path.extname para manter a extensão .pdf ou .png
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


// ====================================================
// 2. IMPORTAÇÃO E INJEÇÃO DE ROTAS
// ====================================================

// Rota de Postagens - Injeta o 'upload' do Multer
const postagensRoutes = require('./routes/postagens')(upload);
app.use('/postagens', postagensRoutes);

// Rotas de Perfil (usando o Multer para as rotas de foto de perfil)
const perfilRoutes = require('./routes/perfil')(upload); 
app.use('/perfil', perfilRoutes); 


// ====================================================
// 3. ROTAS DE AUTENTICAÇÃO E CADASTRO
// ====================================================

// --- Rotas de VISITANTE ---
app.post('/visitante/cadastrar', (req, res) => {
    const { email, nome, senha } = req.body;
    const query = 'INSERT INTO visitante (email, nome, senha) VALUES (?, ?, ?)';
    connection.query(query, [email, nome, senha], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: 'Email já cadastrado.' });
            }
            return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
        }
        res.status(201).json({ success: true, message: 'Cadastro de visitante realizado com sucesso!' });
    });
});

app.post('/visitante/login', (req, res) => {
    const { email, senha } = req.body;
    const query = 'SELECT * FROM visitante WHERE email = ? AND senha = ?';
    connection.query(query, [email, senha], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Falha no login: Email ou senha incorretos.' });
        }
        res.status(200).json({ success: true, message: 'Login de visitante realizado!', visitante: results[0] });
    });
});


// --- Rotas de ADMINISTRADOR ---
app.post('/admin/cadastrar', (req, res) => {
    const { email, senha } = req.body;
    const query = 'INSERT INTO administrador (email, senha) VALUES (?, ?)';
    connection.query(query, [email, senha], (err, results) => {
        if (err) {
             if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: 'Email já cadastrado.' });
            }
            return res.status(500).json({ success: false, message: 'Erro interno ao cadastrar ADM.' });
        }
        res.status(201).json({ success: true, message: 'Cadastro de Administrador realizado com sucesso!' });
    });
});

app.post('/admin/login', (req, res) => {
    const { email, senha } = req.body;
    const query = 'SELECT id, email FROM administrador WHERE email = ? AND senha = ?';
    connection.query(query, [email, senha], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Falha no login de ADM: Email ou senha incorretos.' });
        }
        res.status(200).json({ success: true, message: 'Login de ADM realizado!', administrador: results[0] });
    });
});

app.get('/admin/profissionais', (req, res) => {
    const query = 'SELECT id, nome, email, especialidade, cidade FROM profissional ORDER BY nome ASC';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Erro ao buscar profissionais:", err);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
        }
        res.status(200).json({ success: true, profissionais: results });
    });
});

// --- Rotas de PROFISSIONAL ---
app.post('/admin/profissional/cadastrar', (req, res) => {
    const { email, nome, senha, especialidade, cidade, dataNascimento } = req.body; 
    const query = 'INSERT INTO profissional (email, nome, senha, especialidade, cidade, dataNascimento) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, [email, nome, senha, especialidade, cidade, dataNascimento], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: 'Email já cadastrado para um profissional.' });
            }
            return res.status(500).json({ success: false, message: 'Erro interno do servidor: ' + err.sqlMessage });
        }
        res.status(201).json({ success: true, message: 'Profissional cadastrado com sucesso pelo ADM!' });
    });
});

app.post('/profissional/login', (req, res) => {
    const { email, senha } = req.body;
    const query = 'SELECT * FROM profissional WHERE email = ? AND senha = ?';
    connection.query(query, [email, senha], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Falha no login: Email ou senha incorretos.' });
        }
        res.status(200).json({ success: true, message: 'Login de profissional realizado!', profissional: results[0] });
    });
});


// ====================================================
// 4. INICIAÇÃO DO SERVIDOR
// ====================================================
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});