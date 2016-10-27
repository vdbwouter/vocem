import proxyquire = require('proxyquire')
import {hasModule} from './modules'
import {createStubOutput} from './output'
import {clearAll as clearAllProperties} from '../lib/property-registry'

describe('vocem', () => {
  let vocem

  beforeEach(() => {
    vocem.__reinit()
  })

  if (hasModule('chalk')) {
    describe('with chalk', () => {
      let chalk

      beforeAll(() => {
        vocem = require('..')
        chalk = require('chalk')
      })

      describe('transformer color', () => {
        it('exists', () => {
          let spy = createStubOutput()

          expect(() => vocem.object(spy, { color: true })).not.toThrow()
        })

        it('applies correctly by default', () => {
          let spy = createStubOutput()
          let out = vocem.object(spy, { color: true })

          out.info('Hello, World!')
          out.warn('Hello, World!')
          out.error('Hello, World!')

          expect(spy.info).toHaveBeenCalledWith('Hello, World!')
          expect(spy.warn).toHaveBeenCalledWith(chalk.yellow('Hello, World!'))
          expect(spy.error).toHaveBeenCalledWith(chalk.red('Hello, World!'))
        })

        it('applies correctly custom values', () => {
          let spy = createStubOutput()
          let out = vocem.object(spy, {
            color: {
              info: chalk.underline,
              warn: chalk.bold,
              error: chalk.inverse
            }
          })

          out.info('Hello, World!')
          out.warn('Hello, World!')
          out.error('Hello, World!')

          expect(spy.info).toHaveBeenCalledWith(chalk.underline('Hello, World!'))
          expect(spy.warn).toHaveBeenCalledWith(chalk.bold('Hello, World!'))
          expect(spy.error).toHaveBeenCalledWith(chalk.inverse('Hello, World!'))
        })
      })
    })
  }

  if (hasModule('moment')) {
    describe('with moment', () => {
      beforeAll(() => {
        vocem = require('..')
      })
      
      describe('transformer date', () => {
        it('exists', () => {
          let spy = createStubOutput()

          expect(() => vocem.object(spy, { date: true })).not.toThrow()
        })

        it('applies correctly by default', () => {
          let spy = createStubOutput()
          let out = vocem.object(spy, { date: true })

          out.info('Hello, World!')
          out.warn('Hello, World!')
          out.error('Hello, World!')

          expect((spy.info as jasmine.Spy).calls.mostRecent().args[0]).toMatch(/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] Hello, World!$/)
          expect((spy.warn as jasmine.Spy).calls.mostRecent().args[0]).toMatch(/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] Hello, World!$/)
          expect((spy.error as jasmine.Spy).calls.mostRecent().args[0]).toMatch(/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] Hello, World!$/)
        })

        it('applies correctly custom values', () => {
          let spy = createStubOutput()
          let out = vocem.object(spy, { date: 'HH:mm:ss' })

          out.info('Hello, World!')
          out.warn('Hello, World!')
          out.error('Hello, World!')

          expect((spy.info as jasmine.Spy).calls.mostRecent().args[0]).toMatch(/^\[\d{2}:\d{2}:\d{2}\] Hello, World!$/)
          expect((spy.warn as jasmine.Spy).calls.mostRecent().args[0]).toMatch(/^\[\d{2}:\d{2}:\d{2}\] Hello, World!$/)
          expect((spy.error as jasmine.Spy).calls.mostRecent().args[0]).toMatch(/^\[\d{2}:\d{2}:\d{2}\] Hello, World!$/)
        })
      })
    })
  }

  describe('transformer level', () => {
    beforeAll(() => {
      vocem = require('..')
    })

    it('exists', () => {
      let spy = createStubOutput()

      expect(() => vocem.object(spy, { level: true })).not.toThrow()
    })

    it('outputs the current logging level', () => {
      let spy = createStubOutput()
      let out = vocem.object(spy, { level: true })

      out.info('Hello, World!')
      out.warn('Hello, World!')
      out.error('Hello, World!')

      expect(spy.info).toHaveBeenCalledWith('[info] Hello, World!')
      expect(spy.warn).toHaveBeenCalledWith('[warn] Hello, World!')
      expect(spy.error).toHaveBeenCalledWith('[error] Hello, World!')
    })
  })

  describe('without chalk', () => {    
    beforeAll(() => {
      vocem = proxyquire('..', { chalk: null })
    })

    it('does not have the color transformer', () => {
      let spy = createStubOutput()

      expect(() => vocem.object(spy, { color: true })).toThrow()
    })
  })

  describe('without moment', () => {
    beforeAll(() => {
      vocem = proxyquire('..', { moment: null })
    }) 

    it('does not have the date transformer', () => {
      let spy = createStubOutput()

      expect(() => vocem.object(spy, { date: true })).toThrow()
    })
  })

  afterEach(() => {
    clearAllProperties()
  })
})
