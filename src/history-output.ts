import * as path from 'path'
import * as fs from 'fs'
import * as moment from 'moment'
import {Output, Properties} from './output'
import file from './file-output'

/**
 * Opens an output which writes a history of log
 * files to the directory
 */
function history(directory: string): Output
/**
 * Opens an output with the properties which
 * writes a history of log files to the directory
 */
function history(directory: string, properties: Properties): Output
/**
 * Opens an output which writes a history of log
 * files to the directory.
 * 
 * Calls the callback once the file is opened or
 * an error is encountered
 */
function history(directory: string, callback: (err?: Error, output?: Output) => any): Output
/**
 * Opens an output with the properties which
 * writes a history of log files to the directory
 * 
 * Calls the callback once the file is opened or
 * an error is encountered
 */
function history(directory: string, properties: Properties, callback: (err?: Error, output?: Output) => any): Output

function history(
    directory: string,
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
  
  let format = 'YYYYMMDDHHmmss'

  if (properties.dateFormat != null) {
    if (typeof(properties.dateFormat) !== 'string') {
      let error = new Error('Property dateFormat must be of type string')

      theCallback(error)
      throw error
    }
    format = properties.dateFormat
  }

  let currentTime = moment().format(format)
  let fileName = path.join(directory, currentTime)

  let output = file(fileName, properties, (err, output) => {
    if (err) {
      theCallback(err)
    }

    if (properties.keep != null) {
      if (typeof(properties.keep) !== 'number') {
        theCallback(new Error('Property keep must be of type number'))
        return
      }

      fs.readdir(directory, (err, children) => {
        if (children.length >= properties.keep) {
          try {
            removeEarliest(directory, children, children.length - properties.keep)
          } catch (err) {
            theCallback(err)
            return
          }
          theCallback(undefined, output)
        } else {
          theCallback(undefined, output)
        }
      })
    } else {
      theCallback(undefined, output)
    }
  })

  return output
}

export default history

/**
 * Removes the earliest n children from the directory
 */
function removeEarliest(
    directory: string,
    children: string[],
    n: number
) {
  children.map(child => {
    return {
      child,
      mtime: fs.statSync(path.join(directory, child)).mtime
    }
  }).sort((a, b) =>
    a.mtime.getTime() - b.mtime.getTime()
   ).slice(0, n)
    .forEach(({child}) => {
      fs.unlinkSync(path.join(directory, child))
  })
}