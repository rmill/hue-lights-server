const Promise = require('bluebird')
const actions = require('./actions')
const { getConfig } = require('./config')
const events = {}

function playScene(scene) {
  const config = getConfig()

  if (!config) {
    throw 'No config file found. Please add one first.';
  }

  const promise = Promise.resolve()

  for (let delay in scene) {
    const event = scene[delay]

    for (let action of event.actions) {
      promise.delay(delay).then(() => {
        action.options.lights = getLightsUrls(config, action.options.lights)
        const actionPromise = getActionCall(action.name)(action.options)

        if (event.id !== undefined) {
          events[event.id] ? null : events[event.id] = []
          events[event.id].push(actionPromise)
        }
      })
    }
  }
}

function getLightsUrls(config, lights) {
  var lightsUrls = []
  if (lights) {
    lights.forEach((lightId) => {
      var light = config.lights[lightId]
      if (!light) {
        console.log('Could not find light: ', lightId)
        return
      }
      lightsUrls.push(light.url)
    })
  }

  return lightsUrls
}

function getActionCall(name) {
  switch (name) {
    case 'blink': return actions.blink
    case 'fade-color': return actions.fadeColor
    case 'heartbeat': return actions.heartbeat
    case 'kill': return actions.kill
    case 'lights-on': return actions.lightsOn
    case 'lights-off': return actions.lightsOff
    case 'play-sound': return actions.playSound
    case 'pulse': return actions.pulse
    case 'dancehall': return actions.danceHall
    case 'random': return actions.random
    default: throw `unknown action type "${name}"`
  }
}

function kill(id) {
  return new Promise((resolve) => {
    if (events[id]) {
      for(let promise of events[id]) promise.cancel()
    }
    resolve()
  })
}

exports.playScene = playScene
