import GeoHelper from '../helper/geoHelper.js'
import assert from 'assert'

describe('test getCoordsFromHumanCoords', () => {
  it('simple coords from human coords', () => {
    let results = GeoHelper.getCoordsFromHumanCoords('55°45′13″ с. ш. 37°37′11″ в. д.')

    assert.strictEqual(results[0], 37.619722)
    assert.strictEqual(results[1], 55.753611)
  })
})