const API = "http://localhost:3000/products";

async function criar() {

  const produto = {
    name: document.getElementById("name").value,
    image: document.getElementById("image").value,
    category: document.getElementById("category").value,
    brand: document.getElementById("brand").value,
    price: document.getElementById("price").value,
    ram: document.getElementById("ram").value,
    storage: document.getElementById("storage").value,
    description: document.getElementById("description").value,
    tags: document.getElementById("tags").value
  };

  try {

    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(produto)
    });

    if (!response.ok) {
      throw new Error("Erro ao criar produto");
    }

    const data = await response.json();

    alert("Produto criado com sucesso!");

    console.log(data);

  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao criar produto. Veja o console.");
  }

}