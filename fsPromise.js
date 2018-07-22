const fs = require('fs')

const fsPromise = {
  fs: fs,
  createReadStream: file => {
    return fs.createReadStream(file)
  },
  createWriteStream: (file, object) => {
    return fs.createWriteStream(file, object)
  },
  mkdir: path => {
    return new Promise((resolve, reject) => {
      fs.mkdir(path, (err) => {
        if (!err)
          resolve('success')
        else
          reject(err)
      })
    })
  },
  readdir: path => {
    return new Promise((resolve, reject) => {
      fs.readdir(path, (err, paths) => {
        if (!err)
          resolve(paths)
        else
          reject(err)
      })
    })
  },
  readFile: file => {
    return new Promise((resolve, reject) => {
      fs.readFile(file, (err, contents) => {
        if (!err)
          resolve(contents)
        else
          reject(err)
      })
    })
  },
  rmdir: path => {
    return new Promise((resolve, reject) => {
      fs.rmdir(path, err => {
        if (!err)
          resolve(`Deleted Path ${path}`)
        else
          reject(err)
      })
    })
  },
  rmfullDir: path => {
    return new Promise(async (resolve, reject) => {
      try {
        let files = await fsPromise.readdir(path)
        let subPaths = [], fls = []
        for (let file of files) {
          let isFile = await fsPromise.stat(path + '/' + file)
          if (isFile.isFile()) {
            await fsPromise.unlink(path + '/' + file)
            fls.push(file)
          }
          else {
            let x = await fsPromise.rmfullDir(path + '/' + file)
            subPaths.push(x)
          }
        }
        await fsPromise.rmdir(path)
        let deleted = {
          principalPath: path,
          subPaths,
          files: fls
        }
        resolve(deleted)
      } catch (err) {
        reject({ err, path })
      }
    })
  },
  stat: path => {
    return new Promise((resolve, reject) => {
      fs.stat(path, (err, stat) => {
        if (!err)
          resolve(stat)
        else
          reject(err)
      })
    })
  },
  unlink: file => {
    return new Promise((resolve, reject) => {
      fs.unlink(file, err => {
        let ret = {
          deleted: null,
          file
        }
        if (!err) {
          ret.deleted = true
          resolve(ret)
        }
        else {
          ret.deleted = false
          ret.err = err
          reject(ret)
        }
      })
    })
  },
  watchFile: fs.watchFile,
  watch: fs.watch,
  writeFile: (fileName, data) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(fileName, data, err => {
        if (!err)
          resolve(`${fileName} was Save`)
        else
          reject(err)
      })
    })
  }
}
module.exports = fsPromise