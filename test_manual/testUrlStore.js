import UrlStore from '../loadDatabase/urlStore.js'

const urlStore = new UrlStore()

const testUrl =
    'https://azbyka.ru/days/storage/images/icons-of-saints/4159/p1ard7ohoqeuf1hgufeslakkd3.pnghttps://azbyka.ru/days/storage/images/icons-of-saints/4159/p1ard6tesa1cdcuj1n5cj5g1cm26.pnghttps://azbyka.ru/days/storage/images/icons-of-saints/4159/p1ard6tes91m1210hs1r2r1r471dtv4.pnghttps://azbyka.ru/days/storage/images/icons-of-saints/4159/p1ard7249deu01d8t47n79lsdt3.pnghttps://azbyka.ru/days/storage/images/icons-of-saints/4159/p1ard6tes8i3tn6h1nps119s1r3c3.png'
// const testUrl =
//     'https://upload.wikimedia.org/wikipedia/commons/9/9a/Davit_Agmashenebeli.jpg'
try {
    const results = await urlStore.saveImages(testUrl, 'ivanov_ivan_ivanovich')
    if (results.errors.length) {
        console.log(`errors: ${results.errors.join('; ')}`)
    }
    if (results.newPaths.length) {
        console.log(`newPaths: ${results.newPaths.join('; ')}`)
    }
} catch (err) {
    console.log(`Error: ${err}`)
}
