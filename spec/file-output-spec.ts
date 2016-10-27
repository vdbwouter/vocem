import * as fs from 'fs'
import {getLatestWriteStream} from './fs-data'
import {testCleanOutput, testOutputProperties} from './output'
import file from '../lib/file-output'
import {Output} from '../lib/output'
import {WrappableObject} from '../lib/object-output'

describe('file', () => {
  let output: Output
  let writeStream: fs.WriteStream
  let wrapped: WrappableObject

  beforeEach(() => {
    output = file('my-log-file.txt', err => {
      if (err) {
        throw err
      }

      writeStream = getLatestWriteStream()

      wrapped = {
        info: writeStream.write,
        warn: writeStream.write,
        error: writeStream.write,
        destroy: writeStream.end
      }
    })
  })

  it('outputs to a file', () => {
    testCleanOutput(output, wrapped)
  })

  it('closes the file', () => {
    output.destroy()

    expect(writeStream.end).toHaveBeenCalled()
  })

  it('creates the parent directory if necessary', () => {
    let spy = jasmine.createSpy('callback')

    let output = file('does/not/exist.txt', spy)

    expect(spy).toHaveBeenCalledWith(undefined, output)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  describe('calls the callback', () => {
    it('once', () => {
      let spy = jasmine.createSpy('callback')
      let output = file('my-log-file.txt', spy)

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('with the output', () => {
      let spy = jasmine.createSpy('callback')
      let output = file('my-log-file.txt', spy)

      expect(spy).toHaveBeenCalledWith(undefined, output)
    })

    it('with the error', () => {
      let error: NodeJS.ErrnoException = new Error()
      error.code = 'EACCES'

      let fsStatSpy = fs.stat as jasmine.Spy
      fsStatSpy.and.callFake((fileName, callback) => {
        callback(error)
      })
      
      let spy = jasmine.createSpy('callback')
      let output = file('my-log-file.txt', spy)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(error)
    })
  })

  describe('method', () => {
    let methods = [ 'info', 'warn', 'error' ]
    for (let method of methods) {
      it(`${method} returns instance`, () => {
        let returnValue = output[method]('')
        expect(returnValue).toBe(output)
      })
    }
    it('prop returns instance', () => {
      let returnValue = output.prop({})
      expect(returnValue).toBe(output)
    })
    it('unprop returns instance', () => {
      let returnValue = output.unprop()
      expect(returnValue).toBe(output)
    })
  })

  describe('supports properties', () => {
    it('with prop', () => {
      testOutputProperties(props => {
        output.prop(props)
  
        return output
      }, wrapped)
    })
    
    it('with constructor', () => {
      let wrapped = {} as WrappableObject
      testOutputProperties(props => {
        let output = file('my_log_file.log', props)
        
        let writeStream = getLatestWriteStream()
        wrapped.info = writeStream.write
        wrapped.warn = writeStream.write
        wrapped.error = writeStream.write
        wrapped.destroy = () => writeStream.end()
        return output
      }, wrapped)
    })
  })
})