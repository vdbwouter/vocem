import {register, deregister} from '../lib/property-registry'
import {Output, Properties} from '../lib/output'
import {WrappableObject} from '../lib/object-output'

export function createStubOutput() {
  return jasmine.createSpyObj<Output>('output', ['info', 'warn', 'error', 'destroy', 'prop', 'unprop' ])
}

export function testOutputProperties(
    getWithProperties: (properties: Properties) => any,
    ...wrappedObjs: WrappableObject[]
  ) {
  register('custom', function (message) {
    return 'success/' + message
  })

  register('raw', function (message,level,args) {
    return level + '/' + message + '/' + args
  })

  let output = getWithProperties({ custom: true, raw: 'raw' })

  output.info('Hello!')
  output.error('Oh no!')
  output.warn("It's a trap!")
  
  wrappedObjs.forEach(wrappedObj => {
    expect(wrappedObj.info).toHaveBeenCalledWith('success/info/Hello!/raw')
    expect(wrappedObj.error).toHaveBeenCalledWith('success/error/Oh no!/raw')
    expect(wrappedObj.warn).toHaveBeenCalledWith("success/warn/It's a trap!/raw")
  })

  deregister('custom', 'raw')
  
  output.info('Hello!')
  output.error('Oh no!')
  output.warn("It's a trap!")

  wrappedObjs.forEach(wrappedObj => {
    expect(wrappedObj.info).toHaveBeenCalledWith('Hello!')
    expect(wrappedObj.error).toHaveBeenCalledWith('Oh no!')
    expect(wrappedObj.warn).toHaveBeenCalledWith("It's a trap!")
  })
}

export function testCleanOutput(
    output: Output,
    ...wrappedObjs: WrappableObject[]
  ) {
  output.info('Hello!')
  output.error('Oh no!')
  output.warn("It's a trap!")

  wrappedObjs.forEach(wrappedObj => {
    expect(wrappedObj.info).toHaveBeenCalledWith('Hello!')
    expect(wrappedObj.error).toHaveBeenCalledWith('Oh no!')
    expect(wrappedObj.warn).toHaveBeenCalledWith("It's a trap!")
  })
}
