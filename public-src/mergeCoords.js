
import Log from '../helper/logHelper.js'
const log = Log.create('load.log')

import inetHelper from '../helper/inetHelper.js'
import FileHelper from '../helper/fileHelper.js'
import StrHelper from '../helper/strHelper.js'
import fs from 'fs'
import { exit } from 'process'

inetHelper.loadCoords();

(async function () {
    const filename = FileHelper.composePath('loadDatabase/dataSources/alexeyCoords.json')
    const allFileContents = fs.readFileSync(filename, 'utf8');
    const allLines = allFileContents.split(/\r?\n/)

    let savedCount = 0
    let savedWikiCount = 0
    let newRecordCount = 0
    console.log(`Length of lines: ${allLines.length}`)

    for (let i = 0; i < allLines.length; i++) {
        const line = allLines[i]
        const foundGroup = StrHelper.getSearchGroupsInRegexp('([^{}]*):.*({.*})', line)
        if (foundGroup && foundGroup.length > 0) {
            const coordName = StrHelper.removeByRegExp('"', foundGroup[0]).trim()
            const isNewCoord = !inetHelper.isExistCoord(coordName)

            const coordValue = JSON.parse(foundGroup[1])
            const isValidCoord = coordValue.lat > 0 && coordValue.lon > 0

            if (isNewCoord && isValidCoord) {
                inetHelper.addCoord(coordName, coordValue)
                savedCount += 1
            }
            else {
                if (isNewCoord && !isValidCoord) {
                    console.log(`Пытаемся найти: ${coordName}`)
                    let wikiCoord = await inetHelper.searchCoordsByName(coordName)
                    if (!wikiCoord) {
                        let altName = StrHelper.removeByRegExp('([(].*[)])', coordName).trim()
                        console.log(`Ищем альтернативное имя: ${altName}`)
                        wikiCoord = await inetHelper.searchCoordsByName(altName)
                        if (!wikiCoord) {
                            altName = StrHelper.getSearchGroupsInRegexp('([^,]+)', altName)
                            if (altName && altName.length > 0) {
                                altName = altName[0]
                                console.log(`Проверяем еще одно альтернативное имя: ${altName}`)
                                if (altName.length > 5) {
                                    wikiCoord = await inetHelper.searchCoordsByName(altName)
                                }
                            }
                        }
                    }

                    if (wikiCoord) {
                        inetHelper.addCoord(coordName, wikiCoord)
                        savedWikiCount += 1
                    } else {
                        console.log(`New record: ${coordName}`)
                        newRecordCount += 1
                    }
                }
            }
        }
    }

    console.log(`New Records Count: ${newRecordCount}`)

    if (savedCount || savedWikiCount) {
        console.log(`Count of saved coordinates: ${savedCount}`)
        console.log(`Count of saved wiki coordinates: ${savedWikiCount}`)
        console.log(inetHelper.coords['(45 лет) Евпатория, Крымская область, Украинская ССР, СССР'.toLowerCase()])
        inetHelper.saveCoords()
    }
})()

// setTimeout(() => , 2000)

