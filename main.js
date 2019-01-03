"use strict"

// Third party modules
const bodyParser = require('body-parser')
const express = require('express')
// Custom modules
const actions = require('./js/actions')
const discover = require('./js/discover')
const { playScene } = require('./js/scene')
const { createConfig, getConfig, saveConfig } = require('./js/config')

var config = getConfig()
const app = express()

app.use(bodyParser.json())
app.use(express.static('assets'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/config', (req, res) => {
  if (!config) {
    return res.sendStatus(404)
  }

  res.json(config)
})

app.post('/configure', (req, res) => {
  discover().then((lights) => {
    config = createConfig(lights)
    saveConfig(config)
    res.json(config)
  }).catch((err) => {
    console.log(err)
    res.sendStatus(500)
  });
})

app.put('/config/groups', (req, res) => {
  config.groups = req.body
  saveConfig(config)
  res.send(config)
})

app.post('/scene', (req, res) => {
  playScene(req.body)
  res.end()
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
