import Log from '../helper/logHelper.js'
const log = Log.create()

import personsModel from '../models/personsModel.js'
import PersonsAggrJsonMediator from '../loadDatabase/personsAggrJsonMediator.js'
import StrHelper from '../helper/strHelper.js'

export default class PersonsAggr {

    getLivePointsJson(json) {
        return {
            "kind": json.kind,
            "kindAndStatus": json.kindAndStatus,
            "groupStatus": json.groupStatus,
            "engStatus": json.engStatus,
            "point": json.point
        }
    }

    start() {

        const mediator = new PersonsAggrJsonMediator()

        return new Promise((resolve, reject) => {
            personsModel.find({}) //'surname': 'Садзаглишвили'})
                .then(persons => {
                    let promises = []
                    let jsons = []
                    let idxLastJson = -1
                    persons.forEach(person => {

                        let onePersonsJsons = []

                        let caption = person.sitename
                        if (!caption) {
                            caption = `${person.surname} ${person.name} ${person.middlename}`.trim()
                        }

                        const superJson = {
                            'info': person,
                            'caption': caption,
                            'groupStatus': person.groupStatus,
                            'shortDescription': StrHelper.ellipseLongString(person.fullDescription, 400)
                        }

                        let engStatus = person.groupStatus
                        switch (person.groupStatus) {
                            case 'мученик':
                                engStatus = 'martyrs'
                                break;
                            case 'преподобный':
                                engStatus = 'reverends'
                                break;
                            case 'святой':
                                engStatus = 'holy'
                                break;
                            default:
                                log.error(`Неизвестный тип ${person.groupStatus}`)
                                break;
                        }

                        let birthJson = {}
                        let birthJsonToParse = ''
                        let livePoints = []

                        if (person.birth.placeCoord && person.birth.placeCoord.length > 1) {
                            let json = JSON.parse(JSON.stringify(superJson))
                            json.point = person.birth.placeCoord
                            json.kind = `birth`
                            json.kindAndStatus = `birth_${engStatus}`
                            json.engStatus = engStatus
                            json.startYear = person.birth.year
                            json.startCentury = person.birth.century
                            birthJson = json
                            birthJsonToParse = JSON.stringify(json)
                            livePoints.push(this.getLivePointsJson(json))
                            onePersonsJsons.push(json)
                        }
                        person.achievements.forEach(achiev => {
                            let json = JSON.parse(JSON.stringify(superJson))
                            json.point = achiev.placeCoord
                            if (json.point) {
                                json.kind = `achiev`
                                json.kindAndStatus = `achiev_${engStatus}`
                                json.startYear = achiev.start.year
                                json.startCentury = achiev.start.century
                                if (achiev.end) {
                                    json.endYear = achiev.end.year
                                    json.endCentury = achiev.end.century
                                }
                                if (json.startCentury) {
                                    onePersonsJsons.push(json)
                                }
                                livePoints.push(this.getLivePointsJson(json))
                            }
                        });

                        if (person.death.placeCoord && person.death.placeCoord.length > 0 && person.death.century) {
                            let json = JSON.parse(JSON.stringify(superJson))
                            json.point = person.death.placeCoord
                            json.kind = `death`
                            json.kindAndStatus = `death_${engStatus}`
                            json.startYear = person.death.year
                            json.startCentury = person.death.century
                            if (json.startYear) {
                                json.endYear = json.startYear
                            }
                            livePoints.push(this.getLivePointsJson(json))
                            onePersonsJsons.push(json)
                        }

                        let addJsons = []
                        let prevJson = {}
                        let json = {}
                        if (birthJson.startYear) {
                            for (let i = 1; i < onePersonsJsons.length; i++) {
                                let injectJson = {}
                                prevJson = onePersonsJsons[i - 1]
                                json = onePersonsJsons[i]

                                if (!prevJson.endYear) {
                                    prevJson.endYear = json.startYear - 1
                                } else {
                                    if (json.startYear - prevJson.endYear > 1) {
                                        injectJson = JSON.parse(birthJsonToParse)
                                        injectJson.startYear = prevJson.endYear
                                        injectJson.endYear = json.startYear - 1
                                        injectJson.kind = 'live'
                                        injectJson.kindAndStatus = `live_${birthJson.engStatus}`
                                        injectJson.livePoints = livePoints
                                        addJsons.push(injectJson)
                                    }
                                }
                            }
                        }
                        for (let i = 0; i < onePersonsJsons.length; i++) {
                            onePersonsJsons[i].livePoints = livePoints
                            jsons.push(onePersonsJsons[i])
                        }

                        addJsons.forEach(json => {
                            jsons.push(json)
                        })
                    });
                    log.info(`Количество святых после аггрегации: ${jsons.length}`)

                    jsons.forEach(json => {
                        // if (json.info.surname == 'Садзаглишвили') {
                        //     const printJson = {'kindAndStatus': json.kindAndStatus, 'startYear': json.startYear, 'endYear': json.endYear}
                        //     log.info(JSON.stringify(printJson))
                        // }
                        promises.push(mediator.addObjectToBase(json))
                    })

                    Promise.all(promises)
                        .then(res => {
                            resolve(res)
                        })
                })
                .catch(err => reject(err))

        })
    }

    free() {
        //   log.info('Free PersonsAggr')
    }
}
