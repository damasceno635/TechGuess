const API = "http://localhost:3000/products";
let produtosGlobal = [];
let produtosFiltradosGlobal = [];
let paginaAtual = 1;
const itensPorPagina = 8;

let produtosSelecionados = new Map();

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

function aplicarFiltros() {
    paginaAtual = 1;
    atualizarValorPreco();

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
            const tags = normalizar(p.tags || "");
            // Descrição removida da busca
            if (!(nome.includes(termo) || marcaP.includes(termo) || categoriaP.includes(termo) || tags.includes(termo))) {
                return false;
            }
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

    mostrar();
}

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

        const isSelected = produtosSelecionados.has(p.id);
        card.innerHTML = `
            <div class="card-checkbox ${isSelected ? 'checked' : ''}" data-id="${p.id}"></div>
            <img src="${p.image || 'https://via.placeholder.com/200'}">
            <h3>${p.name}</h3>
            <p>${p.brand}</p>
            <p class="price">${preco}</p>
        `;

        const checkboxDiv = card.querySelector(".card-checkbox");
        checkboxDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleSelecao(p.id);
            checkboxDiv.classList.toggle("checked");
        });

        card.addEventListener("click", (e) => {
            if (e.target === checkboxDiv || checkboxDiv.contains(e.target)) return;
            abrirDetalhes(p);
        });

        div.appendChild(card);
    });

    criarPaginacao(produtosFiltradosGlobal.length);
    atualizarContadorSelecionados();
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
            mostrar();
        };
        paginacaoDiv.appendChild(btnAnterior);
    }

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === paginaAtual) btn.classList.add("ativo");
        btn.onclick = () => {
            paginaAtual = i;
            mostrar();
        };
        paginacaoDiv.appendChild(btn);
    }

    if (paginaAtual < totalPaginas) {
        const btnProximo = document.createElement("button");
        btnProximo.textContent = "Próximo";
        btnProximo.onclick = () => {
            paginaAtual++;
            mostrar();
        };
        paginacaoDiv.appendChild(btnProximo);
    }
}

function toggleSelecao(id) {
    const produto = produtosGlobal.find(p => p.id == id);
    if (produtosSelecionados.has(id)) {
        produtosSelecionados.delete(id);
    } else {
        produtosSelecionados.set(id, produto);
    }
    atualizarContadorSelecionados();
}

function atualizarContadorSelecionados() {
    const span = document.getElementById("selectedCount");
    if (span) span.textContent = produtosSelecionados.size;
}

// --- Comparação com tags (mas sem exibir tags para o usuário) ---
function compararProdutos() {
    if (produtosSelecionados.size === 0) {
        alert("Selecione pelo menos um produto para comparar.");
        return;
    }

    const necessidade = document.getElementById("needInput").value.trim();
    if (necessidade === "") {
        alert("Descreva suas necessidades para que possamos recomendar o melhor produto.");
        return;
    }

    const stopwords = [
        "de", "a", "o", "que", "e", "do", "da", "em", "um", "para", "com", "não", "uma",
        "os", "as", "dos", "das", "por", "mais", "menos", "muito", "pouco", "seu", "sua",
        "meu", "minha", "ter", "tem", "têm", "está", "estão", "ser", "são", "foi", "foram"
    ];
    const palavras = normalizar(necessidade)
        .split(/\s+/)
        .filter(palavra => palavra.length > 2 && !stopwords.includes(palavra));

    if (palavras.length === 0) {
        alert("Descreva com mais detalhes (use palavras-chave como 'câmera', 'bateria', 'desempenho').");
        return;
    }

    let pontuacoes = [];
    for (let [id, produto] of produtosSelecionados.entries()) {
        let score = 0;
        // Texto completo do produto incluindo tags (mas tags não aparecem na exibição)
        const textoProduto = normalizar(`
            ${produto.name} ${produto.brand} ${produto.category} 
            ${produto.description} ${produto.tags} 
            ${produto.ram} ${produto.storage}
        `);
        palavras.forEach(palavra => {
            const regex = new RegExp(`\\b${palavra}\\b`, 'gi');
            const matches = (textoProduto.match(regex) || []).length;
            score += matches;
        });
        // Bônus extra se palavra aparece no nome ou nas tags (peso maior)
        const nome = normalizar(produto.name);
        const tags = normalizar(produto.tags || "");
        palavras.forEach(palavra => {
            if (nome.includes(palavra)) score += 2;
            if (tags.includes(palavra)) score += 2;
        });
        pontuacoes.push({ produto, score });
    }

    pontuacoes.sort((a, b) => b.score - a.score);
    const melhor = pontuacoes[0];

    const modal = document.getElementById("modal");
    const detalhes = document.getElementById("modal-detalhes");
    const preco = parseFloat(melhor.produto.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Modal sem exibir as tags
    detalhes.innerHTML = `
        <h2>🎯 Produto Recomendado</h2>
        <img src="${melhor.produto.image || 'https://via.placeholder.com/400'}">
        <p><strong>Nome:</strong> ${melhor.produto.name}</p>
        <p><strong>Marca:</strong> ${melhor.produto.brand || "Não informada"}</p>
        <p><strong>Categoria:</strong> ${melhor.produto.category || "Não informada"}</p>
        <p><strong>Preço Estimado:</strong> ${preco}</p>
        <p><strong>RAM:</strong> ${melhor.produto.ram || "Não informada"}</p>
        <p><strong>Armazenamento:</strong> ${melhor.produto.storage || "Não informado"}</p>
        <p><strong>Descrição:</strong> ${melhor.produto.description || "Sem descrição"}</p>
        <p><strong>Por que este produto?</strong><br>
        Baseado na sua descrição, este produto obteve a maior compatibilidade (${melhor.score} pontos).<br>
        As palavras-chave que consideramos foram: ${palavras.join(", ")}.</p>
    `;
    modal.classList.add("ativo");
}

function normalizar(texto) {
    if (!texto) return "";
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function abrirDetalhes(produto) {
    const modal = document.getElementById("modal");
    const detalhes = document.getElementById("modal-detalhes");
    const preco = parseFloat(produto.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Modal de detalhes sem tags
    detalhes.innerHTML = `
        <h2>${produto.name}</h2>
        <img src="${produto.image || 'https://via.placeholder.com/400'}">
        <p><strong>Marca:</strong> ${produto.brand || "Não informada"}</p>
        <p><strong>Categoria:</strong> ${produto.category || "Não informada"}</p>
        <p><strong>Preço Estimado:</strong> ${preco}</p>
        <p><strong>RAM:</strong> ${produto.ram || "Não informada"}</p>
        <p><strong>Armazenamento:</strong> ${produto.storage || "Não informado"}</p>
        <p><strong>Descrição:</strong> ${produto.description || "Sem descrição"}</p>
    `;
    modal.classList.add("ativo");
}

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const fechar = document.getElementById("fechar");
    if (fechar) fechar.onclick = () => modal.classList.remove("ativo");
    window.onclick = (event) => { if (event.target === modal) modal.classList.remove("ativo"); };
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.classList.remove("ativo"); });

    const btnComparar = document.getElementById("compareBtn");
    if (btnComparar) btnComparar.addEventListener("click", compararProdutos);

    // Botão para fechar a barra de comparação (opcional)
    const closeBar = document.getElementById("closeCompareBar");
    if (closeBar) {
        closeBar.addEventListener("click", () => {
            document.getElementById("compareBar").style.display = "none";
        });
    }
});

function buscar() { aplicarFiltros(); }

carregar();