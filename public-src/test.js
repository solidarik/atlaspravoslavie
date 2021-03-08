const InetHelper = require('../helper/inetHelper')

function deleteAbbrev(place) {
    if (!place)
      return undefined

    place = place.replace(',', '').replace('"', '')
    //по сути это контекст return place.replace(/^\S{1,2}[.]+\s/g, '')
    return place
}



InetHelper.getLocalCoordsForName(deleteAbbrev('Фессалия'))
.then(res => {
    console.log(`result  ${res}`)
})
.catch( err => console.log(`error ${err}`))

