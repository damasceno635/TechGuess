const API = "http://localhost:3000/products";
let produtosGlobal = []; // Armazena todos os produtos carregados

async function carregar() {
    const divProdutos = document.getElementById("produtos");
    divProdutos.innerHTML = '<div class="loading">Carregando produtos...</div>';

    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);

        const produtos = await res.json();
        produtosGlobal = produtos; // guarda globalmente
        mostrar(produtos);

    } catch (error) {
        console.error("Erro ao carregar:", error);
        divProdutos.innerHTML = '<div class="error">Erro ao carregar produtos</div>';
    }
}

function mostrar(produtos) {
    const div = document.getElementById("produtos");

    if (!produtos || produtos.length === 0) {
        div.innerHTML = "<p>Nenhum produto encontrado</p>";
        return;
    }

    div.innerHTML = "";

    produtos.forEach(p => {
        const preco = parseFloat(p.price || 0).toLocaleString(
            'pt-BR',
            { style: 'currency', currency: 'BRL' }
        );

        // Cria o card com um dataset contendo o ID do produto (ou índice)
        const card = document.createElement("div");
        card.className = "card";
        card.setAttribute("data-id", p.id);
        card.innerHTML = `
            <img src="${p.image || 'https://via.placeholder.com/200'}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>${p.brand}</p>
            <p class="price">${preco}</p>
        `;
        // Adiciona evento de clique para abrir o modal
        card.addEventListener("click", () => abrirDetalhes(p));
        div.appendChild(card);
    });
}

function abrirDetalhes(produto){

const modal = document.getElementById("modal")
const detalhes = document.getElementById("modal-detalhes")

const preco = parseFloat(produto.price || 0).toLocaleString(
"pt-BR",
{style:"currency",currency:"BRL"}
)

detalhes.innerHTML = `
<h2>${produto.name}</h2>

<img src="${produto.image || 'https://via.placeholder.com/400'}">

<p><strong>Marca:</strong> ${produto.brand || "Não informada"}</p>
<p><strong>Categoria:</strong> ${produto.category || "Não informada"}</p>
<p><strong>Preço:</strong> ${preco}</p>
<p><strong>RAM:</strong> ${produto.ram || "Não informada"}</p>
<p><strong>Armazenamento:</strong> ${produto.storage || "Não informado"}</p>
<p><strong>Descrição:</strong> ${produto.description || "Sem descrição"}</p>
`

modal.classList.add("ativo")

}

function normalizar(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

async function buscar() {
    const termo = normalizar(
        document.getElementById("busca").value.trim()
    );

    if (termo === "") {
        carregar();
        return;
    }

    const res = await fetch(API);
    const produtos = await res.json();

    const filtrados = produtos.filter(p => {
        const nome = normalizar(p.name || "");
        const marca = normalizar(p.brand || "");
        const categoria = normalizar(p.category || "");
        const descricao = normalizar(p.description || "");
        const tags = normalizar(p.tags || "");

        return (
            nome.includes(termo) ||
            marca.includes(termo) ||
            categoria.includes(termo) ||
            descricao.includes(termo) ||
            tags.includes(termo)
        );
    });

    mostrar(filtrados);
}

// Configura o modal para fechar ao clicar no X ou fora da área de conteúdo
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const fechar = document.getElementById("fechar");

    // Fecha ao clicar no X
    if (fechar) {
        fechar.onclick = () => {
            modal.classList.remove("ativo");
        };
    }

    // Fecha ao clicar fora da caixa branca
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.classList.remove("ativo");
        }
    };

    // Fecha ao apertar a tecla ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            modal.classList.remove("ativo");
        }
    });
});

// Inicia a aplicação
carregar();