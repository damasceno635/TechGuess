const API = "http://localhost:3000/products";
let produtosGlobal = [];
let produtosFiltradosGlobal = [];
let paginaAtual = 1;
const itensPorPagina = 8;

let produtosSelecionados = new Map();

// Referências DOM
const modalDetalhes = document.getElementById("modal");
const modalDetalhesContent = document.getElementById("modal-detalhes");
const closeDetalhes = document.getElementById("fechar");

const compareModal = document.getElementById("compareModal");
const openCompareBtn = document.getElementById("openCompareBtn");
const closeCompareModal = document.getElementById("closeCompareModal");
const selectedCountSpan = document.getElementById("selectedCountModal");
const needInputModal = document.getElementById("needInputModal");
const compareBtnModal = document.getElementById("compareBtnModal");
const selectedListDiv = document.getElementById("selectedList");

// CARREGAR PRODUTOS 
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
    if (!produtosGlobal || produtosGlobal.length === 0) return;
    
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
    if (precos.length > 0) {
        const maxPreco = Math.max(...precos);
        const slider = document.getElementById("filtro-preco");
        if (slider) {
            slider.max = Math.ceil(maxPreco);
            slider.value = Math.ceil(maxPreco);
            atualizarValorPreco();
        }
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
    if (!produtosGlobal || produtosGlobal.length === 0) return;
    
    paginaAtual = 1;
    
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
            // Atualiza o modal de comparação se estiver aberto
            if (compareModal && compareModal.classList.contains("ativo")) {
                atualizarModalComparacao();
            }
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
    // Se o modal de comparação estiver aberto, atualiza também seu contador
    if (selectedCountSpan && compareModal && compareModal.classList.contains("ativo")) {
        selectedCountSpan.textContent = produtosSelecionados.size;
    }
}

// FUNÇÕES DE RECOMENDAÇÃO 
function vetorProduto(p){
    const preco = parseFloat(p.price) || 0;
    const ram = parseInt(p.ram) || 0;
    const storage = parseInt(p.storage) || 0;
    return [
        preco / 10000,
        ram / 32,
        storage / 2000
    ];
}

function distancia(v1, v2){
    let soma = 0;
    for(let i = 0; i < v1.length; i++){
        soma += Math.pow(v1[i] - v2[i], 2);
    }
    return Math.sqrt(soma);
}

function recomendarProdutos(produtoBase){
    const vetorBase = vetorProduto(produtoBase);
    return produtosGlobal
        .filter(p => p.id !== produtoBase.id && p.category === produtoBase.category)
        .map(p => {
            const vetor = vetorProduto(p);
            let dist = distancia(vetorBase, vetor);
            let bonus = 0;
            if(p.brand === produtoBase.brand) bonus -= 0.2;
            if(p.tags && produtoBase.tags){
                const t1 = p.tags.split(",");
                const t2 = produtoBase.tags.split(",");
                const iguais = t1.filter(tag => t2.includes(tag));
                bonus -= iguais.length * 0.05;
            }
            return { produto: p, score: dist + bonus };
        })
        .sort((a,b) => a.score - b.score)
        .slice(0,4)
        .map(r => r.produto);
}

// MODAL DE DETALHES E RECOMENDAÇÕES 
function formatarDescricao(texto) {
    if (!texto) return "Sem descrição";
    let textoEscapado = texto.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
    return textoEscapado.replace(/\n/g, '<br>');
}

