import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

export default class FileHelper {
    static getRoot() {
        return path.resolve('./')
        // return path.dirname(fileURLToPath(import.meta.url))
    }

    static composePath(...paths) {
        return path.join(this.getRoot(), ...paths)
    }

    static relativePath(from, to) {
        return path.relative(this.composePath(from), this.composePath(to))
    }

    static clearDirectory(dirPath) {
        try {
            try {
                const stats = fs.statSync(dirPath)
            } catch (error) {
                fs.mkdirSync(dirPath, { recursive: true })
                return true
            }

            fs.readdirSync(dirPath).forEach((file) => {
                fs.unlink(path.join(dirPath, file), (err) => {
                    if (err) throw err
                })
            })
        } catch (error) {
            throw Error(`Не получилось создать директорию ${dirPath}: ${error}`)
        }
    }

    static getFileExt(path) {
        return path.slice((Math.max(0, path.lastIndexOf('.')) || Infinity) + 1)
    }

    static isDirectory(path) {
        var stat = fs.lstatSync(path)
        return stat.isDirectory()
    }

    static isFileExists(path) {
        return fs.existsSync(path)
    }

    static deleteFile(path) {
        return fs.unlinkSync(path)
    }

    static getFileNameFromPath(filePath) {
        return path.basename(filePath)
    }

    static getJsonFromFile(filePath) {
        let obj = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        return obj
    }

    static textJson(json) {
        return JSON.stringify(json, null, 4)
    }

    static saveJsonToFileSync(json, filePath) {
        fs.writeFileSync(filePath, this.textJson(json), {
            encoding: 'UTF8',
        })
    }

    static getFilesFromDir(dataDir, fileType = '.json') {
        let set = new Set()
        fs.readdirSync(dataDir).forEach((fileName) => {
            let filePath = path.join(dataDir, fileName)
            if (fileType === path.extname(filePath)) {
                set.add(filePath)
            }
        })
        return set
    }
}
