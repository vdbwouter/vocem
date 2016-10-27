import {testCleanOutput, testOutputProperties} from './output'
import {register, deregister, getHandler, clearAll as clearAllProperties} from '../lib/property-registry'

describe('registry::register', () => {
  it('registers a new property', () => {
    let spy = jasmine.createSpy('handler')

    register('foo', spy)

    expect(getHandler('foo')).toBe(spy)
  })

  afterEach(() => {
    clearAllProperties()
  })
})

describe('registry::deregister', () => {
  it('removes a property', () => {
    let spy = jasmine.createSpy('handler')

    register('foo', spy)
    deregister('foo')

    expect(() => getHandler('foo')).toThrow()
  })

  describe('throws an error when the property', () => {
    let irremovables = [ 'destroy', 'keep', 'dateFormat' ]
    
    for (let property of irremovables) {
      it(`is ${property}`, () => {
        expect(() => deregister(property)).toThrow()
      })
    }
  })

  afterEach(() => {
    clearAllProperties()
  })
})
