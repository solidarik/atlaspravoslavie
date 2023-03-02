import GeoHelper from '../helper/geoHelper.js'
import assert from 'assert'

describe('test getCoordsFromHumanCoords', () => {
  it('simple coords from human coords', () => {
    let results = GeoHelper.getCoordsFromHumanCoords('55°45′13″ с. ш. 37°37′11″ в. д.')

    assert.strictEqual(results[0], 37.619722)
    assert.strictEqual(results[1], 55.753611)
  })

  it('coords without minutes', () => {
    let result = GeoHelper.getCoordsFromHumanCoords('57° с. ш. 41° в. д.')

    assert.strictEqual(result[0], 41)
    assert.strictEqual(result[1], 57)
  })

  it('coords with single quote', () => {
    let result = GeoHelper.getCoordsFromHumanCoords('35°25\' с.ш. 23°38\' в.д.')

    assert.strictEqual(result[0], 23.633333)
    assert.strictEqual(result[1], 35.416667)
  })
})