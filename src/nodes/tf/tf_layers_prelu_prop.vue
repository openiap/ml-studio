<template>
  prelu {{ node.id }}
  <v-text-field v-model="node.label" :counter="30" :rules="nameRules" label="Name" required />
  <v-select clearable
  v-model="node.data.alphaInitializer"
  :items="[ {id: 'constant', name: 'constant'}, {id: 'glorotNormal', name: 'glorotNormal'}, {id: 'glorotUniform', name: 'glorotUniform'}, {id: 'heNormal', name: 'heNormal'}, {id: 'heUniform', name: 'heUniform'}, {id: 'identity', name: 'identity'}, {id: 'leCunNormal', name: 'leCunNormal'}, {id: 'leCunUniform', name: 'leCunUniform'}, {id: 'ones', name: 'ones'}, {id: 'orthogonal', name: 'orthogonal'}, {id: 'randomNormal', name: 'randomNormal'}, {id: 'randomUniform', name: 'randomUniform'}, {id: 'truncatedNormal', name: 'truncatedNormal'}, {id: 'varianceScaling', name: 'varianceScaling'}, {id: 'zeros', name: 'zeros'}]"
  item-title="name"
  item-value="id"
  label="Alpha initializer"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Initializer for the learnable alpha.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
  <v-select clearable
  v-model="node.data.alphaRegularizer"
  :items="[ {id: 'l1l2', name: 'l1l2'}]"
  item-title="name"
  item-value="id"
  label="Alpha regularizer"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Regularizer for the learnable alpha.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
  <v-select clearable
  v-model="node.data.alphaConstraint"
  :items="[ {id: 'maxNorm', name: 'maxNorm'}, {id: 'minMaxNorm', name: 'minMaxNorm'}, {id: 'nonNeg', name: 'nonNeg'}, {id: 'unitNorm', name: 'unitNorm'}]"
  item-title="name"
  item-value="id"
  label="Alpha constraint"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Constraint for the learnable alpha.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
  <v-text-field v-model="node.data.sharedAxes" label="Shared axes" required>
    <template v-slot:append>
      <v-tooltip text="The axes along which to share learnable parameters for the activation function. For
        example, if the incoming feature maps are from a 2D convolution with output shape [numExamples, height, width,
        channels], and you wish to share parameters across space (height and width) so that each filter channels has only
        one set of parameters, set shared_axes: [1, 2].">
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