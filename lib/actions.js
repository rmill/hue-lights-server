const request = require('request-promise')
const Promise = require('bluebird')

Promise.config({ cancellation: true })

/**
 * Fade a set of lights to a specific color
 * @param {Light[]} lights The set of lights
 * @param {number} duration The duration of the fade
 * @param {string} color The color to fade to
 * @return {Promise}
 */
function fadeColor({lights, duration = 0, brightness = 254, color = 'on'}) {
  console.log('fadeColor', lights)

  const colorJson = getColor(color, brightness);
  const json = Object.assign(colorJson, { transitiontime: duration });

  const requests = []
  for (let light of lights) {
    requests.push(_request(light, { method: 'PUT', json }))
  }

  return Promise.all(requests);
}

/**
 * Perform the heartbeat effect
 * @param {Light[]} lights The set of lights
 * @param {string} color The color to use
 * @return {Promise}
 */
function heartbeat(lights, color) {
  const promise = new Promise.resolve()
  return promise.then(() => fadeColor(lights, 0, color))
         .delay(200).then(() => fadeColor(lights, 1, 'off'))
         .delay(1000).then(() => heartbeat(lights, color))
}

/**
 * Turn a set of lights on
 * @param {Light[]} lights The set of lights
 * @param {number} duration The length of fade
 * @param {string} color The color to turn the lights to
 * @return {Promise}
 */
function lightsOn(lights, duration = 0, color = 'default') {
  return fadeColor(lights, duration, color)
}

/**
 * Turn a set of lights off
 * @param {Light[]} lights The set of lights
 * @param {number} duration The length of fade
 * @return {Promise}
 */
function lightsOff(lights, duration = 0) {
  const json = { "on": false, "transitiontime": duration }

  const requests = []
  for (let light of lights) {
    requests.push(_request(light, { method: 'PUT', json }))
  }

  return Promise.all(requests)
}

/**
 * Pulse a set of lights
 * @param {Light[]} lights The set of lights
 * @param {number} duration The length of the pulse
 * @param {string} color The color to pulse the lights
 * @return {Promise}
 */
function pulse({lights, duration = 1000, color = 'default'}) {
  console.log('pulse', lights)

  const promise = new Promise.resolve()
  return promise.then(() => fadeColor({ lights, duration: duration / 100, color }))
         .delay(duration).then(() => fadeColor(lights, duration / 100, 'off'))
         .delay(duration).then(() => pulse(lights, duration, color))
}

/**
 * Randomly blink a set of lights
 * @param {Light[]} lights The set of lights
 * @param {string} color The color to blink the lights
 * @return {Promise}
 */
function random(lights, color) {
  const colorJson = getColor(color);
  const json = Object.assign({ on: true, transitiontime: 0 }, colorJson);
  const light = lights[Math.floor(Math.random() * lights.length)];

  const promise = new Promise.resolve()
  return promise.then(() => _request(light, { method: 'PUT', json: { "on": false, transitiontime: 0 } }))
        .delay(50).then(() => _request(light, { method: 'PUT', json }))
        .delay(50).then(() => random(lights, color))
}

/**
 * Blink the lights
 * @param {Light[]} lights The urls of the lights to blink
 * @param {number} times The number of times to blink the light
 * @param {color} string The color to blink it
 * @return {Promise}
 */
function blink({lights, times = 1, color = 'on'}) {
  if (times <= 0) {
    return Promise.resolve()
  }

  times--

  const colorJson = getColor(color)
  return fadeColor({lights, color: 'off'})
    .delay(250).then(() => fadeColor({lights, color}))
    .delay(250).then(() => blink({lights, times, color}))
}

/**
 * Turn the set of Lights into a dance hall
 * @param {Light[]} lights A list of lights to affect
 * @param {number} duration The length of time between changing light effect
 * @return {Promise}
 */
function danceHall({lights, duration = 3000 }) {
  const promises = {};

console.log('dancehall', lights)

  for(let light of lights) {
    setInterval(() => {
      if (promises[light]) promises[light].cancel();
      promises[light] = pulse({ lights: [light], duration, color: randomColor() })
    }, Math.random() * 5000);
  }
}

/**
 * Get a random color
 * @return {string}
 */
function randomColor() {
  const colors = ["red", "green", "purple", "dim"];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Get the parameters for a color
 * @param {string} color The name of the color
 * @param {number} bri The brightness
 * @return {Object}
 */
function getColor(color, bri) {
  switch (color) {
    case 'default':
    case 'white': return { on: true, hue: 10000, sat: 254, bri }
    case 'off':
    case 'black': return { on: false }
    case 'red': return { on: true, hue: 65000, sat: 254, bri }
    case 'green': return { on: true, hue: 20000, sat: 254, bri }
    case 'purple': return { on: true, hue: 50000, sat: 254, bri }
    case 'on': return { on: true, bri }
  }
}

/**
 * Get the state of a light
 * @param {Light} light The light to get the state for
 * @return {Promise} The Light with the refreshed state
 */
function getCurrentState(light) {
  return _request(light, { method: 'GET' })
}

/**
 * Update the state of a light
 * @param {Light} light The Light to update
 * @param {Object} state The new state
 * @return {Promise}
 */
function updateState(light, state) {
  return _request(light, { method: 'PUT', json: state })
}

function _request(light, options) {
  options.uri = options.method == 'GET' ? light.url : `${light.url}/state`
  return request(options)
}

/**
 * Get the list of light effects
 * @return {Object[]}
 */
function getEffects() {
  return [
    { name: 'Blink', value: 'blink' },
    { name: 'Dance Hall', value: 'dancehall' },
    { name: 'Heartbeat', value: 'heartbeat' },
    { name: 'Random', value: 'random' },
    { name: 'Pulse', value: 'pulse' }
  ]
}

module.exports = {
  blink,
  danceHall,
  fadeColor,
  getEffects,
  getCurrentState,
  heartbeat,
  lightsOff,
  lightsOn,
  random,
  pulse,
  updateState
}
