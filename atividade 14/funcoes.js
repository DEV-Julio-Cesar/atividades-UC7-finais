let lista_municipios = document.getElementById('municipios')
let estado = document.getElementById('estado')

function consultar_municipios() {
    lista_municipios.innerHTML = ''
    document.getElementById('contador').textContent = ''

    // .value é propriedade — sem parênteses
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

    // .value é propriedade — sem parênteses
    let resposta = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.value.toUpperCase()}/municipios`)
    let dados = await resposta.json()

    // Limpa o select mantendo o placeholder
    const lista = document.getElementById('lista')
    lista.innerHTML = '<option value="">Escolha o Município</option>'

    dados.forEach(cidade => {
        lista_municipios.innerHTML += `<p>${cidade.nome}</p>`

        // document.createElement — sem esquecer o 'document.'
        let opcao = document.createElement('option')
        opcao.value       = cidade.nome   // sem <br>
        opcao.textContent = cidade.nome   // sem <br>
        lista.appendChild(opcao)
    })

    document.getElementById('contador').textContent = `${dados.length} municípios encontrados`
}
