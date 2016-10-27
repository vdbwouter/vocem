import * as util from 'util'
import {Output, Properties, PropertyFilter, LogMethod, LogLevel} from './output'
import {getHandler, propertyExists, isHardcodedProperty} from './property-registry'

/**
 * An object that is wrappable to become an output
 */
export interface WrappableObject {
  info: LogMethod,
  warn: LogMethod,
  error: LogMethod,
  destroy?: () => any
}

class ObjectOutput implements Output {
  private propertyOrder: string[] = []
  private properties: Properties = {}

  private methodInfo: LogMethod
  private methodWarn: LogMethod
  private methodError: LogMethod
  private methodDestroy?: () => any

  public constructor(wrappable: WrappableObject, properties: Properties) {
    this.methodInfo = wrappable.info
    this.methodWarn = wrappable.warn
    this.methodError = wrappable.error
    this.methodDestroy = wrappable.destroy

    this.prop(properties)
  }

  /**
   * Outputs the message with level info to the output. message will
   * be treated as a format string for util::format.
   */
  public info(message: string, ...params: any[]) {
    return this.write('info', this.methodInfo, message, ...params)
  }

  /**
   * Outputs the message with level warn to the output. message will
   * be treated as a format string for util::format.
   */
  public warn(message: string, ...params: any[]) {
    return this.write('warn', this.methodWarn, message, ...params)
  }

  /**
   * Outputs the message with level error to the output. message will
   * be treated as a format string for util::format.
   */
  public error(message: string, ...params: any[]) {
    return this.write('error', this.methodError, message, ...params)
  }

  /**
   * Destroys the output.
   */
  public destroy() {
    if (this.properties['destroy'] !== false && this.methodDestroy != null) {
      this.methodDestroy()
    }
  }

  /**
   * Add the properties to the output properties.
   */
  public prop(properties: Properties) {
    if (properties == null) return this

    for (let property in properties) {
      if (!propertyExists(property)) {
        throw new Error(`Property ${property} does not exist!`)
      }

      if (this.properties.hasOwnProperty(property)) {
        let index = this.propertyOrder.indexOf(property)

        this.propertyOrder.splice(index, 1)
      }

      this.propertyOrder.unshift(property)
      this.properties[property] = properties[property]
    }

    return this
  }

  /**
   * Remove every property from the list of output properties. A filter can be
   * passed instead of a property name. In that case, all the properties that pass
   * the filter are removed.
   */
  public unprop(...listToRemove: (string | PropertyFilter)[]) {
    for (let toRemove of listToRemove) {
      if (isString(toRemove)) {
        this.removeProperty(toRemove)
      } else {
        let filter = toRemove
        this.propertyOrder.filter(property =>
            filter(property, this.properties[property])
          ).map(property =>
            this.removeProperty(property)
          )
      }
    }

    return this
  }

  /**
   * Does the actual writing for the output
   */
  private write(level: LogLevel, method: LogMethod, message: string, ...params: any[]) {
    let processedMessage = util.format(message, ...params)
    let propertiesToRemove: string[] = []

    let finalMessage = this.propertyOrder.reduce((message, property) => {
      if (!propertyExists(property)) {
        propertiesToRemove.push(property)
        return message
      }

      if (isHardcodedProperty(property)) {
        return message
      }

      let handler = getHandler(property)

      return handler(message, level, this.properties[property])
    }, processedMessage)

    method(finalMessage)

    propertiesToRemove.forEach(property => this.removeProperty(property))
    return this
  }

  /**
   * Removes a single property from the output
   */
  private removeProperty(propertyName: string) {
    let index = this.propertyOrder.indexOf(propertyName)

    this.propertyOrder.splice(index,1)
    delete this.properties[propertyName]
  }
}

/**
 * Returns whether a parameter is a string
 */
function isString<T>(val: string | T): val is string {
  return typeof(val) === 'string'
}

/**
 * Creates an output which writes to an object. An
 * alternative to just passing the object
 */
function object(wrappable: WrappableObject): Output
/**
 * Creates an output which writes to an object and
 * applies the properties
 */
function object(wrappable: WrappableObject, properties: Properties): Output

function object(wrappable: WrappableObject, properties?: Properties): Output {
  let theProperties: Properties = {}

  if (properties != null) {
    theProperties = properties
  }

  return new ObjectOutput(wrappable, theProperties)
}

export default object
