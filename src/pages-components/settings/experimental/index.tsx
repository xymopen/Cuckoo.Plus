import { defineComponent, ref } from 'vue';
import SettingCard from '@/pages-components/settings/card'
import { notificationFilters } from "@/store/actions/notifications";
import './index.pcss'

export default defineComponent({
  setup () {
    const editingFilter = ref("")

    const addFilter = () => {
      if (editingFilter.value !== '') {
        notificationFilters.value.push(editingFilter.value)
        editingFilter.value = ''
      }
    }

    const createDeleteFilter = (i: number) => () => {
      notificationFilters.value.splice(i, 1)
    }

    return () => {
      return <SettingCard label="Experimental">
        <div class="primary-read-text-color">Notification filter</div>
        {/* vModel is broken in setup() */}
        <mu-text-field
          model={{ value: editingFilter.value, callback (value) { editingFilter.value = value } }}
          action-icon="add"
          action-click={addFilter}
        />
        <div>
          {notificationFilters.value.map((filter, i) =>
            <mu-chip class="demo-chip" delete vOn:delete={createDeleteFilter(i)}>{filter}</mu-chip>)}
        </div>
      </SettingCard>
    }
  }
})
