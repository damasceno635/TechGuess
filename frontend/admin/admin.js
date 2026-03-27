const API = "http://localhost:3000/products";
let produtosCompletos = [];      // Todos os produtos carregados
let produtosFiltrados = [];      // Produtos após busca
let paginaAdminAtual = 1;
const itensPorPaginaAdmin = 5;

// AUTENTICAÇÃO
const SENHA_ADMIN = "admin123";

function verificarSenha() {
    const senhaInput = document.getElementById("senhaAdmin");
    const senha = senhaInput.value;
    const loginError = document.getElementById("loginError");
    
    if (senha === SENHA_ADMIN) {
        // Login bem-sucedido
        localStorage.setItem("adminAutenticado", "true");
        document.getElementById("loginOverlay").style.display = "none";
        document.getElementById("adminContent").style.display = "block";
        
        // Carregar dados após login
        carregarProdutos();
    } else {
        // Senha incorreta
        loginError.style.display = "block";
        senhaInput.value = "";
        senhaInput.focus();
    }
}

function logout() {
    localStorage.removeItem("adminAutenticado");
    document.getElementById("adminContent").style.display = "none";
    document.getElementById("loginOverlay").style.display = "flex";
    document.getElementById("senhaAdmin").value = "";
    document.getElementById("loginError").style.display = "none";
}

function verificarAutenticacao() {
    const autenticado = localStorage.getItem("adminAutenticado");
    if (autenticado === "true") {
        document.getElementById("loginOverlay").style.display = "none";
        document.getElementById("adminContent").style.display = "block";
        carregarProdutos();
    } else {
        document.getElementById("loginOverlay").style.display = "flex";
        document.getElementById("adminContent").style.display = "none";
    }
}

// CRIAÇÃO
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
        await carregarProdutos();  // Recarrega a lista
    } catch (error) {
        console.error(error);
        showMessage("❌ Erro: " + error.message, "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Criar Produto";
    }
}

//  LISTAGEM COM BUSCA E PAGINAÇÃO 
async function carregarProdutos() {
    const divLista = document.getElementById("lista-produtos");
    divLista.innerHTML = "<p>Carregando...</p>";
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error("Erro ao carregar");
        produtosCompletos = await res.json();
        filtrarProdutosAdmin();  // Aplica filtro (se houver) e exibe
    } catch (error) {
        divLista.innerHTML = "<p>Erro ao carregar produtos.</p>";
        console.error(error);
    }
}

function filtrarProdutosAdmin() {
    const termo = document.getElementById("buscaAdmin").value.trim().toLowerCase();
    
    if (termo === "") {
        produtosFiltrados = [...produtosCompletos];
    } else {
        produtosFiltrados = produtosCompletos.filter(prod => 
            prod.name && prod.name.toLowerCase().includes(termo)
        );
    }
    
    paginaAdminAtual = 1;
    exibirProdutosPaginados();
}

function limparBuscaAdmin() {
    document.getElementById("buscaAdmin").value = "";
    filtrarProdutosAdmin();
}

function exibirProdutosPaginados() {
    const divLista = document.getElementById("lista-produtos");
    const paginacaoDiv = document.getElementById("adminPaginacao");
    
    if (!produtosFiltrados.length) {
        divLista.innerHTML = "<p>Nenhum produto encontrado.</p>";
        paginacaoDiv.innerHTML = "";
        return;
    }
    
    const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPaginaAdmin);
    if (paginaAdminAtual > totalPaginas) paginaAdminAtual = totalPaginas;
    
    const inicio = (paginaAdminAtual - 1) * itensPorPaginaAdmin;
    const fim = inicio + itensPorPaginaAdmin;
    const produtosPagina = produtosFiltrados.slice(inicio, fim);
    
    divLista.innerHTML = "";
    produtosPagina.forEach(prod => {
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
    
    criarPaginacaoAdmin(totalPaginas);
}

function criarPaginacaoAdmin(totalPaginas) {
    const paginacaoDiv = document.getElementById("adminPaginacao");
    paginacaoDiv.innerHTML = "";
    if (totalPaginas <= 1) return;
    
    // Botão anterior
    if (paginaAdminAtual > 1) {
        const btnAnterior = document.createElement("button");
        btnAnterior.textContent = "Anterior";
        btnAnterior.onclick = () => {
            paginaAdminAtual--;
            exibirProdutosPaginados();
        };
        paginacaoDiv.appendChild(btnAnterior);
    }
    
    // Botões de página
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === paginaAdminAtual) btn.classList.add("ativo");
        btn.onclick = () => {
            paginaAdminAtual = i;
            exibirProdutosPaginados();
        };
        paginacaoDiv.appendChild(btn);
    }
    
    // Botão próximo
    if (paginaAdminAtual < totalPaginas) {
        const btnProximo = document.createElement("button");
        btnProximo.textContent = "Próximo";
        btnProximo.onclick = () => {
            paginaAdminAtual++;
            exibirProdutosPaginados();
        };
        paginacaoDiv.appendChild(btnProximo);
    }
}

// EDIÇÃO 
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

// EXCLUSÃO 
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

// INICIALIZAÇÃO 
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
    
    // Verificar autenticação ao carregar a página
    verificarAutenticacao();
    
    // Permitir login com Enter
    const senhaInput = document.getElementById("senhaAdmin");
    if (senhaInput) {
        senhaInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") verificarSenha();
        });
    }
});