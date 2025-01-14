import { isKeyCode } from './key-composition'

let handlers = []

export default {
  __install () {
    this.__installed = true
    window.addEventListener('keyup', evt => {
      if (handlers.length !== 0 && isKeyCode(evt, 27) === true) {
        handlers[handlers.length - 1].fn(evt)
      }
    })
  },

  register (comp, fn) {
    if (comp.$q.platform.is.desktop === true) {
      this.__installed !== true && this.__install()
      handlers.push({ comp, fn })
    }
  },

  pop (comp) {
    if (comp.$q.platform.is.desktop === true) {
      const index = handlers.findIndex(h => h.comp === comp)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }
}
