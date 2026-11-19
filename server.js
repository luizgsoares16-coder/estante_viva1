// =================== Importação das bibliotecas ====================



const express = require('express');     //Facilita a criação de servidores e rotas. 

const cors = require('cors');           //Permite a conexão entre os frontend e backend quando estão em origens diferentes.

const db = require('./db');             //Traz a conexão com o MYSQL que foi criado no db.js.



// =================== Configuração do servidor =======================



const app = express();          //Vai criar a aplicação do Express - Servidor que vai controlar o que o sistema pedir.

app.use(cors());                //Vai ativar o Cors, permitindo a comunicação entre frontend e backend.
app.use(express.json());        //Vai permitir que o servidor receba dados que foram enviados em formato JSON.



// =================== GET: listar e buscar livros =====================



app.get('/api/livros',(req, res) => {                                       //Criação da rota: app.get = cria uma rota do tipo GET(Busca e lê dados de um recurso).;         /api/livros = De onde vem a rota(tabela livros).;
                                                                            //req = É o pedido/requisição que foi recebido.;                                                 res = É a resposta que o servidor enviou.
    
    const titulo = req.query.titulo;                                        //Recebendo o título da busca: Pega o titulo que foi enviado pela URL.

    let sql = 'SELECT * FROM livros';                                       //Criação do comando SQL: Seleciona os dados de todas as colunas da tabela livros(Onde os dados vão ser retirados).

    if (titulo) {                                                           //Verificando se existe uma busca.
        sql += 'WHERE titulo LIKE ?';                                       //Caso o usuário tenha digitado algo, é adicionado uma condição ao SQL.
                                                                            //WHERE = Vai estabelecer uma condição;         LIKE = permite procurar partes de um text.          ? = Está representando um valor que será enviado de forma separada.
    }

    db.query(sql, titulo ?[`%${titulo}%`]:[], (err, resultado)  => {        //Execução da consulta.
                                                                            //db.query = vai executar o comando SQL.        sql = Tem o comando que vai ser executado.          titulo ? ... : [] = Vai conferir se existe um título pra pesquisar.
                                                                            //err = Vai receber um possível erro.           resultado = Vai receber os livros encontrados.      % = Significa que pode existir qualquer texto antes ou depois da palavra pesquisada.

    if (err) {
        return res.status(500).json({ mensagem:'Deu pau aqui irmão'});      //Vai fazer o servidor retornar o código HTTP 500 caso aconteça algum erro no banco.
    }

    res.json(resultado);                                                    //Vai levar os livros encontrados para o frontend em formato JSON.
    
    });                                
});



// =================== GET: buscar um livro pelo ID  ======================



app.get('/api/livros/:id', (req, res)=> {                                                   //O :id ta representando um espaço reservado para o identificador do livro.

    const id = req.params.id;                                                               //Pegando o ID: req.params = vai pegar os parâmetros que estão na própria rota.

    const sql ='SELECT * FROM livros WHERE id_livro = ?';                                   //Criando o SQL: Esse comando vai procurar todas as informações de um livro onde id_livro seja igual ao ID recebido.

    db.query(sql, [id],(err, resultado)=> {                                                 //Executando a consulta: Executa o SQL e substitui o ? pelo ID recebido.

        if(err){
            return res.status(500).json({ mensagem:'Deu pra buscar o livro não parça'});
        }

        if(resultado.length === 0){
            return res.status(404).json({mensagem:'Hey boy esse livro ta aqui não tlgd'});  //Verificando se achou o livro: resultado.lenght = Vai verificar quantos registros foram encontrados.
        }

        res.json(resultado[0]);                                                             //Retornando o livro: Retorna o primeiro registro encontrado. OBS: Ta sendo usado o 0 pq a gente so quer um livro.
    });
});



// =================== POST: cadastrar um livro =======================



app.post('/api/livros',(req, res)=> {
    const { titulo, autor, preco, quantidade_estoque } = req.body;

    if(!titulo ||!titulo.trim()||!autor ||!autor.trim()|| preco <= 0 ||!Number.isFinite(Number(preco))||!Number.isInteger(quantidade_estoque)||quantidade_estoque < 0){
        
        return res.status(400).json({mensagem:'Man preenche ai certinho pow'});
    }

    const sql = 'INSERT INTO livros(titulo, autor, preco, quantidade_estoque) VALUES (?, ?, ?, ?)';

    db.query(sql,[titulo.trim(),autor.trim(),preco,quantidade_estoque],(err,resultado)=>{

        if(err){
            return res.status(500).json({ mensagem:'Não deu pra cadastrar o livro não irmão'});
        }

        res.status(201).json({
            id_livro: resultado.insertId,
            titulo,
            autor,
            preco,
            quantidade_estoque
        });
    });
});



// =================== PUT: editar um livro =======================



app.put('/api/livros/:id', (req, res) => {

    const id = req.params.id;

    const { titulo, autor, preco, quantidade_estoque } = req.body;

    if (!titulo || !titulo.trim() || !autor || !autor.trim() ||
        preco <= 0 || !Number.isFinite(Number(preco)) ||
        !Number.isInteger(quantidade_estoque) || quantidade_estoque < 0) {

        return res.status(400).json({ mensagem: 'Preencha os campos corretamente' });
    }

    const sql = 'UPDATE livros SET titulo = ?, autor = ?, preco = ?, quantidade_estoque = ? WHERE id_livro = ?';

    db.query(sql, [titulo.trim(), autor.trim(), preco, quantidade_estoque, id], (err, resultado) => {

        if (err) {
            return res.status(500).json({ mensagem: 'Erro ao editar livro' });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Livro não encontrado' });
        }

        res.json({ mensagem: 'Livro atualizado com sucesso!' });
    });
});



// =================== DELETE: excluir um livro =======================



app.delete('/api/livros/:id', (req, res) => {

    const id = req.params.id;

    const sql = 'DELETE FROM livros WHERE id_livro = ?';

    db.query(sql, [id], (err, resultado) => {

        if (err) {
            return res.status(500).json({ mensagem: 'Erro ao excluir livro' });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Livro não encontrado' });
        }

        res.json({ mensagem: 'Livro excluído com sucesso!' });
    });
});



