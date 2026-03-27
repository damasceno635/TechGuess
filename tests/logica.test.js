const { buscarProdutos } = require("../utils")

test("deve encontrar produto pelo nome", () => {

    const produtos = [
        { name: "iPhone 14", tags: "celular apple" },
        { name: "Samsung Galaxy S23", tags: "celular android" }
    ]

    const resultado = buscarProdutos(produtos,"iphone")

    expect(resultado.length).toBe(1)
    expect(resultado[0].name).toBe("iPhone 14")

})

const { vetorProduto, distancia } = require("../utils")

test("produtos parecidos devem ter distância pequena", () => {

    const produtoA = {
        price: 2000,
        ram: 8,
        storage: 256
    }

    const produtoB = {
        price: 2100,
        ram: 8,
        storage: 256
    }

    const v1 = vetorProduto(produtoA)
    const v2 = vetorProduto(produtoB)

    const dist = distancia(v1,v2)

    expect(dist).toBeLessThan(0.1)

})