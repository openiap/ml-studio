<template>
  gru {{ node.id }}
  <v-text-field v-model="node.label" :counter="30" :rules="nameRules" label="Name" required />
  <v-text-field v-model="node.data.units" :rules="posetivrequired" label="Units in this layer" type="number" required>
    <template v-slot:append>
      <v-tooltip text="Positive integer, dimensionality of the output space.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-select clearable
  v-model="node.data.recurrentActivation"
  :items="[ {id: 'relu', name: 'relu'}, {id: 'sigmoid', name: 'sigmoid'}, {id: 'tanh', name: 'tanh'}, {id: 'softmax', name: 'softmax'}, {id: 'linear', name: 'linear'}]"
  item-title="name"
  item-value="id"
  label="Recurrent activation function"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Activation function to use for the recurrent step. Defaults to hard sigmoid (hardSigmoid). If null, no activation is applied.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
  <v-text-field v-model="node.data.implementation" :rules="posetiv" label="Implementation" type="number">
    <template v-slot:append>
      <v-tooltip text="Implementation mode, either 1 or 2. Mode 1 will structure its operations as a larger
        number of smaller dot products and additions, whereas mode 2 will batch them into fewer, larger operations. These
        modes will have different performance profiles on different hardware and for different applications.
        Note: For superior performance, TensorFlow.js always uses implementation 2, regardless of the actual value of this
        config field.

        Mode 2 will batch them into fewer, larger operations. These modes will have different performance profiles on
        different hardware and for different applications.

        Note: For superior performance, TensorFlow.js always uses implementation 2, regardless of the actual value of this
        configuration field">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-checkbox label="Use bias" v-model="node.data.useBias" >
    <template v-slot:append>
      <v-tooltip text="Whether the layer uses a bias vector.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-checkbox>
  <v-checkbox label="Return sequences" v-model="node.data.returnSequences" >
    <template v-slot:append>
      <v-tooltip text="Whether to return the last output in the output sequence, or the full sequence.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-checkbox>
  <v-checkbox label="Return state" v-model="node.data.returnState" >
    <template v-slot:append>
      <v-tooltip text="If true, process the input sequence backwards and return the reversed sequence (default: false).">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-checkbox>
  <v-select clearable
  v-model="node.data.activation"
  :items="[ {id: 'relu', name: 'relu'}, {id: 'sigmoid', name: 'sigmoid'}, {id: 'tanh', name: 'tanh'}, {id: 'softmax', name: 'softmax'}, {id: 'linear', name: 'linear'}]"
  item-title="name"
  item-value="id"
  label="Activation"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Activation function to use. Defaults to hyperbolic tangent (tanh). If you pass null, no activation will be applied.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
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