<template>
  <div style="background-color: red; padding: 1rem">
    v3 component marker label
    <button @click="closeMarkerLabel">close</button>
  </div>
</template>
<script setup lang="tsx">
// import { defineComponent } from "vue";
import { closeMarkerLabel } from "@/../lib/index";
</script>
