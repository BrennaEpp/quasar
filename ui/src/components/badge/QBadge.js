import Vue from 'vue'

import slot from '../../utils/slot.js'

export default Vue.extend({
  name: 'QBadge',

  props: {
    color: String,
    textColor: String,

    floating: Boolean,
    transparent: Boolean,
    multiLine: Boolean,
    outline: Boolean,

    label: [Number, String],

    align: {
      type: String,
      validator: v => ['top', 'middle', 'bottom'].includes(v)
    }
  },

  computed: {
    style () {
      if (this.align !== void 0) {
        return { verticalAlign: this.align }
      }
    },

    classes () {
      const text = this.outline === true
        ? this.color || this.textColor
        : this.textColor

      return 'q-badge flex inline items-center no-wrap' +
        ` q-badge--${this.multiLine === true ? 'multi' : 'single'}-line` +
        (this.outline === true
          ? ' q-badge--outline'
          : (this.color !== void 0 ? ` bg-${this.color}` : '')
        ) +
        (text !== void 0 ? ` text-${text}` : '') +
        (this.floating === true ? ' q-badge--floating' : '') +
        (this.transparent === true ? ' q-badge--transparent' : '')
    }
  },

  render (h) {
    return h('div', {
      style: this.style,
      class: this.classes,
      on: this.$listeners
    }, this.label !== void 0 ? [ this.label ] : slot(this, 'default'))
  }
})
