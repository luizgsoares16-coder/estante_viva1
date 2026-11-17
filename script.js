const apiUrl = 'http://localhost:3000/livro';

const form = document.getElementById('estante-form');
const table = document.getElementById('estante-tabela');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('titulo').value;
    const author = document.getElementById('autor').value;
    const price = document.getElementById('preco').value;
    const quantEstoque = document.getElementById('quant_estoque').value;

    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Contente-Type': 'application/json' },
            body: JSON.stringify({ title, author, price, quantEstoque })
        });

        if (!res.ok) throw new Error ('Erro ao adicionar livro');

        const livro = await res.json();
        form.reset();
        addTaskToTable(livro);
    } catch (err) {
        alert("Erro ao salvar livro: " + err.message);
    }
});

function addTaskToTable (livro) {
    const tr = document.createElement("tr");
    tr.className = livro.completed ? "completed" : "";

    const td1 = document.createElement("td");
    td1.textContent = livro.title;

    const td2 = document.createElement("td");
    td2.textContent = livro.author;

    const td3 = document.createElement("td");
    td3.textContent = livro.price;

    const td4 = document.createElement("td");
    td4.textContent = livro.quantEstoque;


    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);

    table.appendChild(tr);
    }

    
}