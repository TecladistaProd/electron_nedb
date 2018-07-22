const { ipcRenderer } = require('electron')
window.onload = () => {
    let contatos = []
    ipcRenderer.send('banco:r')
    let form = document.querySelector('form')
    let campos = []
    if(window.localStorage.getItem('campos')){
        campos = [...JSON.parse(window.localStorage.getItem('campos'))]
        campos.forEach(item=>{
            form.querySelectorAll('span')[1].innerHTML += item
        })
    }

    ipcRenderer.on('addCampo', (e, item)=>{
        let x = `
            <label class="label">
                ${item.nome}
                <input class="input" type="text" placeholder="${item.info}" name="${item.nome.split(' ')[0].toLowerCase()}"/>
            </label>
        `
        campos.push(x)
        console.log(campos)
        window.localStorage.setItem('campos', JSON.stringify(campos))
        form.querySelectorAll('span')[1].innerHTML += x
    })

    ipcRenderer.on('banco:s', (e, items)=>{
        contatos = []
        items.forEach(item=>{
            delete item.createdAt
            delete item.updatedAt
            contatos.push(item)
        })
        document.querySelector('.contatos').innerHTML = ''
        contatos.forEach(item =>{
            let nome
            let dados = ``
            Object.keys(item).forEach(i =>{
                if(i === '_id')
                    return
                else if(i === 'nome'){
                    nome = item[i]
                }
                else {
                    dados += `<p>${item[i]}</p>`
                }
            })
            document.querySelector('.contatos').innerHTML += `
            <div class="card">
                <div class="card-content">
                    <div class="media">
                        <div class="media-content">
                            <h1 class="subtitle is-4">${nome}</h1>
                        </div>
                    </div>
                    <div class="content">
                        ${dados}
                    </div>
                </div>
            </div>
            `
        })
    })

    form.querySelector('input:last-child').addEventListener('keyup', (e)=>{
        if(e.keycode === 13 || e.which === 13)
            form.submit()
    })
    form.addEventListener('submit', e=>{
        e.preventDefault()
        let obj = {}
        e.target.querySelectorAll('input').forEach(item =>{
            obj[item.name] = item.value
            item.value = ''
        })
        console.log(obj)
        ipcRenderer.send('addContato', obj)
        ipcRenderer.send('banco:r')
    })
}

/*
let template = `
<div class="card">
    <div class="card-content">
        <div class="media">
            <div class="media-content">
                <h1 class="subtitle is-4">${nome}</h1>
            </div>
            <div class="content">
            </div>
        </div>
    </div>
</div>
`*/