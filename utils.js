function interpretarNecessidade(texto){

    texto = texto.toLowerCase()

    return {
        jogos: texto.includes("jogo"),
        bateria: texto.includes("bateria"),
        camera: texto.includes("camera"),
        barato: texto.includes("barato"),
        armazenamento: texto.includes("armazenamento")
    }

}

function pontuarProduto(produto, preferencias){

    let score = 0

    if(preferencias.jogos && produto.ram)
        score += produto.ram * 2

    if(preferencias.armazenamento && produto.storage)
        score += produto.storage / 32

    if(preferencias.barato && produto.price)
        score += 10000/(produto.price + 1)

    return score
}

//Segundo Teste

function normalizar(texto){

    if(!texto) return ""

    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .toLowerCase()

}

function buscarProdutos(produtos, termo){

    termo = normalizar(termo)

    return produtos.filter(p => {

        const nome = normalizar(p.name)
        const tags = normalizar(p.tags)

        return nome.includes(termo) || tags.includes(termo)

    })

}

function vetorProduto(p){

    const preco = parseFloat(p.price) || 0
    const ram = parseInt(p.ram) || 0
    const storage = parseInt(p.storage) || 0

    return [
        preco/10000,
        ram/32,
        storage/2000
    ]

}

function distancia(v1,v2){

    let soma = 0

    for(let i=0;i<v1.length;i++){

        soma += Math.pow(v1[i]-v2[i],2)

    }

    return Math.sqrt(soma)

}

module.exports = {
    interpretarNecessidade,
    pontuarProduto,
    buscarProdutos,
    vetorProduto,
    distancia
}