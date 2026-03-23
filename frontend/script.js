const API = "http://localhost:3000/products"

async function carregar(){

const res = await fetch(API)

const produtos = await res.json()

mostrar(produtos)

}

function mostrar(produtos){

const div = document.getElementById("produtos")

div.innerHTML=""

produtos.forEach(p=>{

div.innerHTML += `

<div class="card">

<img src="${p.image}" width="200">

<h3>${p.name}</h3>

<p>${p.brand}</p>

<p>${p.price}</p>

</div>

`

})

}

async function buscar(){

const termo = document.getElementById("busca").value.toLowerCase()

const res = await fetch(API)

const produtos = await res.json()

const filtrados = produtos.filter(p=>p.tags.toLowerCase().includes(termo))

mostrar(filtrados)

}

carregar()