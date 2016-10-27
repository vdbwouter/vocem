import * as fs from 'fs'
import * as path from 'path'
import {Properties, Output} from './output'
import object, {WrappableObject} from './object-output'

class FileOutput implements WrappableObject {
  private shouldDestroy = false
  private destroyed = false
  private stream: fs.WriteStream
  private messageQueue: string[] = []

  public open = (fileName: string) => {
    if (this.stream != null) throw new Error('FileOutput cannot be reused!')

    this.stream = fs.createWriteStream(fileName)

    while (this.messageQueue.length > 0) {
      let message = this.messageQueue.shift()
      this.write(message!)
    }

    if (this.shouldDestroy) {
      this.destroy()
    }
  }

  public info = (message: string) => {
    this.write(message)
  }

  public warn = (message: string) => {
    this.write(message)
  }

  public error = (message: string) => {
    this.write(message)
  }

  public destroy = () => {
    this.assertNotDestroyed()

    if (this.stream == null) {
      this.shouldDestroy = true
      return
    }

    this.stream.end()
    this.destroyed = true
  }

  private write = (message: string) => {
    this.assertNotDestroyed()

    if (this.shouldDestroy) {
      throw new Error('Stream is about to be closed')
    }

    if (this.stream == null) {
      this.messageQueue.push(message)
      return
    }

    let ok = this.stream.write(message)

    if (!ok) {
      this.stream.once('drain', () => this.write(message))
    }
  }

  private assertNotDestroyed = () => {
    if (this.destroyed) {
      throw new Error('Stream has already been closed')
    }
  }
}

function ensureExists(
    dir: string,
    callback: (err?: NodeJS.ErrnoException) => any
) {
  fs.stat(dir, err => {
    if (!err) {
      callback(undefined)
      return
    }
    if (err.code !== 'ENOENT') {
      callback(err)
      return
    }

    let parentDir = path.dirname(dir)
    ensureExists(parentDir, err => {
      if (err) {
        callback(err)
        return
      }

      fs.mkdir(dir, callback)
    })
  })
}

/**
 * Opens an output to the file
 */
function file(fileName: string): Output
/**
 * Opens an output to the file with the properties
 */
function file(fileName: string, properties: Properties): Output
/**
 * Opens an output to the file
 * 
 * Calls the callback once the file is opened or
 * an error is encountered
 */
function file(fileName: string, callback: (err?: Error, output?: Output) => any): Output
/**
 * Opens an output to the file with the properties
 * 
 * Calls the callback once the file is opened or
 * an error is encountered
 */
function file(fileName: string, properties: Properties, callback: (err?: Error, output?: Output) => any): Output

function file (
    fileName: string,
    propertiesOrCallback?: Properties | ((err?: Error, output?: Output) => any),
    callback?: (err?: Error, output?: Output) => any
): Output {
  let theCallback = (err?: Error, out?: Output) => {
    if (err) throw err
  }
  let properties: Properties = {}

  if (propertiesOrCallback != null) {
    if (typeof(propertiesOrCallback) === 'object') {
      properties = propertiesOrCallback
    } else {
      theCallback = propertiesOrCallback
    }
  }
  if (callback != null && typeof(propertiesOrCallback) === 'object') {
    theCallback = callback
  }

  let wrapped = new FileOutput()
  let output = object(wrapped, properties)

  ensureExists(path.dirname(fileName), err => {
    if (err) {
      theCallback(err)
      return
    }

    try {
      wrapped.open(fileName)
    } catch (err) {
      theCallback(err)
      return
    }

    theCallback(undefined, output)
  })

  return output
}

export default file