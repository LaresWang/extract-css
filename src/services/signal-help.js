/* eslint-disable */
'use strict'

let StaticArrayBufferProto = new ArrayBuffer().__proto__

function toString(thing) {
  if (typeof thing == 'string') {
    return thing
  }
  return new dcodeIO.ByteBuffer.wrap(thing).toString('binary')
}
function toArrayBuffer(thing) {
  if (thing === undefined) {
    return undefined
  }
  if (thing === Object(thing)) {
    if (thing.__proto__ == StaticArrayBufferProto) {
      return thing
    }
  }

  let str
  if (typeof thing == 'string') {
    str = thing
  } else {
    throw new Error(
      'Tried to convert a non-string of type ' +
        typeof thing +
        ' to an array buffer'
    )
  }
  return new dcodeIO.ByteBuffer.wrap(thing, 'binary').toArrayBuffer()
}
function isEqual(a, b) {
  // TODO: Special-case arraybuffers, etc
  if (a === undefined || b === undefined) {
    return false
  }
  a = util.toString(a)
  b = util.toString(b)
  let maxLength = Math.max(a.length, b.length)
  if (maxLength < 5) {
    throw new Error('a/b compare too short')
  }
  return (
    a.substring(0, Math.min(maxLength, a.length)) ==
    b.substring(0, Math.min(maxLength, b.length))
  )
}

function arrayBufferToBase64(buffer) {
  let binary = ''
  let bytes = new Uint8Array(buffer)
  let len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

function base64ToArrayBuffer(base64) {
  let binary_string = window.atob(base64)
  let len = binary_string.length
  let bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes.buffer
}
function decoder(a) {
  let decoder = new TextDecoder('utf-8')
  return decoder.decode(a)
}
function encoder(a) {
  let encoder = new TextEncoder('utf-8')
  return encoder.encode(a)
}

var util = {
  toString,
  toArrayBuffer,
  isEqual,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  decoder,
  encoder,
}
module.exports = util
