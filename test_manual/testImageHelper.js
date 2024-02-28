import ImageHelper from '../helper/imageHelper.js'

const urls = [
    'https://artworld.ru/images/cms/content/catalog4/kamsky_kartina_maslom_letit_kruzhitsya_pervyj_sneg_sk201003.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Levitan_ozero28.JPG/1200px-Levitan_ozero28.JPG',
    'https://carakoom.com/data/wall/787/6492c4e2.jpg',
]

let urlPromises = urls.map((url) => {
    return ImageHelper.loadImageToFileByUrl(url, 'store', false)
})

Promise.allSettled(urlPromises).then((results) => {
    results.forEach((res, num) => {
        if (res.status == 'fulfilled') {
            console.log(
                `success ${res.status}: ${res.value.status} ${res.value.url}`
            )
        } else if (res.status == 'rejected') {
            console.log(
                `error ${res.reason}: ${res.value.status} ${res.value.url}`
            )
        }
    })
    console.log(results)
})
