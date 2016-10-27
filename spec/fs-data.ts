import * as fs from 'fs'

let writeStreams: fs.WriteStream[] = []
let destMapping = new Map<fs.WriteStream, string>()

export function pushWriteStream(stream: fs.WriteStream, dest: string) {
    writeStreams.push(stream)
    destMapping.set(stream, dest)
}

export function getWriteStreams(): fs.WriteStream[] {
    return writeStreams
}

export function getLatestWriteStream(): fs.WriteStream {
    return writeStreams[writeStreams.length - 1]
}

export function getDest(stream: fs.WriteStream) {
    return destMapping.get(stream)
}

export function clearStreams() { 
    writeStreams = []
    destMapping = new Map<fs.WriteStream, string>()
}