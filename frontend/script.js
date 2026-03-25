const API = "http://localhost:3000/products";
let produtosGlobal = [];
let produtosFiltradosGlobal = []; // Nova variável para persistir o filtro
let paginaAtual = 1;
const itensPorPagina = 8;

async function carregar() {
    const divProdutos = document.getElementById("produtos");
    divProdutos.innerHTML = '<div class="loading">Carregando produtos...</div>';

    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        const produtos = await res.json();
        produtosGlobal = produtos;
        popularFiltros();      
        aplicarFiltros();      
    } catch (error) {
        console.error("Erro ao carregar:", error);
        divProdutos.innerHTML = '<div class="error">Erro ao carregar produtos</div>';
    }
}

function popularFiltros() {
    const categorias = [...new Set(produtosGlobal.map(p => p.category).filter(c => c && c.trim() !== ""))];
    const marcas = [...new Set(produtosGlobal.map(p => p.brand).filter(b => b && b.trim() !== ""))];
    const selectCat = document.getElementById("filtro-categoria");
    const selectMarca = document.getElementById("filtro-marca");

    if (selectCat) {
        selectCat.innerHTML = '<option value="">Todas</option>';
        categorias.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat;
            selectCat.appendChild(option);
        });
    }

    if (selectMarca) {
        selectMarca.innerHTML = '<option value="">Todas</option>';
        marcas.forEach(marca => {
            const option = document.createElement("option");
            option.value = marca;
            option.textContent = marca;
            selectMarca.appendChild(option);
        });
    }

    const precos = produtosGlobal.map(p => parseFloat(p.price)).filter(p => !isNaN(p));
    const maxPreco = precos.length ? Math.max(...precos) : 10000;
    const slider = document.getElementById("filtro-preco");
    if (slider) {
        slider.max = maxPreco;
        slider.value = maxPreco;
        atualizarValorPreco();
    }
}

function atualizarValorPreco() {
    const slider = document.getElementById("filtro-preco");
    const span = document.getElementById("valor-preco");
    if (slider && span) {
        const valor = parseFloat(slider.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        span.textContent = valor;
    }
}

// Esta função agora APENAS filtra e reseta a página
function aplicarFiltros() {
    paginaAtual = 1; 
    atualizarValorPreco(); // Garante que o span de preço atualize ao mover o slider

    const termo = normalizar(document.getElementById("busca").value.trim());
    const categoria = document.getElementById("filtro-categoria")?.value || "";
    const marca = document.getElementById("filtro-marca")?.value || "";
    const precoMax = parseFloat(document.getElementById("filtro-preco")?.value) || Infinity;
    const ordenacao = document.getElementById("ordenacao")?.value || "nome_asc";

    produtosFiltradosGlobal = produtosGlobal.filter(p => {
        if (termo !== "") {
            const nome = normalizar(p.name || "");
            const marcaP = normalizar(p.brand || "");
            const categoriaP = normalizar(p.category || "");
            if (!(nome.includes(termo) || marcaP.includes(termo) || categoriaP.includes(termo))) return false;
        }
        if (categoria && p.category !== categoria) return false;
        if (marca && p.brand !== marca) return false;
        const preco = parseFloat(p.price);
        if (isNaN(preco) || preco > precoMax) return false;
        return true;
    });

    produtosFiltradosGlobal.sort((a, b) => {
        switch (ordenacao) {
            case "nome_asc": return (a.name || "").localeCompare(b.name || "");
            case "nome_desc": return (b.name || "").localeCompare(a.name || "");
            case "preco_asc": return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
            case "preco_desc": return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
            default: return 0;
        }
    });

    mostrar(); // Renderiza o que foi filtrado
}

// Esta função apenas exibe o que está em produtosFiltradosGlobal baseado na paginaAtual
function mostrar() {
    const div = document.getElementById("produtos");
    const paginacaoDiv = document.getElementById("paginacao");

    if (!produtosFiltradosGlobal || produtosFiltradosGlobal.length === 0) {
        div.innerHTML = "<p>Nenhum produto encontrado</p>";
        paginacaoDiv.innerHTML = "";
        return;
    }

    const totalPaginas = Math.ceil(produtosFiltradosGlobal.length / itensPorPagina);
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const produtosPagina = produtosFiltradosGlobal.slice(inicio, fim);

    div.innerHTML = "";
    produtosPagina.forEach(p => {
        const preco = parseFloat(p.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${p.image || 'https://via.placeholder.com/200'}">
            <h3>${p.name}</h3>
            <p>${p.brand}</p>
            <p class="price">${preco}</p>
        `;
        card.addEventListener("click", () => abrirDetalhes(p));
        div.appendChild(card);
    });

    criarPaginacao(produtosFiltradosGlobal.length);
}

function criarPaginacao(totalItens) {
    const paginacaoDiv = document.getElementById("paginacao");
    paginacaoDiv.innerHTML = "";
    const totalPaginas = Math.ceil(totalItens / itensPorPagina);
    if (totalPaginas <= 1) return;

    if (paginaAtual > 1) {
        const btnAnterior = document.createElement("button");
        btnAnterior.textContent = "Anterior";
        btnAnterior.onclick = () => {
            paginaAtual--;
            mostrar(); // Chama mostrar, NÃO aplicarFiltros
        };
        paginacaoDiv.appendChild(btnAnterior);
    }

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === paginaAtual) btn.classList.add("ativo");
        btn.onclick = () => {
            paginaAtual = i;
            mostrar(); // Chama mostrar, NÃO aplicarFiltros
        };
        paginacaoDiv.appendChild(btn);
    }

    if (paginaAtual < totalPaginas) {
        const btnProximo = document.createElement("button");
        btnProximo.textContent = "Próximo";
        btnProximo.onclick = () => {
            paginaAtual++;
            mostrar(); // Chama mostrar, NÃO aplicarFiltros
        };
        paginacaoDiv.appendChild(btnProximo);
    }
}

// Abre o modal com detalhes do produto
function abrirDetalhes(produto) {
    const modal = document.getElementById("modal");
    const detalhes = document.getElementById("modal-detalhes");

    const preco = parseFloat(produto.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    detalhes.innerHTML = `
        <h2>${produto.name}</h2>
        <img src="${produto.image || 'https://via.placeholder.com/400'}">
        <p><strong>Marca:</strong> ${produto.brand || "Não informada"}</p>
        <p><strong>Categoria:</strong> ${produto.category || "Não informada"}</p>
        <p><strong>Preço:</strong> ${preco}</p>
        <p><strong>RAM:</strong> ${produto.ram || "Não informada"}</p>
        <p><strong>Armazenamento:</strong> ${produto.storage || "Não informado"}</p>
        <p><strong>Descrição:</strong> ${produto.description || "Sem descrição"}</p>
    `;

    modal.classList.add("ativo");
}

// Normaliza texto para busca (remove acentos e caixa alta)
function normalizar(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

// Função de busca legada
function buscar() {
    aplicarFiltros();
}

// Configuração do modal e eventos de fechar
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const fechar = document.getElementById("fechar");

    if (fechar) {
        fechar.onclick = () => modal.classList.remove("ativo");
    }

    window.onclick = (event) => {
        if (event.target === modal) modal.classList.remove("ativo");
    };

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") modal.classList.remove("ativo");
    });
});

// Inicia o carregamento
carregar();