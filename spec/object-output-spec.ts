import {testCleanOutput, testOutputProperties, createStubOutput} from './output'
import {register, deregister} from '../lib/property-registry'
import object from '../lib/object-output'
import {Output} from '../lib/output'

describe('object', () => {
  let spy: Output
  let obj: Output

  beforeEach(() => {
    spy = createStubOutput()
    obj = object(spy)
  })

	it('wraps an object', () => {
    testCleanOutput(obj, spy)

    obj.destroy()
    expect(spy.destroy).toHaveBeenCalled()
	})
  
  describe('property', () => {
    describe('destroy', () => {
      for (let destroy of [false, true]) {
        it(`correctly applies ${destroy}`, () => {
          let spy = createStubOutput()
          let obj = object(spy, { destroy })

          obj.destroy()
          if (destroy) {
            expect(spy.destroy).toHaveBeenCalled()
          } else {
            expect(spy.destroy).not.toHaveBeenCalled()
          }
        })
      }
    })
  })

  describe('unprop', () => {
    beforeEach(() => {
      register('special', (message, level) => {
        return `[${level}] ${message}`
      })

      register('raw', (message, level, args) => {
        return `[${args}] ${message}`
      })
    })
    
    afterEach(() => {
      deregister('special', 'raw')
    })

    it('removes a property', () => {
      obj.prop({ special: true })
      obj.unprop('special')

      testCleanOutput(obj, spy)
    })

    it('can use a filter', () => {
      obj.prop({ destroy: false, special: true, raw: 'hello' })
      obj.unprop(key => key !== 'destroy' )

      testCleanOutput(obj, spy)

      obj.destroy()
      expect(spy.destroy).not.toHaveBeenCalled()
    })
  })

  describe('method', () => {
    let methods = [ 'info', 'warn', 'error' ]

    for (let method of methods) {
      it(`${method} returns instance`, () => {
        let returnValue = obj[method]('')

        expect(returnValue).toBe(obj)
      })

      it(`${method} removes a property when not available anymore`, () => {
        register('special', message => `[special] ${message}`)
        register('test', message => `[test] ${message}`)
        register('tests', message => `[tests] ${message}`)

        obj.prop({ special: true, test: true, tests: true })

        deregister('test')

        obj[method]('Hello')

        expect(spy[method]).toHaveBeenCalledWith('[special] [tests] Hello')

        deregister('special', 'tests')
      })
    }

    it('prop returns instance', () => {
      let returnValue = obj.prop({})

      expect(returnValue).toBe(obj)
    })

    it('unprop returns instance', () => {
      let returnValue = obj.unprop()

      expect(returnValue).toBe(obj)
    })
  })


  describe('supports properties', () => {
    it('with prop', () => {
      testOutputProperties(props => {
        obj.prop(props)
  
        return obj
      }, spy)
    })
    
    it('with constructor', () => {
      testOutputProperties(props => {
        return object(spy, props)
      }, spy)
    })
  })
})
