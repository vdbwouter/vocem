import {Output, Properties, PropertyFilter} from './output'
import object, {WrappableObject} from './object-output'

/**
 * An object which the logger can write to
 */
export type Writable = WrappableObject | Output

export class Logger implements Output {
  private loggerOutputs: Output[]

  public constructor(...outputs: Writable[]) {
    this.loggerOutputs = []

    this.add(...outputs)
  }

  /**
   * Outputs the message with level info to the outputs. message will
   * be treated as a format string for util::format.
   */
  public info(message: string, ...params: any[]) {
    return this.write('info', message, ...params)
  }

  /**
   * Outputs the message with level warn to the outputs. message will
   * be treated as a format string for util::format.
   */
  public warn(message: string, ...params: any[]) {
    return this.write('warn', message, ...params)
  }

  /**
   * Outputs the message with level error to the outputs. message will
   * be treated as a format string for util::format.
   */
  public error(message: string, ...params: any[]) {
    return this.write('error', message, ...params)
  }

  /**
   * Destroys every output
   */
  public destroy() {
    this.outputs(out => out.destroy())
  }

  /**
   * Adds properties to every output
   */
  public prop(properties: Properties) {
    return this.outputs(out => out.prop(properties))
  }

  /**
   * Removes properties from every output
   */
  public unprop(...listToRemove: (string | PropertyFilter)[]) {
    return this.outputs(out => out.unprop(...listToRemove))
  }

  /**
   * Iterates over every output with the given function
   */
  public outputs(iter: (out: Output) => any) {
    this.loggerOutputs.forEach(out => iter(out))
    return this
  }

  /**
   * Adds all the outputs to the logger
   */
  public add(...outputs: Writable[]) {
    outputs.forEach(out => {
      if (out == null) throw new Error('Invalid output: Must be non-null')
      
      if (isOutput(out)) {
        this.loggerOutputs.push(out)
      } else {
        this.loggerOutputs.push(object(out))
      }

    })

    return this
  }

  /**
   * Removes all outputs that do pass the filter
   */
  public remove(...filters: ((out: Output) => boolean)[]) {
    this.loggerOutputs = this.loggerOutputs.filter(output =>
        filters.some(filter => !filter(output))
      )
    return this
  }

  /**
   * Writes to the output with the given level, message and params
   */
  private write(level: string, message: string, ...params: any[]) {
    return this.outputs(out => out[level](message, ...params))
  }
}

function isOutput(out: Writable): out is Output {
  return (out as Output).prop != null
}

/**
 * Returns a new logger which outputs to the given outputs
 */
export default function (...outputs: Writable[]): Logger {
  return new Logger(...outputs)
}