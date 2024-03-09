<template>
  start {{ node.id }}
  <v-text-field v-model="node.label" :counter="30" :rules="nameRules" label="Name" required />
  <v-text-field v-model="node.data.inputshape" label="Input shape" 
  v-if="node.data.batchInputShape == null || node.data.batchInputShape == ''">
    <template v-slot:append>
      <v-tooltip text="Will be used to create an input layer to insert before this layer. If both inputShape and
        batchInputShape are defined, batchInputShape will be used. This argument is only applicable to input layers (the
        first layer of a model).">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.batchInputShape" label="Batch input shape"
   v-if="node.data.inputshape == null || node.data.inputshape == ''" >
    <template v-slot:append>
      <v-tooltip text="If defined, will be used to create an input layer to insert before this layer. If both
        inputShape and batchInputShape are defined, batchInputShape will be used. This argument is only applicable to
        input layers (the first layer of a model).">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.batchSize" :rules="posetiv" label="Batch size" type="number" 
  v-if="node.data.batchInputShape == null || node.data.batchInputShape == ''">
    <template v-slot:append>
      <v-tooltip text="If inputShape is specified and batchInputShape is not specified, batchSize is used to
        construct the batchInputShape.">
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
  }
}
</script>