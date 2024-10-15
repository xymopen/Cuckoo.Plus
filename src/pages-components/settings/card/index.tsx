import { defineComponent } from 'vue';
import './index.pcss'

export default defineComponent({
  functional: true,
  props: {
    label: {
      type: String,
      required: false
    }
  },
  render (h, ctx) {
    return <div>
      <p class="setting-card--card-label">{ctx.scopedSlots.label?.({}) ?? ctx.props.label}</p>
      {ctx.scopedSlots.default?.({}) ?? ctx.children}
    </div>
  }
})
