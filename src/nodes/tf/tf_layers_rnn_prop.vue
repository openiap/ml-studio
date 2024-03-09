<template>
  rnn {{ node.id }}
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
  <v-checkbox label="Unit forget bias" v-model="node.data.unitForgetBias" >
    <template v-slot:append>
      <v-tooltip text="If true, add 1 to the bias of the forget gate at initialization. Setting it to true will
        also force biasInitializer = 'zeros'. This is recommended in Jozefowicz et al.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-checkbox>
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