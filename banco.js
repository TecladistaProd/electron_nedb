const NeDB = require('nedb-promise')
const path = require('path')
const fs = require('./fsPromise')

module.exports = function(name){
    const db = new NeDB({
        filename: path.join('./', 'db', name+'.db'),
        timestampData: true,
        autoload: true
    })
    return {
        insert: async (...e) => {
            for(let item of e)
                await db.insert([item])
        },
        findAll: () => {
            return new Promise((resolve, reject) =>{
                db.find({})
                    .then(res => resolve(res))
                    .catch(err => reject(err))
            })
        },
        find: (e) => {
            return new Promise((resolve, reject)=> {
                if(typeof e === 'object'){
                    db.find(e)
                        .then(res => resolve(res))
                        .catch(err => console.log(err))
                }
                else {
                    db.findOne({_id: e})
                        .then(res => resolve(res))
                        .catch(err => console.log(err))
                }
            })
        },
        update: async (...e) => {
            for(let item of e){
                let _id = item._id
                delete item._id
                await db.update({_id}, item, {})
            }
        },
        remove: async (...e) => {
            for(let item of e){ 
                let _id
                if(typeof item === 'object'){
                    _id = item._id
                }
                else{
                    _id = item
                }
                await db.remove({ _id }, { multi: false })
            }
        },
        removeAll: async () => {
            await db.remove({}, {multi: true})
        },
        backup: async () => {
            let pasta = path.join('./', 'backup')
            let nm = name + '.bkp.' + new Date().toLocaleDateString().split(/\ /gi)[0] + '.db'
            if(!(await fs.stat(pasta)))
                await fs.mkdir(pasta)
            let data = await fs.readFile(path.join('./', 'db', name + '.db'))
            await fs.writeFile(path.join(pasta, nm), data)
        }
    }
}