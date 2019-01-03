const player = require('play-sound')()
const request = require('request-promise')
const Promise = require('bluebird')

Promise.config({ cancellation: true })

/**
 * Fade a set of lights to a specific color
 * @param {string[]} lights The set of lights
 * @param {number} duration The duration of the fade
 * @param {string} color The color to fade to
 * @return {Promise}
 */
function fadeColor({lights, duration = 0, brightness = 254, color = 'on'}) {
  const colorJson = getColor(color, brightness);
  const json = Object.assign(colorJson, { transitiontime: duration });

  const requests = []
  for (let light of lights) {
    requests.push(request({ method: 'PUT', uri: light, json }))
  }

  return Promise.all(requests);
}

/**
 * Perform the heartbeat effect
 * @param {string[]} lights The set of lights
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
 * @param {string[]} lights The set of lights
 * @param {number} duration The length of fade
 * @param {string} color The color to turn the lights to
 * @return {Promise}
 */
function lightsOn(lights, duration = 0, color = 'default') {
  return fadeColor(lights, duration, color)
}

/**
 * Turn a set of lights off
 * @param {string[]} lights The set of lights
 * @param {number} duration The length of fade
 * @return {Promise}
 */
function lightsOff(lights, duration = 0) {
  const json = { "on": false, "transitiontime": duration }

  const requests = []
  for (let light of lights) {
    requests.push(request({ method: 'PUT', uri: light, json }))
  }

  return Promise.all(requests)
}

/**
 * Play a sound
 * @param {string} file The name of the sound
 * @return {Promise}
 */
function playSound(file) {
  return new Promise((resolve, error, onCancel) => {
    const audio = player.play(__dirname + `/assets/${file}`, () => resolve())
    onCancel(() => audio.kill())
  })
}

/**
 * Pulse a set of lights
 * @param {string[]} lights The set of lights
 * @param {number} duration The length of the pulse
 * @param {string} color The color to pulse the lights
 * @return {Promise}
 */
function pulse(lights, duration, color) {
  const promise = new Promise.resolve()
  return promise.then(() => fadeColor(lights, duration / 100, color))
         .delay(duration).then(() => fadeColor(lights, duration / 100, 'off'))
         .delay(duration).then(() => pulse(lights, duration, color))
}

/**
 * Randomly blink a set of lights
 * @param {string[]} lights The set of lights
 * @param {string} color The color to blink the lights
 * @return {Promise}
 */
function random(lights, color) {
  const colorJson = getColor(color);
  const json = Object.assign({ on: true, transitiontime: 0 }, colorJson);
  const light = lights[Math.floor(Math.random() * lights.length)];

  const promise = new Promise.resolve()
  return promise.then(() => request({ method: 'PUT', light, json: { "on": false, transitiontime: 0 } }))
        .delay(50).then(() => request({ method: 'PUT', light, json }))
        .delay(50).then(() => random(lights, color))
}

/**
 * Blink the lights
 * @param {string[]} lights The urls of the lights to blink
 * @param {number} times The number of times to blink the light
 * @param {color} string The color to blink it
 * @return Promise
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
 * Turn the lights of lights into a dance hall
 * @param {string[]} lights A list of lights to affect
 * @param {number} duration The length of time between changing light effect
 * @return Promise
 */
function danceHall(lights, duration) {
  const promises = {};
  for(let light of lights) {
    setInterval(() => {
      if (promises[light]) promises[light].cancel();
      promises[light] = pulse([light], duration, randomColor())
    }, Math.random() * 5000);
  }
}

/**
 * Get a random color
 * @return string
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

exports.fadeColor = fadeColor
exports.danceHall = danceHall
exports.blink = blink
exports.random = random
exports.pulse = pulse
exports.playSound = playSound
exports.lightsOn = lightsOn
exports.lightsOff = lightsOff
exports.heartbeat = heartbeat
