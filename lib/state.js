const { getConfig } = require('./config')
const { getCurrentState, updateState } = require('./actions')

var state = getConfig()

function initialize() {
  for (var light of state.lights) {
    getCurrentState(light).then(s => _updateState(JSON.parse(s)))
  }
}

function getLight(id) {
  for (var light of state.lights) {
    if (light.id === id) return light
  }

  return null
}

function updateLight(id, state) {
  var light = getLight(id)
  return updateState(light, state)
    .then(() => getCurrentState(light))
    .then(s => _updateState(JSON.parse(s)))
}

function _updateState(s) {
  var light = getLight(s.uniqueid)
  if (light) light.state = s.state
  return light
}

module.exports = {
  getLight,
  initialize,
  state,
  updateLight
}
