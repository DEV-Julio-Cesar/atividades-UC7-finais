const { createElement } = require("react")

let lista_municipios = document.getElementById('municipios')
let estado = document.getElementById('estado')

function consultar_municipios() {
    lista_municipios.innerHTML = ''
    document.getElementById('contador').textContent = ''

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.value.toUpperCase()}/municipios`)
        .then(dados => dados.json())
        .then(municipios => {
            municipios.forEach(cidade => {
                lista_municipios.innerHTML += `<p>${cidade.nome}</p>`
            })
            document.getElementById('contador').textContent = `${municipios.length} municípios encontrados`
        })
        .catch(erro => {
            console.log(`Erro: ${erro}`)
        })
}

async function consultar_municipios2() {
    lista_municipios.innerHTML = ''
    document.getElementById('contador').textContent = ''

    let resposta = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.value.toUpperCase()}/municipios`)
    let dados = await resposta.json()
    dados.forEach(cidade => {
       // lista_municipios.innerHTML += `<p>${cidade.nome}</p>`

        let opcao = createElement('option')
        opcao.value = `${cidade.nome}<br>`
        opcao.innerHTML = `${cidade.nome}<br>`
        document.getElementById('lista').appendChild(opcao)
    })
    document.getElementById('contador').textContent = `${dados.length} municípios encontrados`
}
