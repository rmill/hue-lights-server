"use strict"

// Third party modules
const bodyParser = require('body-parser')
const express = require('express')

// Custom modules
const actions = require('./lib/actions')
const state = require('./lib/state')
const { playScene } = require('./lib/scene')

// Initialize the light state
state.initialize()

const app = express()

app.use(bodyParser.json())

app.get('/lights', (req, res) => {
  res.json(state.state.lights)
})

app.post('/scene', (req, res) => {
  playScene(req.body)
  res.end()
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
