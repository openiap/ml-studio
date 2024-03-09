<template>
  convLstm2d {{ node.id }}
  <v-text-field v-model="node.label" :counter="30" :rules="nameRules" label="Name" required />
  <v-select clearable
  v-model="node.data.activation"
  :items="[ {id: 'relu', name: 'relu'}, {id: 'sigmoid', name: 'sigmoid'}, {id: 'tanh', name: 'tanh'}, {id: 'softmax', name: 'softmax'}, {id: 'linear', name: 'linear'}]"
  item-title="name"
  item-value="id"
  label="Activation"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Activation function to use. Default: hyperbolic tangent ('tanh'). If you pass null,'linear' activation will be applied.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
  <v-checkbox label="Use bias" v-model="node.data.useBias" >
    <template v-slot:append>
      <v-tooltip text="Whether the layer uses a bias vector.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-checkbox>
  <v-text-field v-model="node.data.filters" :rules="posetiv" label="Filters" type="number">
    <template v-slot:append>
      <v-tooltip text="The dimensionality of the output space (i.e. the number of filters in the
        convolution).">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.kernelSize" :rules="posetiv" label="Kernel Size" type="number">
    <template v-slot:append>
      <v-tooltip text="The dimensions of the convolution window. If kernelSize is a number, the convolutional window will be square.">
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