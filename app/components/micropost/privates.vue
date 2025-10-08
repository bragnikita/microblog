<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'

type MicropostRow = {
  id: string
  title?: string
  text: string
  createdAt: string
}

const columns = computed<TableColumn[]>(() => [

])

</script>