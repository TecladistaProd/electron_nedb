
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const notifier = require('node-notifier')
const url = require('url')
const banco = require('./banco')('lista')
let mainWin = null, addWin = null
console.log(__dirname)
let createWin = ((file, obj = {}) => {
    let win
    obj.width = obj.width || 800
    obj.height = obj.height || 600
    obj.show = obj.show || true
    obj.minHeight = 76
    obj.minWidth = 523
    win = new BrowserWindow(obj)
    win.loadURL(url.format({
        pathname: path.join(__dirname, `views/${file}.html`),
        protocol: 'file',
        slashes: true
    }))
    return win
})

app.on('ready', () => {
    mainWin = createWin('main')
    mainWin.once('ready-to-show', () => mainWin.show())
    mainWin.on('closed', () => app.quit())
    const mainMenu = Menu.buildFromTemplate(mainMenuTp)
    Menu.setApplicationMenu(mainMenu)

    notifier.notify({
        title: 'Electron NeDB',
        message: 'Programa iniciado com sucesso',
        //icon
    })
})

ipcMain.on('banco:r', async (e, item)=>{
    let d = await banco.findAll()
    mainWin.webContents.send('banco:s', d)
})

function createAddWindow(){
    addWin = createWin('add', { width: 320, height: 180, title: 'Add Item', frame: false, resizable: false })

    addWin.on('close', () => addWin = null)
}

ipcMain.on('addCampo', (e, item) => {
    addWin.close()
    mainWin.webContents.send('addCampo', item)
})

ipcMain.on('addContato', (e, item)=>{
    banco.insert(item)
})

const mainMenuTp = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Adicionar Campo',
                accelerator: 'CommandOrControl+D',
                click() { createAddWindow() }
            },
            {
                label: 'Criar Backup do Banco',
                //accelerator: 'CommandOrControl+D',
                click() { banco.backup() }
            },
            {
                label: 'Remover Campo',
                accelerator: 'CommandOrControl+L',
                click() { mainWin.webContents.send('item:clear') }
            },
            {
                label: 'To Exit in Other Window Press',
                accelerator: 'Esc',
                click(item, focusedWindow) { if (focusedWindow !== mainWin) { focusedWindow.close() } }
            },
            {
                label: 'Quit',
                accelerator: 'CommandOrControl+Q',
                click() { app.quit() }
            }
        ]
    }
]

if (process.platform == 'darwin')
    mainMenuTp.unshift({})

if (process.env.NODE_ENV !== 'production')
    mainMenuTp.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toogle Devtools',
                accelerator: 'CommandOrControl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools()
                }
            },
            { role: 'reload' }
        ]
    })