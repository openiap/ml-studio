<template>
  SimpleRNN {{ node.id }}
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
  v-model="node.data.kernelInitializer"
  :items="[ {id: 'constant', name: 'constant'}, {id: 'glorotNormal', name: 'glorotNormal'}, {id: 'glorotUniform', name: 'glorotUniform'}, {id: 'heNormal', name: 'heNormal'}, {id: 'heUniform', name: 'heUniform'}, {id: 'identity', name: 'identity'}, {id: 'leCunNormal', name: 'leCunNormal'}, {id: 'leCunUniform', name: 'leCunUniform'}, {id: 'ones', name: 'ones'}, {id: 'orthogonal', name: 'orthogonal'}, {id: 'randomNormal', name: 'randomNormal'}, {id: 'randomUniform', name: 'randomUniform'}, {id: 'truncatedNormal', name: 'truncatedNormal'}, {id: 'varianceScaling', name: 'varianceScaling'}, {id: 'zeros', name: 'zeros'}]"
  item-title="name"
  item-value="id"
  label="Kernel initializer"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Initializer for the dense kernel weights matrix.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
  <v-select clearable
  v-model="node.data.recurrentInitializer"
  :items="[ {id: 'constant', name: 'constant'}, {id: 'glorotNormal', name: 'glorotNormal'}, {id: 'glorotUniform', name: 'glorotUniform'}, {id: 'heNormal', name: 'heNormal'}, {id: 'heUniform', name: 'heUniform'}, {id: 'identity', name: 'identity'}, {id: 'leCunNormal', name: 'leCunNormal'}, {id: 'leCunUniform', name: 'leCunUniform'}, {id: 'ones', name: 'ones'}, {id: 'orthogonal', name: 'orthogonal'}, {id: 'randomNormal', name: 'randomNormal'}, {id: 'randomUniform', name: 'randomUniform'}, {id: 'truncatedNormal', name: 'truncatedNormal'}, {id: 'varianceScaling', name: 'varianceScaling'}, {id: 'zeros', name: 'zeros'}]"
  item-title="name"
  item-value="id"
  label="Recurrent initializer"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Initializer for the recurrentKernel weights matrix, used for linear transformation of the recurrent state.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
  <v-select clearable
  v-model="node.data.biasInitializer"
  :items="[ {id: 'constant', name: 'constant'}, {id: 'glorotNormal', name: 'glorotNormal'}, {id: 'glorotUniform', name: 'glorotUniform'}, {id: 'heNormal', name: 'heNormal'}, {id: 'heUniform', name: 'heUniform'}, {id: 'identity', name: 'identity'}, {id: 'leCunNormal', name: 'leCunNormal'}, {id: 'leCunUniform', name: 'leCunUniform'}, {id: 'ones', name: 'ones'}, {id: 'orthogonal', name: 'orthogonal'}, {id: 'randomNormal', name: 'randomNormal'}, {id: 'randomUniform', name: 'randomUniform'}, {id: 'truncatedNormal', name: 'truncatedNormal'}, {id: 'varianceScaling', name: 'varianceScaling'}, {id: 'zeros', name: 'zeros'}]"
  item-title="name"
  item-value="id"
  label="Bias initializer"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Initializer for the bias vector.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
  <v-select clearable
  v-model="node.data.kernelRegularizer"
  :items="[ {id: 'l1l2', name: 'l1l2'}]"
  item-title="name"
  item-value="id"
  label="Kernel regularizer"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Regularizer function applied to the kernel weights matrix.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
  <v-select clearable
  v-model="node.data.recurrentRegularizer"
  :items="[ {id: 'l1l2', name: 'l1l2'}]"
  item-title="name"
  item-value="id"
  label="Recurrent regularizer"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Regularizer function applied to the recurrentKernel weights matrix.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
  <v-select clearable
  v-model="node.data.biasRegularizer"
  :items="[ {id: 'l1l2', name: 'l1l2'}]"
  item-title="name"
  item-value="id"
  label="Bias regularizer"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Regularizer function applied to the bias vector.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
  <v-select clearable
  v-model="node.data.kernelConstraint"
  :items="[ {id: 'maxNorm', name: 'maxNorm'}, {id: 'minMaxNorm', name: 'minMaxNorm'}, {id: 'nonNeg', name: 'nonNeg'}, {id: 'unitNorm', name: 'unitNorm'}]"
  item-title="name"
  item-value="id"
  label="Kernel constraint"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Constraint function applied to the kernel weights matrix.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
  <v-select clearable
  v-model="node.data.recurrentConstraint"
  :items="[ {id: 'maxNorm', name: 'maxNorm'}, {id: 'minMaxNorm', name: 'minMaxNorm'}, {id: 'nonNeg', name: 'nonNeg'}, {id: 'unitNorm', name: 'unitNorm'}]"
  item-title="name"
  item-value="id"
  label="Recurrent constraint"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Constraint function applied to the recurrentKernel weights matrix.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
  <v-select clearable
  v-model="node.data.biasConstraint"
  :items="[ {id: 'maxNorm', name: 'maxNorm'}, {id: 'minMaxNorm', name: 'minMaxNorm'}, {id: 'nonNeg', name: 'nonNeg'}, {id: 'unitNorm', name: 'unitNorm'}]"
  item-title="name"
  item-value="id"
  label="Bias constraint"
  outlined required>
    <template v-slot:append>
      <v-tooltip text="Constraint function applied to the recurrentKernel weights matrix.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-select>
  <v-text-field v-model="node.data.dropout" :rules="zerotoone" label="Dropout" type="number"
    v-if="node.data.optimizer == 'momentum' || node.data.optimizer == 'rmsprop'">
    <template v-slot:append>
      <v-tooltip text="Number between 0 and 1. Fraction of the units to drop for the linear transformation of the inputs.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.recurrentDropout" :rules="zerotoone" label="Recurrent dropout" type="number"
    v-if="node.data.optimizer == 'momentum' || node.data.optimizer == 'rmsprop'">
    <template v-slot:append>
      <v-tooltip text="Number between 0 and 1. Fraction of the units to drop for the linear transformation of the recurrent state.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
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
  <v-checkbox label="Use bias" v-model="node.data.useBias" >
    <template v-slot:append>
      <v-tooltip text="Whether the layer uses a bias vector.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-checkbox>
  <v-checkbox label="Go backwards" v-model="node.data.goBackwards" >
    <template v-slot:append>
      <v-tooltip text="If true, process the input sequence backwards and return the reversed sequence (default: false)">
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
  <v-checkbox label="stateful" v-model="node.data.stateful" >
    <template v-slot:append>
      <v-tooltip text="If true, the last state for each sample at index i in a batch will be used as initial
        state of the sample of index i in the following batch (default: false).
        You can set RNN layers to be 'stateful', which means that the states computed for the samples in one batch will be
        reused as initial states for the samples in the next batch. This assumes a one-to-one mapping between samples in
        different successive batches.

        To enable 'statefulness':

        specify stateful: true in the layer constructor.
        specify a fixed batch size for your model, by passing
        if sequential model: batchInputShape: [...] to the first layer in your model.
        else for functional model with 1 or more Input layers: batchShape: [...] to all the first layers in your model.
        This is the expected shape of your inputs including the batch size. It should be a tuple of integers, e.g., [32,
        10, 100].
        specify shuffle: false when calling LayersModel.fit().
        To reset the state of your model, call resetStates() on either the specific layer or on the entire model.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-checkbox>
  <v-checkbox label="Unroll" v-model="node.data.unroll" >
    <template v-slot:append>
      <v-tooltip text="If true, the network will be unrolled, else a symbolic loop will be used. Unrolling can
        speed up a RNN, although it tends to be more memory-intensive. Unrolling is only suitable for short sequences
        (default: false). Porting Note: tfjs-layers has an imperative backend. RNNs are executed with normal TypeScript
        control flow. Hence this property is inapplicable and ignored in tfjs-layers.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-checkbox>
  <v-text-field v-model="node.data.inputDim" :rules="posetiv" label="Input dimension" type="number">
    <template v-slot:append>
      <v-tooltip text="Dimensionality of the input (integer). This option (or alternatively, the option inputShape) is required when this layer is used as the first layer in a model.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.inputLength" :rules="posetiv" label="Input length" type="number">
    <template v-slot:append>
      <v-tooltip text="Length of the input sequences, to be specified when it is constant. This argument is
        required if you are going to connect Flatten then Dense layers upstream (without it, the shape of the dense
        outputs cannot be computed). Note that if the recurrent layer is not the first layer in your model, you would need
        to specify the input length at the level of the first layer (e.g., via the inputShape option).">
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