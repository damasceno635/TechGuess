const { interpretarNecessidade } = require("../utils")

test("deve identificar quando usuário quer produto para jogos", () => {

    const resultado = interpretarNecessidade("quero celular para jogo")

    expect(resultado.jogos).toBe(true)

})

const { pontuarProduto } = require("../utils")

test("produto com muita RAM deve ter pontuação maior para jogos", () => {

    const produto = {
        ram: 16,
        storage: 256,
        price: 2000
    }

    const preferencias = {
        jogos: true,
        armazenamento: false,
        barato: false
    }

    const score = pontuarProduto(produto, preferencias)

    expect(score).toBeGreaterThan(10)

})