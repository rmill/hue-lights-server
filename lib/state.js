const { getConfig } = require('./config')
const { getCurrentState, updateState } = require('./actions')

var state = getConfig()
var interval
var timeout

function getLight(id) {
  for (var light of state.lights) {
    if (light.id === id) return light
  }

  return null
}

function getLights() {
  // Start polling if not currenting polling
  if (!interval) {
    interval = setInterval(_updateAllStates, 1000)
  }

  // Cancel polling if lights have not been requested for 1 minute
  if (timeout) clearTimeout(timeout)

  timeout = setTimeout(() => {
    clearInterval(interval)
    interval = null
    timeout = null
  }, 1000 * 60)

  return state.lights
}

function updateLight(id, state) {
  var light = getLight(id)
  return updateState(light, state)
    .then(() => getCurrentState(light))
    .then(s => _updateState(JSON.parse(s)))
}

function _updateAllStates() {
  for (var light of state.lights) {
    getCurrentState(light).then(s => _updateState(JSON.parse(s)))
  }
}

function _updateState(s) {
  var light = getLight(s.uniqueid)
  if (light) light.state = s.state
  return light
}

module.exports = {
  getLight,
  getLights,
  initialize: _updateAllStates,
  updateLight
}
