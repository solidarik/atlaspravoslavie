import FileHelper from '../helper/fileHelper.js'
import StrHelper from '../helper/strHelper.js'
import ImageHelper from '../helper/imageHelper.js'
import sharp from 'sharp'

export default class UrlStore {
    constructor(
        srcStoreFolder = 'store',
        dstStoreFolder = 'public/images/persons'
    ) {
        this.defaultExt = 'png'
        this.maxLengthFileName = 20
        this.srcStoreFolder = srcStoreFolder
        this.dstStoreFolder = dstStoreFolder
        this.imageParams = {
            original: { name: 'orig', width: 0 },
            middle: { name: 'middle', width: 400 },
            small: { name: 'small', width: 200 },
        }
    }

    getFileNameAndExtByUrl(url) {
        let fileUrl = StrHelper.getTwoStringByLastDelim(url, '/')[1]
        let fileName = fileUrl
        let fileExt = ''
        if (fileUrl.indexOf('.') > -1) {
            const fileStrings = StrHelper.getTwoStringByLastDelim(fileUrl, '.')
            fileName = fileStrings[0]
            fileExt = fileStrings[1]
        }
        fileExt = fileExt || this.defaultExt
        fileName = StrHelper.keepOnlyAllow(fileName)
        return [fileName, fileExt]
    }

    composeSourcePath(fileName, fileExt) {
        return FileHelper.composePath(
            this.srcStoreFolder,
            fileName + '.' + fileExt
        )
    }

    composeDestPath(fileName, fileExt) {
        return FileHelper.composePath(
            this.dstStoreFolder,
            fileName + '.' + fileExt
        )
    }

    getFilePathIfExist(url) {
        const fileNameAndExt = this.getFileNameAndExtByUrl(url)
        let fileName = fileNameAndExt[0]
        const fileExt = fileNameAndExt[1]
        let filePath = this.composeSourcePath(fileName, fileExt)
        if (FileHelper.isFileExists(filePath)) {
            return filePath
        }
        fileName = StrHelper.ellipseLongString(
            fileName,
            this.maxLengthFileName,
            ''
        )
        filePath = this.composeSourcePath(fileName, fileExt)
        if (FileHelper.isFileExists(filePath)) {
            return filePath
        }
        return false
    }

    getDstFilePath(pageUrl, num, prefixName) {
        if (prefixName === 'blank') {
            return `${this.dstStoreFolder}/${pageUrl}_${num}`
        }
        return FileHelper.composePath(
            this.dstStoreFolder,
            `${pageUrl}_${num}_${prefixName}.${this.defaultExt}`
        )
    }

    async getImageFromUrl(url) {
        return new Promise(async (resolve, reject) => {
            let filePath = this.getFilePathIfExist(url)
            if (!filePath) {
                await ImageHelper.loadImageToFileByUrl(
                    url,
                    this.srcStoreFolder,
                    false
                )
            }
            //the second chance for read after load image
            filePath = this.getFilePathIfExist(url)
            if (!filePath) {
                reject(`Failed get image from url`)
            }
            resolve(filePath)
        })
    }

    saveImageToDstFile(pageUrl, sharpObj, imageParams, num) {
        const filePath = this.getDstFilePath(pageUrl, num, imageParams.name)
        if (FileHelper.isFileExists(filePath)) {
            return Promise.resolve(true)
        }
        let modifiedSharpObj = sharpObj
        if (imageParams.width > 0) {
            modifiedSharpObj.resize(imageParams.width)
        }
        return modifiedSharpObj.toFile(filePath)
    }

    async saveOneImage(url, pageUrl, num) {
        return new Promise(async (resolve, reject) => {
            try {
                const image = await this.getImageFromUrl(url)
                const sharpObj = sharp(image)
                const promises = [
                    this.saveImageToDstFile(
                        pageUrl,
                        sharpObj,
                        this.imageParams.original,
                        num
                    ),
                    this.saveImageToDstFile(
                        pageUrl,
                        sharpObj,
                        this.imageParams.small,
                        num
                    ),
                    this.saveImageToDstFile(
                        pageUrl,
                        sharpObj,
                        this.imageParams.middle,
                        num
                    ),
                ]
                await Promise.all(promises)
                resolve(this.getDstFilePath(pageUrl, num, 'blank'))
            } catch (err) {
                reject(err)
            }
        })
    }

    async saveImages(inputUrl, pageUrl) {
        return new Promise(async (resolve, reject) => {
            try {
                const urls = inputUrl
                    .split('http')
                    .map((item) => {
                        return `http${item}`
                    })
                    .slice(1)
                    .map((item) =>
                        item[item.length - 1] == ',' ? item.slice(0, -1) : item
                    )
                let promises = []
                for (let urlNum = 0; urlNum < urls.length; urlNum++) {
                    promises.push(
                        this.saveOneImage(urls[urlNum], pageUrl, urlNum)
                    )
                }
                const results = await Promise.allSettled(promises)

                let errors = []
                let newPaths = []
                results.forEach((res, num) => {
                    if (res.status == 'rejected') {
                        errors.push(`Ошибка загрузки ${urls[num]}`)
                    } else if (res.status == 'fulfilled') {
                        newPaths.push(res.value)
                    }
                })
                resolve({ errors: errors, newPaths: newPaths })
            } catch (err) {
                reject(err)
            }
        })
    }
}
