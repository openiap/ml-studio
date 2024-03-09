<template>
  watch #{{ node.id }}
  <v-text-field v-model="node.label" :counter="30" :rules="nameRules" label="Name" required />
  <v-text-field v-model="node.data.output" :rules="text60" label="Output field" required />
  <v-select 
  v-model="node.data.collectionname"
  :items="collections"
  item-title="name"
  item-value="name"
  label="Collection to watch"
  outlined >
  </v-select>
  <v-text-field v-model="node.data.paths" :rules="text200" :counter="200" label="Paths">
    <template v-slot:append>
      <v-tooltip text="Array of JSon Querys to filter documents by">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>

</template>
<script>
import { openiap } from "@openiap/jsapi";

export default {
  data() {
    return {
      collections: [],
      minwidthrule: [ 
        v => (v == null || v == "" || (parseFloat(v) > 30 )) || 'Value must be more than 30'
      ],
      zerotoone: [
        v => (v == null || v == "" || (parseFloat(v) > 0 && parseFloat(v) <= 1)) || 'Value must be between 0 and 1 and more than 0'
      ],
      posetiv: [
        v => (v == null || v == "" || (parseFloat(v) > 0)) || 'Value must be more than 0'
      ],      
      posetivrequired: [
        v => !!v || 'Value is required',
        v => (v && parseFloat(v) > 0) || 'Value must be more than 0'
      ],
      nameRules: [
        v => !!v || 'Label is required',
        v => (v && v.length <= 30) || 'Label must be less than 10 characters',
        v => (v && v.length > 5) || 'Label must be more than 5 characters'
      ],
      text200: [
        v => (v == null || v == "" || (v && v.length <= 200)) || 'Value must be less than 200 characters',
        v => (v == null || v == "" || (v && v.length > 5)) || 'Value must be more than 5 characters'
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
      ]
    }
  },
  props: {
    node: Object,
    client: openiap
  },
  mounted() {
    this.client.ListCollections().then((collections) => {
      this.collections = collections;
    });
  }
}
</script>
<style scoped>
legend {
  white-space: nowrap;
  width: 150px; 
}
</style>
