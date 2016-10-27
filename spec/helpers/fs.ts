import * as fs from 'fs'
import * as path from 'path'
import {pushWriteStream, clearStreams} from '../fs-data'

beforeEach(() => {
  clearStreams()

  spyOn(fs, 'createWriteStream').and.callFake(fileName => {
    let stream = jasmine.createSpyObj('writeStream', ['write', 'once', 'end'])
    stream.write.and.returnValue(true)
    
    pushWriteStream(stream, fileName)

    return stream
  })

  spyOn(fs, 'mkdir').and.callFake((dir, callback) => {
    callback(undefined)
  })

  spyOn(fs, 'stat').and.callFake((fileName, callback) => {
    if (path.resolve('.') === path.resolve(fileName)) {
      callback(undefined)
    } else {
      let error: NodeJS.ErrnoException = new Error()
      error.code = 'ENOENT'

      callback(error)
    }
  })
})
