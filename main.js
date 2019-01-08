"use strict"

// Third party modules
const express = require('express')

// Custom modules
const actions = require('./lib/actions')
const state = require('./lib/state')
const { playScene } = require('./lib/scene')

// Initialize the light state
state.initialize()

const app = express()

app.use(require('cors')())
app.use(require('body-parser').json())

app.get('/lights', (req, res) => {
  res.json(state.state.lights)
})

app.get('/lights/:id', (req, res) => {
  var light = state.getLight(req.params.id)
  res.json(light)
})

app.put('/lights/:id', (req, res) => {
  state.updateLight(req.params.id, req.body)
    .then(light => res.json(light))
    .catch(e => { throw(e) })
})

app.post('/scene', (req, res) => {
  playScene(req.body)
  res.end()
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
