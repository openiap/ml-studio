<template>
  table #{{ node.id }}
  <v-text-field v-model="node.label" :counter="30" :rules="nameRules" label="Name" required />
  <v-text-field v-model="node.data.input" :rules="text20" :counter="20" label="Input field" required>
  </v-text-field>
  <v-text-field v-model="node.data.fields" :rules="text200" :counter="200" label="Data fields">
    <template v-slot:append>
      <v-tooltip text="Comma seperated list of fields to add. Use to grab only specefi fields from an array of objects">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.rowsPerPage" :rules="posetiv" label="Rows per page" type="number" >
  </v-text-field>
  <v-checkbox label="Auto scroll to last" v-model="node.data.scrollToLast" >
  </v-checkbox>
  <v-checkbox label="Append data" v-model="node.data.append" >
  </v-checkbox>
  <v-text-field v-model="node.data.appendmaxitems" :rules="posetiv" label="Append max items" type="number" >
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
  }
}


</script>
<style scoped>
legend {
  white-space: nowrap;
  width: 200px; 
}
</style>
