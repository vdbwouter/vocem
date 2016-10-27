export type LogLevel = "info" | "warn" | "error"
export type LogMethod = (message: string) => any
export type PropertyFilter = (key: string, value: any) => boolean

/**
 * The properties for an output to use
 */
export interface Properties {
  dateFormat?: string
  keep?: number
  destroy?: boolean
  [index: string]: any
}

/**
 * An object to which can be written
 */
export interface Output {
  /**
   * Outputs the message with level info to the output. message will
   * be treated as a format string for util::format.
   */
  info(message: string, ...params: any[]): this

  /**
   * Outputs the message with level warn to the output. message will
   * be treated as a format string for util::format.
   */
  warn(message: string, ...params: any[]): this

  /**
   * Outputs the message with level error to the output. message will
   * be treated as a format string for util::format.
   */
  error(message: string, ...params: any[]): this

  /**
   * Destroys the output.
   */
  destroy(): any

  /**
   * Add the properties to the output properties.
   */
  prop(properties: Properties): this

  /**
   * Remove every property from the list of output properties. A filter
   * can be passed instead of a property name. In that case, all the
   * properties that pass the filter are removed.
   */
  unprop(...listToRemove: (string | PropertyFilter)[]): this
}