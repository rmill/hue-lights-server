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

app.get('/effects', (req, res) => res.json(actions.getEffects()))

app.get('/lights', (req, res) => res.json(state.getLights()))

app.get('/lights/:id', (req, res) => res.json(state.getLight(req.params.id)))

app.put('/lights/:id', (req, res) => {
  state.updateLight(req.params.id, req.body)
    .then(light => res.json(light))
    .catch(e => { throw(e) })
})

app.post('/lights/:id/effect', (req, res) => {
  let lightId = req.params.id
  let scene = { 0: { actions: [ { name: req.body.name, options: { lights: [ lightId ]}}]}}
  playScene(scene)
  res.json(state.getLight(lightId))
})

app.post('/scene', (req, res) => {
  playScene(req.body)
  res.json(state.getLights())
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
