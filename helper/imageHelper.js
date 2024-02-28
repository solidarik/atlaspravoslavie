import axios from 'axios'
import fs from 'fs'
import FileHelper from '../helper/fileHelper.js'
import StrHelper from './strHelper.js'

export default class ImageHelper {
    static resizeImage(url, fixWidth, callback) {
        var sourceImage = new Image()

        sourceImage.onload = function () {
            // Create a canvas with the desired dimensions
            var canvas = document.createElement('canvas')

            let imgWidth = this.width
            let aspectRatio = Math.round(imgWidth / fixWidth)

            let imgHeight = this.height
            let fixHeight = Math.round(imgHeight / aspectRatio)

            canvas.width = fixWidth
            canvas.height = fixHeight

            // Scale and draw the source image to the canvas
            let ctx = canvas.getContext('2d')
            ctx.globalAlpha = 0.6
            ctx.drawImage(sourceImage, 0, 0, fixWidth, fixHeight)

            // Convert the canvas to a data URL in PNG format
            if (callback) callback(canvas)
        }

        return (sourceImage.src = url)
    }

    /**
     * Сохранение изображения
     * @param {string} url - адрес изображения
     * @param {str} folder - путь до папки
     * @param {boolean} isRenew - пересоздавать ли файл
     */
    static loadImageToFileByUrl(url, folder, isRenew = false) {
        // get last delim from url, keep only file name
        return new Promise((resolve, reject) => {
            try {
                let fileUrl = StrHelper.getTwoStringByLastDelim(url, '/')[1]
                let fileName = fileUrl
                let fileExt = ''
                if (fileUrl.indexOf('.') > -1) {
                    const fileStrings = StrHelper.getTwoStringByLastDelim(
                        fileUrl,
                        '.'
                    )
                    fileName = fileStrings[0]
                    fileExt = fileStrings[1]
                }
                fileExt = fileExt || 'png'
                fileName = StrHelper.keepOnlyAllow(fileName)
                const filePath = FileHelper.composePath(
                    folder,
                    fileName + '.' + fileExt
                )
                const relPath = FileHelper.relativePath(
                    FileHelper.composePath(),
                    filePath
                )
                if (FileHelper.isFileExists(filePath)) {
                    if (!isRenew) {
                        resolve({
                            status: 'Continue, File is exist',
                            url: relPath,
                        })
                        return
                    } else {
                        console.log('Delete file and try resave it')
                        FileHelper.deleteFile(filePath)
                    }
                }

                axios({
                    method: 'GET',
                    url: url,
                    responseType: 'stream',
                    timeout: 1000,
                })
                    .then((response) => {
                        const w = response.data.pipe(
                            fs.createWriteStream(filePath)
                        )
                        w.on('finish', () => {
                            resolve({ status: 'Saved', url: relPath })
                        })
                        w.on('error', (err) => {
                            reject({ status: 'Error', reason: err })
                        })
                    })
                    .catch((err) => {
                        reject({
                            status: 'Error',
                            reason: `Error in axios catch ${err}`,
                        })
                    })
            } catch (error) {
                reject({ status: 'Error', reason: error })
            }
        })
    }

    static loadImageToFile(url, fileName, renew = false) {
        let res = { saved: false, warning: null, error: null, url: url }

        return new Promise((resolve) => {
            try {
                // const re = /(?:\.([^.]+))?$/
                // const ext = re.exec(url)[1]
                // let selectedExt = 'png'

                // if (ext) {
                //   const acceptedExt = ['png', 'jpg', 'gif']
                //   for (let i = 0; i < acceptedExt.length; i++) {
                //     if (ext.indexOf(acceptedExt[i])) {
                //       selectedExt = acceptedExt[i]
                //       break
                //     }
                //   }
                // }
                // fileName += '.' + selectedExt

                if (FileHelper.isFileExists(fileName)) {
                    if (!renew) {
                        res.warning = 'File is exist'
                        resolve(res)
                        return
                    } else {
                        console.log('delete file')
                        FileHelper.deleteFile(fileName)
                    }
                }

                console.log(`before get file`)

                axios({
                    method: 'GET',
                    url: url,
                    responseType: 'stream',
                    timeout: 1000,
                })
                    .then((response) => {
                        const w = response.data.pipe(
                            fs.createWriteStream(fileName)
                        )
                        w.on('finish', () => {
                            res.saved = true
                            resolve(res)
                        })
                    })
                    .catch((err) => {
                        res.error = `Error in axios catch ${err}`
                        resolve(res)
                    })
            } catch (err) {
                console.log(`try catch err: ${err}`)
                res.error = `Program error in loadImageToFile from ${url}: ${err}`
                console.log(res.error)
                resolve(res)
            }
        })
    }
}
