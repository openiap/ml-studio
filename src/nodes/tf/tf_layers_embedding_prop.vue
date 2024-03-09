<template>
  embedding {{ node.id }}
  <v-text-field v-model="node.label" :counter="30" :rules="nameRules" label="Name" required />
  <v-text-field v-model="node.data.inputLength" :rules="posetiv" label="Input length" type="number">
    <template v-slot:append>
      <v-tooltip text="Length of input sequences, when it is constant. This argument is required if you are going to connect `flatten` then `dense` layers upstream (without it, the shape of the dense outputs cannot be computed).">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.inputDim" :rules="posetiv" label="Input dimension" type="number">
    <template v-slot:append>
      <v-tooltip text="Integer > 0. Size of the vocabulary, i.e. maximum integer index + 1.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.outputDim" :rules="posetiv" label="Output dimension" type="number">
    <template v-slot:append>
      <v-tooltip text="Integer > 0. Dimension of the dense embedding">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-select clearable
  v-model="node.data.embeddingsInitializer"
  :items="[ {id: 'constant', name: 'constant'}, {id: 'glorotNormal', name: 'glorotNormal'}, {id: 'glorotUniform', name: 'glorotUniform'}, {id: 'heNormal', name: 'heNormal'}, {id: 'heUniform', name: 'heUniform'}, {id: 'identity', name: 'identity'}, {id: 'leCunNormal', name: 'leCunNormal'}, {id: 'leCunUniform', name: 'leCunUniform'}, {id: 'ones', name: 'ones'}, {id: 'orthogonal', name: 'orthogonal'}, {id: 'randomNormal', name: 'randomNormal'}, {id: 'randomUniform', name: 'randomUniform'}, {id: 'truncatedNormal', name: 'truncatedNormal'}, {id: 'varianceScaling', name: 'varianceScaling'}, {id: 'zeros', name: 'zeros'}]"
  item-title="name"
  item-value="id"
  label="Embeddings initializer"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Initializer for the embeddings matrix.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
  <v-select clearable
  v-model="node.data.embeddingsConstraint"
  :items="[ {id: 'maxNorm', name: 'maxNorm'}, {id: 'minMaxNorm', name: 'minMaxNorm'}, {id: 'nonNeg', name: 'nonNeg'}, {id: 'unitNorm', name: 'unitNorm'}]"
  item-title="name"
  item-value="id"
  label="Embeddings constraint"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Regularizer function applied to the embeddings matrix.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
  <v-checkbox label="Mask zero" v-model="node.data.maskZero" >
    <template v-slot:append>
      <v-tooltip text="Whether the input value 0 is a special 'padding' value that should be masked out. This is
        useful when using recurrent layers which may take variable length input.
        If this is True then all subsequent layers in the model need to support masking or an exception will be raised. If
        maskZero is set to True, as a consequence, index 0 cannot be used in the vocabulary (inputDim should equal size of
        vocabulary + 1).">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-checkbox>
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