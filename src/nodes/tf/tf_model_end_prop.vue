<template>
  end {{ node.id }}
  <v-text-field v-model="node.label" :counter="30" :rules="nameRules" label="Name" required />
  <v-select 
  v-model="node.data.loss"
  :items="[ {id: 'absoluteDifference', name: 'absoluteDifference'}, {id: 'computeWeightedLoss', name: 'computeWeightedLoss'}, {id: 'cosineDistance', name: 'cosineDistance'}, {id: 'hingeLoss', name: 'hingeLoss'}, {id: 'huberLoss', name: 'huberLoss'}, {id: 'logLoss', name: 'logLoss'}, {id: 'meanSquaredError', name: 'meanSquaredError'}, {id: 'categoricalCrossentropy', name: 'categoricalCrossentropy'}, {id: 'softmaxCrossEntropy', name: 'softmaxCrossEntropy'}, {id: 'sigmoidCrossEntropy', name: 'sigmoidCrossEntropy'}]"
  item-title="name"
  item-value="id"
  label="Loss function"
  outlined required />
  <v-select 
  v-model="node.data.optimizer"
  :items="[ {id: 'sgd', name: 'sgd'}, {id: 'momentum', name: 'momentum'}, {id: 'adagrad', name: 'adagrad'}, {id: 'adadelta', name: 'adadelta'}, {id: 'adam', name: 'adam'}, {id: 'adamax', name: 'adamax'}, {id: 'rmsprop', name: 'rmsprop'}]"
  item-title="name"
  item-value="id"
  label="Optimizer"
  outlined required />
  <v-text-field v-model="node.data.learningrate" :rules="zerotoone" label="Learning rate" type="number">
    <template v-slot:append>
      <v-tooltip text="The learning rate to use for the algorithm">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.momentum" :rules="posetiv" label="Momentum" type="number"
    v-if="node.data.optimizer == 'momentum' || node.data.optimizer == 'rmsprop'">
    <template v-slot:append>
      <v-tooltip text="The momentum to use for the momentum gradient descent algorithm.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-checkbox label="Use nesterov" v-model="node.data.useNesterov" 
    v-if="node.data.optimizer == 'momentum'">
  </v-checkbox>
  <v-text-field v-model="node.data.initialAccumulatorValue" :rules="posetiv" label="Initial accumulator value" type="number"
    v-if="node.data.optimizer == 'adagrad'">
    <template v-slot:append>
      <v-tooltip text="Starting value for the accumulators, must be positive.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.initialAccumulatorValue" :rules="posetiv" label="Initial accumulator value" type="number"
    v-if="node.data.optimizer == 'adadelta'">
    <template v-slot:append>
      <v-tooltip text="Starting value for the accumulators, must be positive.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.rho" :rules="posetiv" label="rho" type="number"
    v-if="node.data.optimizer == 'adadelta'">
    <template v-slot:append>
      <v-tooltip text="The learning rate decay over each update.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.epsilon" :rules="posetiv" label="Epsilon" type="number"
    v-if="node.data.optimizer == 'adadelta' || node.data.optimizer == 'adam' || node.data.optimizer == 'adamax' || node.data.optimizer == 'rmsprop'">
    <template v-slot:append>
      <v-tooltip text="Small float added to the variance to avoid dividing by zero. Defaults to 1e-3.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.beta1" :rules="posetiv" label="beta1" type="number"
    v-if="node.data.optimizer == 'adam' || node.data.optimizer == 'adamax'">
    <template v-slot:append>
      <v-tooltip text="The exponential decay rate for the 1st moment estimates.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.beta2" :rules="posetiv" label="beta2" type="number"
    v-if="node.data.optimizer == 'adam' || node.data.optimizer == 'adamax'">
    <template v-slot:append>
      <v-tooltip text="The exponential decay rate for the 2nd moment estimates.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.decay" :rules="posetiv" label="decay" type="number"
    v-if="node.data.optimizer == 'adamax' || node.data.optimizer == 'rmsprop'">
    <template v-slot:append>
      <v-tooltip text="The learning rate decay over each update.">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-checkbox label="Centered" v-model="node.data.centered" 
    v-if="node.data.optimizer == 'momentum'">
    <template v-slot:append>
      <v-tooltip text="If true, gradients are normalized by the estimated variance of the gradient.">
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