function mostrarRecomendacoes(lista) {
    // Remove container antigo se existir
    const antigo = document.querySelector(".recomendacoes-container");
    if (antigo) antigo.remove();

    if (!lista || lista.length === 0) return;

    const container = document.createElement("div");
    container.className = "recomendacoes-container";
    container.innerHTML = '<div class="recomendacoes-titulo">📱 Produtos semelhantes</div>';

    const divRecom = document.createElement("div");
    divRecom.className = "recomendacoes";

    lista.forEach(p => {
        const card = document.createElement("div");
        card.className = "mini-card";
        const preco = parseFloat(p.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        card.innerHTML = `
            <img src="${p.image || 'https://via.placeholder.com/120'}">
            <p>${p.name}</p>
            <div class="price">${preco}</div>
        `;
        card.onclick = () => abrirDetalhes(p);
        divRecom.appendChild(card);
    });

    container.appendChild(divRecom);
    document.getElementById("modal-detalhes").appendChild(container);
}

function abrirDetalhes(produto) {
    const preco = parseFloat(produto.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const categoria = (produto.category || "").toLowerCase();
    const isFone = categoria.includes("fone") || categoria.includes("fone de ouvido");
    
    let html = `
        <h2>${produto.name}</h2>
        <img src="${produto.image || 'https://via.placeholder.com/400'}">
        <p><strong>Marca:</strong> ${produto.brand || "Não informada"}</p>
        <p><strong>Categoria:</strong> ${produto.category || "Não informada"}</p>
        <p><strong>Preço Estimado:</strong> ${preco}</p>
    `;
    
    if (!isFone) {
        html += `
            <p><strong>RAM:</strong> ${produto.ram || "Não informada"}</p>
            <p><strong>Armazenamento:</strong> ${produto.storage || "Não informado"}</p>
        `;
    }
    
    const descricaoFormatada = formatarDescricao(produto.description);
    html += `
        <p><strong>Descrição:</strong></p>
        <div class="descricao-texto">${descricaoFormatada}</div>
    `;
    
    modalDetalhesContent.innerHTML = html;
    modalDetalhes.classList.add("ativo");
    
    // Carrega recomendações
    const recomendados = recomendarProdutos(produto);
    mostrarRecomendacoes(recomendados);
}

// MODAL DE COMPARAÇÃO 
function atualizarModalComparacao() {
    // Atualiza contador
    if (selectedCountSpan) {
        selectedCountSpan.textContent = produtosSelecionados.size;
    }

    // Monta lista de produtos selecionados
    if (selectedListDiv) {
        if (produtosSelecionados.size === 0) {
            selectedListDiv.innerHTML = '<p class="empty-list" style="text-align:center; color: var(--gray-500);">Nenhum produto selecionado</p>';
        } else {
            selectedListDiv.innerHTML = '';
            for (let [id, prod] of produtosSelecionados.entries()) {
                const div = document.createElement('div');
                div.className = 'selected-item';
                div.innerHTML = `
                    <span><strong>${prod.name}</strong> (${prod.brand})</span>
                    <button class="remove-selected" data-id="${id}">✖</button>
                `;
                selectedListDiv.appendChild(div);
            }
            // Adiciona eventos para remover
            document.querySelectorAll('.remove-selected').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    toggleSelecao(id);
                    // Atualiza modal e também os checkboxes nos cards
                    atualizarModalComparacao();
                    mostrar(); // recria cards com checkboxes atualizados
                });
            });
        }
    }
}

function executarComparacao(necessidade) {
    if (produtosSelecionados.size === 0) {
        alert("Selecione pelo menos um produto para comparar.");
        return;
    }
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

    const preco = parseFloat(melhor.produto.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const resultadoHTML = `
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
    modalDetalhesContent.innerHTML = resultadoHTML;
    modalDetalhes.classList.add("ativo");
    compareModal.classList.remove("ativo"); // fecha o modal de comparação
}

// UTILITÁRIOS 
function normalizar(texto) {
    if (!texto) return "";
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

// EVENTOS E INICIALIZAÇÃO 
document.addEventListener("DOMContentLoaded", () => {
    // Fechar modais (detalhes e comparação)
    if (closeDetalhes) closeDetalhes.onclick = () => modalDetalhes.classList.remove("ativo");
    if (closeCompareModal) closeCompareModal.onclick = () => compareModal.classList.remove("ativo");

    window.onclick = (event) => {
        if (event.target === modalDetalhes) modalDetalhes.classList.remove("ativo");
        if (event.target === compareModal) compareModal.classList.remove("ativo");
    };
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            modalDetalhes.classList.remove("ativo");
            compareModal.classList.remove("ativo");
        }
    });

    // Abrir modal de comparação
    if (openCompareBtn) {
        openCompareBtn.addEventListener("click", () => {
            atualizarModalComparacao();
            compareModal.classList.add("ativo");
        });
    }

    // Botão de comparar dentro do modal
    if (compareBtnModal) {
        compareBtnModal.addEventListener("click", () => {
            const necessidade = needInputModal ? needInputModal.value.trim() : "";
            executarComparacao(necessidade);
        });
    }

    // Carregar produtos
    carregar();
});