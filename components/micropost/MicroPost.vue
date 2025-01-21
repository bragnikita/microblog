<template>
  <div>{{ model.text }}</div>
  <div>{{ model.timestamp }}</div>
  <div v-if="model.images">
    Images...
    {{ model.images }}
  </div>
  <div v-if="model.video">
    Video...
    <pre>{{ model.video }}</pre>
  </div>
</template>

<script lang="ts" setup>
import type {Model} from "~/components/micropost/model";

type Props = {
    model: Model
  }

  const props = defineProps<Props>()


</script>