
const apiUrl = 'http://localhost:3000/api/livros';

const form = document.getElementById('estante-form');
const table = document.getElementById('estante-table');

const tituloInput = document.getElementById('titulo');
const autorInput = document.getElementById('autor');
const precoInput = document.getElementById('preco');
const estoqueInput = document.getElementById('quant_estoque');

const buscaInput = document.querySelector('.buscar_livro');
const botaoBuscar = document.querySelector('.buscar');
const botaoLimpar = document.querySelector('.limpar');

let idEdicao = null;

// Elementos do formulário
const tituloForm = form.querySelector('h3');
const botaoCadastrar = form.querySelector('button[type="submit"]');

// Criar botão de cancelar edição
const botaoCancelar = document.createElement('button');
botaoCancelar.type = 'button';
botaoCancelar.textContent = 'Cancelar edição';
botaoCancelar.style.display = 'none';
botaoCancelar.className = 'butao_cadastrar';

form.querySelector('.botao_form').appendChild(botaoCancelar);

// Criar área de mensagens
const mensagem = document.createElement('p');
mensagem.id = 'mensagem';
form.appendChild(mensagem);


// Mostrar mensagens
function mostrarMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.style.color = erro ? 'red' : 'green';
}


// Carregar livros
async function carregarLivros(titulo = '') {
    try {
        const url = titulo
            ? `${apiUrl}?titulo=${encodeURIComponent(titulo)}`
            : apiUrl;

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error('Erro ao buscar livros.');
        }

        const livros = await res.json();

        // Remover todos os registros antigos da tabela,
        // mantendo apenas o cabeçalho
        table.querySelectorAll('tr:not(:first-child)')
            .forEach(tr => tr.remove());

        if (livros.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');

            td.colSpan = 5;
            td.textContent = 'Nenhum livro encontrado.';

            tr.appendChild(td);
            table.appendChild(tr);
            return;
        }

        livros.forEach(livro => addTaskToTable(livro));

    } catch (err) {
        mostrarMensagem(err.message, true);
    }
}


// Cadastrar ou atualizar livro
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = tituloInput.value.trim();
    const author = autorInput.value.trim();
    const price = Number(precoInput.value.replace(',', '.'));
    const quantEstoque = Number(estoqueInput.value);

    // Validar título
    if (title.length === 0 || title.length > 150) {
        mostrarMensagem('Título deve ter entre 1 e 150 caracteres.', true);
        return;
    }

    // Validar autor
    if (author.length === 0 || author.length > 120) {
        mostrarMensagem('Autor deve ter entre 1 e 120 caracteres.', true);
        return;
    }

    // Validar preço
    if (!Number.isFinite(price) || price <= 0 ||
        !/^\d+([.,]\d{1,2})?$/.test(precoInput.value.trim())) {
        mostrarMensagem('Informe um preço válido, maior que zero e com até 2 casas decimais.', true);
        return;
    }

    // Validar estoque
    if (!Number.isInteger(quantEstoque) || quantEstoque < 0) {
        mostrarMensagem('O estoque deve ser um número inteiro maior ou igual a zero.', true);
        return;
    }

    const livro = {
        titulo: title,
        autor: author,
        preco: price,
        quantidade_estoque: quantEstoque
    };

    try {
        let res;

        if (idEdicao === null) {
            // Cadastro
            res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(livro)
            });
        } else {
            // Atualização
            res = await fetch(`${apiUrl}/${idEdicao}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(livro)
            });
        }

        if (!res.ok) {
            throw new Error('Não foi possível salvar o livro.');
        }

        if (idEdicao === null) {
            mostrarMensagem('Livro cadastrado com sucesso!');
        } else {
            mostrarMensagem('Livro atualizado com sucesso!');
        }

        form.reset();
        cancelarEdicao();
        carregarLivros();

    } catch (err) {
        mostrarMensagem(err.message, true);
    }
});


// Adicionar livro na tabela
function addTaskToTable(livro) {
    const tr = document.createElement('tr');

    const td1 = document.createElement('td');
    td1.textContent = livro.titulo;

    const td2 = document.createElement('td');
    td2.textContent = livro.autor;

    const td3 = document.createElement('td');
    td3.textContent = `R$ ${Number(livro.preco).toFixed(2)}`;

    const td4 = document.createElement('td');
    td4.textContent = livro.quantidade_estoque;

    const td5 = document.createElement('td');
    const div = document.createElement('div');
    div.className = 'edit_exc';

    // Botão editar
    const botaoEditar = document.createElement('button');
    botaoEditar.textContent = 'Editar';
    botaoEditar.className = 'editar';

    botaoEditar.addEventListener('click', () => editarLivro(livro.id_livro));

    // Botão excluir
    const botaoExcluir = document.createElement('button');
    botaoExcluir.textContent = 'Excluir';
    botaoExcluir.className = 'excluir';

    botaoExcluir.addEventListener('click', () => excluirLivro(livro));

    div.appendChild(botaoEditar);
    div.appendChild(botaoExcluir);
    td5.appendChild(div);

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);

    table.appendChild(tr);
}


// Editar livro
async function editarLivro(id) {
    try {
        const res = await fetch(`${apiUrl}/${id}`);

        if (!res.ok) {
            throw new Error('Erro ao buscar livro para edição.');
        }

        const livro = await res.json();

        tituloInput.value = livro.titulo;
        autorInput.value = livro.autor;
        precoInput.value = livro.preco;
        estoqueInput.value = livro.quantidade_estoque;

        idEdicao = id;

        tituloForm.textContent = 'Editar livro';
        botaoCadastrar.textContent = 'Salvar alterações';
        botaoCancelar.style.display = 'inline-block';

        mostrarMensagem('Editando livro...');

    } catch (err) {
        mostrarMensagem(err.message, true);
    }
}


// Cancelar edição
function cancelarEdicao() {
    idEdicao = null;

    form.reset();

    tituloForm.textContent = 'Cadastrar livro';
    botaoCadastrar.textContent = 'Cadastrar livro';
    botaoCancelar.style.display = 'none';
}


// Botão cancelar edição
botaoCancelar.addEventListener('click', () => {
    cancelarEdicao();
    mostrarMensagem('Edição cancelada.');
});


// Excluir livro
async function excluirLivro(livro) {
    const confirmar = confirm(`Deseja excluir o livro "${livro.titulo}"?`);

    if (!confirmar) return;

    try {
        const res = await fetch(`${apiUrl}/${livro.id_livro}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            throw new Error('Erro ao excluir livro.');
        }

        mostrarMensagem('Livro excluído com sucesso!');
        carregarLivros();

    } catch (err) {
        mostrarMensagem(err.message, true);
    }
}


// Buscar livro pelo título
botaoBuscar.addEventListener('click', () => {
    carregarLivros(buscaInput.value.trim());
});


// Buscar ao apertar Enter
buscaInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        carregarLivros(buscaInput.value.trim());
    }
});


// Limpar busca
botaoLimpar.addEventListener('click', () => {
    buscaInput.value = '';
    carregarLivros();
});


// Carregar catálogo ao abrir a página
carregarLivros();
