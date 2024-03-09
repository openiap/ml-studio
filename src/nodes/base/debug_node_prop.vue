<template>
  debug #{{ node.id }}
  <v-text-field v-model="node.label" :counter="30" :rules="nameRules" label="Name" required />
  <v-text-field v-model="node.data.input" :rules="text20" :counter="20" label="Input field" required>
  </v-text-field>
  <v-text-field v-model="node.data.input" :rules="text20" :counter="20" label="Input field" required>
  </v-text-field>
  <v-text-field v-model="node.data.max" :rules="posetiv" label="Max text length" type="number" >
  </v-text-field>
  <v-text-field v-model="node.data.minwidth" :rules="minwidthrule" label="Minimum width" type="number" >
  </v-text-field>
</template>
<script>
import { openiap } from "@openiap/jsapi";

export default {
  data() {
    return {
      models: [],
      nameRules: [
        v => !!v || 'Label is required',
        v => (v && v.length <= 30) || 'Label must be less than 10 characters',
        v => (v && v.length > 5) || 'Label must be more than 5 characters'
      ],
      minwidthrule: [ 
        v => (v == null || v == "" || (parseFloat(v) > 30 )) || 'Value must be more than 30'
      ],
      zerotoone: [
        v => (v == null || v == "" || (parseFloat(v) > 0 && parseFloat(v) <= 1)) || 'Value must be between 0 and 1 and more than 0'
      ],
      posetiv: [
        v => (v == null || v == "" || (parseFloat(v) > 0)) || 'Value must be more than 0'
      ],      
      text60: [
        v => !!v || 'Value is required',
        v => (v && v.length <= 60) || 'Value must be less than 60 characters',
        v => (v && v.length > 5) || 'Value must be more than 5 characters'
      ],
      text20: [
        v => !!v || 'Value is required',
        v => (v && v.length <= 60) || 'Value must be less than 60 characters',
        v => (v && v.length > 5) || 'Value must be more than 5 characters'
      ],
    }
  },
  props: {
    node: Object,
    client: openiap
  },
  mounted() {
  }
}
</script>
<style scoped>
legend {
  white-space: nowrap;
  width: 150px; 
}
</style>
