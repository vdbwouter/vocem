import * as fs from 'fs'
import * as path from 'path'
import * as moment from 'moment'
import {hasModule} from './modules'
import {getLatestWriteStream, getDest} from './fs-data'
import {testCleanOutput, testOutputProperties} from './output'
import {Output} from '../lib/output'
import {WrappableObject} from '../lib/object-output'
import history from '../lib/history-output'

if (hasModule('moment')) {
  describe('history', () => {
    let output: Output
    let writeStream: fs.WriteStream
    let wrapped: WrappableObject
    
    beforeEach(() => {
      output = history('logs', err => {
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
      })!
    })

    it('outputs to a file', () => {
      testCleanOutput(output, wrapped)
    })

    it('closes the file', () => {
      output.destroy()

      expect(writeStream.end).toHaveBeenCalled()
    })

    it('applies the default format', () => {
      let dest = path.parse(getDest(writeStream))

      expect(dest.dir).toBe('logs')
      expect(moment(dest.name, 'YYYYMMDDHHmmss').isValid()).toBe(true)
    })

    it('applies a specified format', () => {
      const format = 'Mo YYYY, Do HH:mm:ss'
      let writeStream: fs.WriteStream
      let dest = {} as path.ParsedPath

      let output = history('logs', { dateFormat: format }, err => {
        writeStream = getLatestWriteStream()
        dest = path.parse(getDest(writeStream))
      })

      expect(dest.dir).toBe('logs')
      expect(moment(dest.name, format).isValid()).toBe(true)
    })

    describe('property keep', () => {
      let dirContents: string[]
      let err: Error | undefined
      let mtimes: Map<string, Date>

      beforeEach(() => {
        dirContents = []
        err = undefined
        mtimes = new Map<string, Date>()
        
        spyOn(fs, 'readdir').and.callFake((
            dir: string,
            callback: (err?: Error, contents?: string[]) => any
          ) => {
          callback(err, dirContents)
        })
        
        spyOn(fs, 'statSync').and.callFake((file: string) => {
          return { mtime: mtimes.get(file) }
        })
        
        spyOn(fs, 'unlinkSync')
      })
      
      it('only keeps the latest n', () => {
        dirContents = ['7','6','5','4','3','2','1']
        for (let i = 0; i < dirContents.length; i++) {
          let logPath = path.join('logs', dirContents[i])
          let mtime = new Date((dirContents.length - i) * 1000)
        
          mtimes.set(logPath, mtime)
        }
        
        let output = history('logs', { keep: 5 })
        
        expect(fs.unlinkSync).toHaveBeenCalledWith('logs/1')
        expect(fs.unlinkSync).toHaveBeenCalledWith('logs/2')
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
          let output = history('logs', props)
          
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
}