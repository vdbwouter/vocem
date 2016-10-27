import {testCleanOutput, testOutputProperties, createStubOutput} from './output'
import logger from '../lib/logger'

describe('logger', () => {
  let output, outputSpies

  beforeEach(() => {
    outputSpies = []
    for (let i = 0; i < 3; i++) {
      let outputSpy = createStubOutput()
      outputSpies.push(outputSpy)
    }

    output = logger(...outputSpies)
  })

	it('creates a output instance', () => {
    testCleanOutput(output, ...outputSpies)
	})

  describe('method', () => {
    let methods = [ 'info', 'warn', 'error' ]

    for (let method of methods) {
      it(`${method} returns instance`, () => {
        expect(output[method]('')).toBe(output)
      })
    }

    it('prop returns instance', () => {
      expect(output.prop({})).toBe(output)
    })

    it('unprop returns instance', () => {
      expect(output.unprop()).toBe(output)
    })

    it('add returns instance', () => {
      expect(output.add(...outputSpies)).toBe(output)
    })

    it('remove returns instance', () => {
      expect(output.remove(() => false)).toBe(output)
    })

    it('outputs returns instance', () => {
      expect(output.outputs(() => {})).toBe(output)
    })
  })
})
