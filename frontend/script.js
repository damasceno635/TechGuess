const API = "http://localhost:3000/products";

async function carregar() {
    const divProdutos = document.getElementById("produtos");
    divProdutos.innerHTML = '<div class="loading">Carregando produtos...</div>';

    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        const produtos = await res.json();
        mostrar(produtos);
    } catch (error) {
        console.error("Erro ao carregar:", error);
        divProdutos.innerHTML = '<div class="error">❌ Erro ao carregar produtos. Tente novamente mais tarde.</div>';
    }
}

function mostrar(produtos) {
    const div = document.getElementById("produtos");
    if (!produtos || produtos.length === 0) {
        div.innerHTML = '<div class="error">Nenhum produto encontrado.</div>';
        return;
    }

    div.innerHTML = "";
    produtos.forEach(p => {
        // Formata preço como moeda
        const preco = parseFloat(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        div.innerHTML += `
            <div class="card">
                <img src="${p.image || 'https://via.placeholder.com/200'}" alt="${p.name}">
                <h3>${p.name || 'Sem nome'}</h3>
                <p>${p.brand || 'Marca não informada'}</p>
                <p class="price">${preco}</p>
            </div>
        `;
    });
}

async function buscar() {
    const termo = document.getElementById("busca").value.trim().toLowerCase();
    if (termo === "") {
        carregar();
        return;
    }

    const divProdutos = document.getElementById("produtos");
    divProdutos.innerHTML = '<div class="loading">Buscando...</div>';

    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        const produtos = await res.json();

        // Filtra por tags (mantido igual ao original, mas pode expandir)
        const filtrados = produtos.filter(p => p.tags && p.tags.toLowerCase().includes(termo));
        mostrar(filtrados);
    } catch (error) {
        console.error("Erro na busca:", error);
        divProdutos.innerHTML = '<div class="error">❌ Erro ao realizar a busca.</div>';
    }
}

// Carrega os produtos ao iniciar
carregar();