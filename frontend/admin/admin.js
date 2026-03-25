const API = "http://localhost:3000/products";

// ==================== CRIAÇÃO ====================
async function criarProduto() {
    const btn = document.getElementById("submitBtn");
    const msgDiv = document.getElementById("message");

    const produto = {
        name: document.getElementById("name").value.trim(),
        image: document.getElementById("image").value.trim(),
        category: document.getElementById("category").value.trim(),
        brand: document.getElementById("brand").value.trim(),
        price: parseFloat(document.getElementById("price").value),
        ram: document.getElementById("ram").value.trim(),
        storage: document.getElementById("storage").value.trim(),
        description: document.getElementById("description").value.trim(),
        tags: document.getElementById("tags").value.trim()
    };

    if (!produto.name || !produto.brand || isNaN(produto.price)) {
        showMessage("Preencha nome, marca e preço.", "error");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando...";
    msgDiv.style.display = "none";

    try {
        const response = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(produto)
        });
        if (!response.ok) throw new Error(await response.text());
        showMessage("✅ Produto criado!", "success");
        document.querySelectorAll("#name, #image, #category, #brand, #price, #ram, #storage, #description, #tags").forEach(el => el.value = "");
        carregarProdutos();
    } catch (error) {
        console.error(error);
        showMessage("❌ Erro: " + error.message, "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Criar Produto";
    }
}

// ==================== LISTAGEM ====================
async function carregarProdutos() {
    const divLista = document.getElementById("lista-produtos");
    divLista.innerHTML = "<p>Carregando...</p>";
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error("Erro ao carregar");
        const produtos = await res.json();
        exibirProdutos(produtos);
    } catch (error) {
        divLista.innerHTML = "<p>Erro ao carregar produtos.</p>";
        console.error(error);
    }
}

function exibirProdutos(produtos) {
    const divLista = document.getElementById("lista-produtos");
    if (!produtos.length) {
        divLista.innerHTML = "<p>Nenhum produto encontrado.</p>";
        return;
    }
    divLista.innerHTML = "";
    produtos.forEach(prod => {
        const preco = parseFloat(prod.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const item = document.createElement("div");
        item.className = "product-item";
        item.innerHTML = `
            <div class="product-info">
                <h3>${prod.name}</h3>
                <p>${prod.brand} | ${preco}</p>
            </div>
            <div class="actions">
                <button class="edit-btn" data-id="${prod.id}">Editar</button>
                <button class="delete-btn" data-id="${prod.id}">Excluir</button>
            </div>
        `;
        divLista.appendChild(item);
    });
    document.querySelectorAll(".edit-btn").forEach(btn => btn.addEventListener("click", () => abrirModalEditar(btn.dataset.id)));
    document.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", () => excluirProduto(btn.dataset.id)));
}

// ==================== EDIÇÃO ====================
async function abrirModalEditar(id) {
    try {
        const res = await fetch(`${API}/${id}`);
        if (!res.ok) throw new Error("Produto não encontrado");
        const prod = await res.json();
        document.getElementById("edit-id").value = prod.id;
        document.getElementById("edit-name").value = prod.name || "";
        document.getElementById("edit-image").value = prod.image || "";
        document.getElementById("edit-category").value = prod.category || "";
        document.getElementById("edit-brand").value = prod.brand || "";
        document.getElementById("edit-price").value = prod.price || "";
        document.getElementById("edit-ram").value = prod.ram || "";
        document.getElementById("edit-storage").value = prod.storage || "";
        document.getElementById("edit-description").value = prod.description || "";
        document.getElementById("edit-tags").value = prod.tags || "";
        document.getElementById("modalEditar").classList.add("ativo");
    } catch (error) {
        alert("Erro ao carregar produto para edição.");
        console.error(error);
    }
}

async function salvarEdicao() {
    const id = document.getElementById("edit-id").value;
    const produto = {
        name: document.getElementById("edit-name").value.trim(),
        image: document.getElementById("edit-image").value.trim(),
        category: document.getElementById("edit-category").value.trim(),
        brand: document.getElementById("edit-brand").value.trim(),
        price: parseFloat(document.getElementById("edit-price").value),
        ram: document.getElementById("edit-ram").value.trim(),
        storage: document.getElementById("edit-storage").value.trim(),
        description: document.getElementById("edit-description").value.trim(),
        tags: document.getElementById("edit-tags").value.trim()
    };
    if (!produto.name || !produto.brand || isNaN(produto.price)) {
        showEditMessage("Preencha nome, marca e preço.", "error");
        return;
    }

    const btn = document.getElementById("salvarBtn");
    btn.disabled = true;
    btn.textContent = "Salvando...";
    try {
        const res = await fetch(`${API}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(produto)
        });
        if (!res.ok) throw new Error(await res.text());
        showEditMessage("✅ Produto atualizado!", "success");
        setTimeout(() => {
            document.getElementById("modalEditar").classList.remove("ativo");
            carregarProdutos();
        }, 1500);
    } catch (error) {
        showEditMessage("❌ Erro: " + error.message, "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Salvar Alterações";
    }
}

function showEditMessage(text, type) {
    const msg = document.getElementById("edit-message");
    msg.textContent = text;
    msg.className = type;
    msg.style.display = "block";
    setTimeout(() => msg.style.display = "none", 3000);
}

// ==================== EXCLUSÃO ====================
async function excluirProduto(id) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
        const res = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(await res.text());
        alert("Produto excluído com sucesso!");
        carregarProdutos();
    } catch (error) {
        alert("Erro ao excluir: " + error.message);
    }
}

// ==================== INICIALIZAÇÃO ====================
function showMessage(text, type) {
    const msgDiv = document.getElementById("message");
    msgDiv.textContent = text;
    msgDiv.className = type;
    msgDiv.style.display = "block";
    setTimeout(() => msgDiv.style.display = "none", 5000);
}

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modalEditar");
    const fechar = document.getElementById("fecharEditar");
    if (fechar) fechar.onclick = () => modal.classList.remove("ativo");
    window.onclick = e => { if (e.target === modal) modal.classList.remove("ativo"); };
    carregarProdutos();
});