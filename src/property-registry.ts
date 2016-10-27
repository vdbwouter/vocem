import {LogLevel} from './output'
export type PropertyHandler = (message: string, level: LogLevel, value: any) => string

let properties = new Map<string, PropertyHandler>()
let hardcoded = [ 'destroy', 'keep', 'dateFormat' ]

/**
 * Registers the property handler with the given name
 */
export function register (name: string, handler: PropertyHandler) {
  if (propertyExists(name)) {
    throw new Error(`Property ${name} already exists`)
  }
  
  properties.set(name, handler)
}

/**
 * Deregisters every property in the argument list
 */
export function deregister (...names: string[]) {
  for (let name of names) {
    if (hardcoded.indexOf(name) >= 0) {
      throw new Error(`Property ${name} cannot be removed!`)
    }
    
    properties.delete(name)
  }
}

/**
 * Returns a property handler
 * Does nothing for hardcoded values
 */
export function getHandler (name: string) {
  if (!properties.has(name)) {
    throw new Error(`Property ${name} does not exist`)
  }

  return properties.get(name)
}

/**
 * Returns whether a property exists or has been removed
 */
export function propertyExists (name: string) {
  return properties.has(name) || isHardcodedProperty(name)
}

/**
 * Returns whether the property is hardcoded
 */
export function isHardcodedProperty (name: string) {
  return hardcoded.indexOf(name) >= 0
}

/**
 * For now, mostly here for testing.
 * Might get used in the future
 */
export function clearAll () {
  properties.clear()
}
