'use strict'
const ncp = require('ncp').ncp
const path = require('path')

const projectRoot = path.resolve(path.dirname(__dirname))

let blacklist = [ /.+\.ts$/, /tsconfig.json$/, /typings.json$/, /typings\/.*/ ]

ncp(path.join(projectRoot, 'spec'), path.join(projectRoot, 'spec-build'), {
  filter: file => {
    for (let regex of blacklist) {
      if (regex.test(file)) return false
    }
    return true
  }
}, err => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  
  process.exit(0)
})