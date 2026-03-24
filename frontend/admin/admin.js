const API = "http://localhost:3000/products";

async function criar() {
    const btn = document.getElementById("submitBtn");
    const msgDiv = document.getElementById("message");

    // Coleta valores
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

    // Validação simples
    if (!produto.name || !produto.brand || isNaN(produto.price)) {
        showMessage("Por favor, preencha nome, marca e preço corretamente.", "error");
        return;
    }

    // Desabilita botão durante envio
    btn.disabled = true;
    btn.textContent = "Enviando...";
    msgDiv.style.display = "none";

    try {
        const response = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(produto)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erro ao criar produto");
        }

        const data = await response.json();
        showMessage("✅ Produto criado com sucesso!", "success");
        console.log(data);

        // Limpa formulário
        document.querySelectorAll("input, textarea").forEach(el => el.value = "");
    } catch (error) {
        console.error("Erro:", error);
        showMessage("❌ Erro ao criar produto: " + error.message, "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Criar Produto";
    }
}

function showMessage(text, type) {
    const msgDiv = document.getElementById("message");
    msgDiv.textContent = text;
    msgDiv.className = type;
    msgDiv.style.display = "block";

    // Esconde após 5 segundos
    setTimeout(() => {
        msgDiv.style.display = "none";
    }, 5000);
}