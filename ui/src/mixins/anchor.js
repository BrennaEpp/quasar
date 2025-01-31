import { clearSelection } from '../utils/selection.js'
import { prevent } from '../utils/event.js'
import { addEvt, cleanEvt, getTouchTarget } from '../utils/touch.js'
import { isKeyCode } from '../utils/key-composition'

export default {
  props: {
    target: {
      type: [Boolean, String],
      default: true
    },
    noParentEvent: Boolean,
    contextMenu: Boolean
  },

  watch: {
    contextMenu (val) {
      if (this.anchorEl !== void 0) {
        this.__unconfigureAnchorEl()
        this.__configureAnchorEl(val)
      }
    },

    target () {
      if (this.anchorEl !== void 0) {
        this.__unconfigureAnchorEl()
      }

      this.__pickAnchorEl()
    },

    noParentEvent (val) {
      if (this.anchorEl !== void 0) {
        if (val === true) {
          this.__unconfigureAnchorEl()
        }
        else {
          this.__configureAnchorEl()
        }
      }
    }
  },

  methods: {
    __showCondition (evt) {
      // abort with no parent configured or on multi-touch
      if (this.anchorEl === void 0) {
        return false
      }
      if (evt === void 0) {
        return true
      }
      return evt.touches === void 0 || evt.touches.length <= 1
    },

    __contextClick (evt) {
      this.hide(evt)
      this.$nextTick(() => {
        this.show(evt)
      })
      prevent(evt)
    },

    __toggleKey (evt) {
      isKeyCode(evt, 13) === true && this.toggle(evt)
    },

    __mobileCleanup (evt) {
      this.anchorEl.classList.remove('non-selectable')
      clearTimeout(this.touchTimer)

      if (this.showing === true && evt !== void 0) {
        clearSelection()
      }
    },

    __mobilePrevent: prevent,

    __mobileTouch (evt) {
      this.__mobileCleanup(evt)

      if (this.__showCondition(evt) !== true) {
        return
      }

      this.hide(evt)
      this.anchorEl.classList.add('non-selectable')

      const target = getTouchTarget(evt.target)
      addEvt(this, 'anchor', [
        [ target, 'touchmove', '__mobileCleanup', 'passive' ],
        [ target, 'touchend', '__mobileCleanup', 'passive' ],
        [ target, 'touchcancel', '__mobileCleanup', 'passive' ],
        [ this.anchorEl, 'contextmenu', '__mobilePrevent', 'notPassive' ]
      ])

      this.touchTimer = setTimeout(() => {
        this.show(evt)
      }, 300)
    },

    __unconfigureAnchorEl () {
      cleanEvt(this, 'anchor')
    },

    __configureAnchorEl (context = this.contextMenu) {
      if (this.noParentEvent === true || this.anchorEl === void 0) { return }

      let evts

      if (context === true) {
        if (this.$q.platform.is.mobile === true) {
          evts = [
            [ this.anchorEl, 'touchstart', '__mobileTouch', 'passive' ]
          ]
        }
        else {
          evts = [
            [ this.anchorEl, 'click', 'hide', 'passive' ],
            [ this.anchorEl, 'contextmenu', '__contextClick', 'notPassive' ]
          ]
        }
      }
      else {
        evts = [
          [ this.anchorEl, 'click', 'toggle', 'passive' ],
          [ this.anchorEl, 'keyup', '__toggleKey', 'passive' ]
        ]
      }

      addEvt(this, 'anchor', evts)
    },

    __setAnchorEl (el) {
      this.anchorEl = el
      while (this.anchorEl.classList.contains('q-anchor--skip')) {
        this.anchorEl = this.anchorEl.parentNode
      }
      this.__configureAnchorEl()
    },

    __pickAnchorEl () {
      if (this.target && typeof this.target === 'string') {
        const el = document.querySelector(this.target)
        if (el !== null) {
          this.anchorEl = el
          this.__configureAnchorEl()
        }
        else {
          this.anchorEl = void 0
          console.error(`Anchor: target "${this.target}" not found`, this)
        }
      }
      else if (this.target !== false) {
        this.__setAnchorEl(this.parentEl)
      }
      else {
        this.anchorEl = void 0
      }
    }
  },

  created () {
    if (
      typeof this.__configureScrollTarget === 'function' &&
      typeof this.__unconfigureScrollTarget === 'function'
    ) {
      this.noParentEventWatcher = this.$watch('noParentEvent', () => {
        if (this.scrollTarget !== void 0) {
          this.__unconfigureScrollTarget()
          this.__configureScrollTarget()
        }
      })
    }
  },

  mounted () {
    this.parentEl = this.$el.parentNode
    this.__pickAnchorEl()

    if (this.value === true && this.anchorEl === void 0) {
      this.$emit('input', false)
    }
  },

  beforeDestroy () {
    clearTimeout(this.touchTimer)
    this.noParentEventWatcher !== void 0 && this.noParentEventWatcher()
    this.__anchorCleanup !== void 0 && this.__anchorCleanup()
    this.__unconfigureAnchorEl()
  }
}
