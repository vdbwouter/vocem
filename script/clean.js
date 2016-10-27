'use strict'
const rimraf = require('rimraf')
const path = require('path')

const projectRoot = path.resolve(path.dirname(__dirname))

rimraf(path.join(projectRoot, 'lib'), err => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  rimraf(path.join(projectRoot, 'spec-build'), err => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    process.exit(0)
  })
})