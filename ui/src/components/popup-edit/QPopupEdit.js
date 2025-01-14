import Vue from 'vue'

import QMenu from '../menu/QMenu.js'
import QBtn from '../btn/QBtn.js'

import clone from '../../utils/clone.js'
import { isDeepEqual } from '../../utils/is.js'
import slot from '../../utils/slot.js'
import { isKeyCode } from '../../utils/key-composition'

export default Vue.extend({
  name: 'QPopupEdit',

  props: {
    value: {
      required: true
    },
    title: String,
    buttons: Boolean,
    labelSet: String,
    labelCancel: String,

    color: {
      type: String,
      default: 'primary'
    },
    validate: {
      type: Function,
      default: () => true
    },

    /* menu props overrides */
    cover: {
      type: Boolean,
      default: true
    },
    contentClass: String,
    /* end of menu props */

    disable: Boolean
  },

  data () {
    return {
      initialValue: ''
    }
  },

  computed: {
    classes () {
      return 'q-popup-edit' +
        (this.contentClass ? ' ' + this.contentClass : '')
    },

    defaultSlotScope () {
      return {
        initialValue: this.initialValue,
        value: this.value,
        emitValue: this.__emitValue,
        validate: this.validate,
        set: this.set,
        cancel: this.cancel
      }
    },

    menuEvents () {
      return {
        'before-show': () => {
          this.validated = false // eslint-disable-line
          this.initialValue = clone(this.value) // eslint-disable-line
          this.watcher = this.$watch('value', this.__reposition) // eslint-disable-line
          this.$emit('before-show')
        },
        show: () => {
          this.$emit('show')
        },
        'before-hide': () => {
          this.watcher()

          if (this.validated === false && this.__hasChanged()) {
            this.$emit('cancel', this.value, this.initialValue)
            this.$emit('input', this.initialValue)
          }
          this.$emit('before-hide')
        },
        hide: () => {
          this.$emit('hide')
        },
        keyup: e => {
          isKeyCode(e, 13) === true && this.set()
        }
      }
    }
  },

  methods: {
    set () {
      if (this.__hasChanged()) {
        if (this.validate(this.value) === false) {
          return
        }
        this.$emit('save', this.value, this.initialValue)
      }
      this.__close()
    },

    cancel () {
      if (this.__hasChanged()) {
        this.$emit('cancel', this.value, this.initialValue)
        this.$emit('input', this.initialValue)
      }
      this.__close()
    },

    __hasChanged () {
      return !isDeepEqual(this.value, this.initialValue)
    },

    __emitValue (val) {
      if (this.disable === true) {
        return
      }
      this.$emit('input', val)
    },

    __close () {
      this.validated = true
      this.$refs.menu.hide()
    },

    __reposition () {
      this.$nextTick(() => {
        this.$refs.menu.updatePosition()
      })
    },

    __getContent (h) {
      const
        title = slot(this, 'title', this.title),
        child = this.$scopedSlots.default === void 0
          ? []
          : this.$scopedSlots.default(this.defaultSlotScope).slice()

      title && child.unshift(
        h('div', { staticClass: 'q-dialog__title q-mt-sm q-mb-sm' }, [ title ])
      )

      this.buttons === true && child.push(
        h('div', { staticClass: 'q-popup-edit__buttons row justify-center no-wrap' }, [
          h(QBtn, {
            props: {
              flat: true,
              color: this.color,
              label: this.labelCancel || this.$q.lang.label.cancel
            },
            on: { click: this.cancel }
          }),
          h(QBtn, {
            props: {
              flat: true,
              color: this.color,
              label: this.labelSet || this.$q.lang.label.set
            },
            on: { click: this.set }
          })
        ])
      )

      return child
    }
  },

  render (h) {
    if (this.disable === true) { return }

    return h(QMenu, {
      ref: 'menu',
      props: {
        ...this.$attrs,
        cover: this.cover,
        contentClass: this.classes
      },
      on: this.menuEvents
    }, this.__getContent(h))
  }
})
