const Promise = require('bluebird')
const uniqid = require('uniqid')

const actions = require('./actions')
const state = require('./state')
const events = {}

function playScene(scene) {
  const promise = Promise.resolve()

  for (let delay in scene) {
    const event = scene[delay]

    for (let action of event.actions) {
      promise.delay(delay).then(() => {
        action.options.lights = getLights(action.options.lights)

        const actionPromise = getActionCall(action.name)(action.options)

        if (!event.id) event.id = uniqid()

        console.log('event.id', event)

        for (let light of action.options.lights) {
          light.event = { id: event.id, name: action.name }
        }

        events[event.id] ? null : events[event.id] = []
        // events[event.id].push(actionPromise)
      })
    }
  }
}

function getLights(lightIds) {
  var lights = []

  lightIds.forEach(lightId => {
    var light = state.getLight(lightId)

    if (!light) {
      console.log('Could not find light: ', lightId)
      return
    }

    lights.push(light)
  })

  return lights
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
  return new Promise(resolve => {
    if (events[id]) {
      for(let promise of events[id]) promise.cancel()
    }
    resolve()
  })
}

exports.playScene = playScene
