import history from './history-output'
import {Logger} from './logger'
import {register, clearAll as clearAllProperties} from './property-registry'

function requireOpt<T> (module: string): T | null {
  try {
    return require(module) as T
  } catch (err) {
    return null
  }
}

const moment = requireOpt<moment.MomentStatic>('moment')
const chalk = requireOpt<typeof Chalk>('chalk')

export {default as object} from './object-output'
export {default as file} from './file-output'
export {default as logger, Writable} from './logger'
export {register, deregister} from './property-registry'
export {Output} from './output'

/**
 * The type of a logger
 * 
 * The name LoggerType was used instead of Logger to avoid confusion
 * between the method logger() and the type Logger
 */
export type LoggerType = Logger

let historyOut: typeof history

if (moment != null) {
  historyOut = history
}

export { historyOut as history }

/**
 * WARNING: This function should not be called _unless_ you are testing this module
 */
export function __reinit() {
  clearAllProperties()

  register('level', (message, level, args) => {
    return `[${level}] ${message}`
  })

  if (moment != null) {
    register('date', (message, level, args) => {
      let format = 'YYYY-MM-DD HH:mm:ss'
      
      if (typeof(args) === 'string') {
        format = args
      }
      
      return `[${moment().format(format)}] ${message}`
    })
  }

  if (chalk != null) {
    register('color', (message, level, args) => {
      let formats = {
        info: message => message,
        warn: chalk.yellow,
        error: chalk.red
      }
      
      if (typeof(args) === 'object') {
        formats = args
      }
      
      return formats[level](message)
    })
  }
}

__reinit()

