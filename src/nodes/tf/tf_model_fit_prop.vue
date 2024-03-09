<template>
  model fit #{{ node.id }}
  <v-text-field v-model="node.label" :counter="30" :rules="nameRules" label="Name" required />
  <v-select 
  v-model="node.data.model"
  :items="models"
  item-title="name"
  item-value="_id"
  label="Model to train"
  outlined >
    <template v-slot:append>
      <v-btn @click="resetModel" v-if="node.data.model">
        <v-icon color="error">mdi-delete</v-icon></v-btn>
      <v-btn v-if="node.data.model" :to="{ name: 'ModelWithId', params: { id: node.data.model }}" >
        <v-icon color="primary">mdi-open-in-new</v-icon></v-btn>
      <!-- <router-link :to="{ name: 'ModelWithId', params: { id: node.data.model }}" target="_blank" class="btn">
        <v-icon color="primary">mdi-open-in-new</v-icon>
      </router-link> -->
    </template>
  </v-select>
  <v-text-field v-model="node.data.x" :rules="text20" :counter="20" label="X / Training data" required>
  </v-text-field>
  <v-text-field v-model="node.data.y" :rules="text20" :counter="20" label="Y / Labels" required>
  </v-text-field>
  <v-text-field v-model="node.data.output" :rules="text20" :counter="20" label="Output field" required>
  </v-text-field>
  <v-text-field v-model="node.data.epoch" :rules="posetivrequired" label="Number of epoch" type="number" required >
    <template v-slot:append>
      <v-tooltip text="If nextdata is linked, will use epoch 1 for each fit, and keep track of epoch in msg._databatch">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.validationSplit" :rules="zerotoone" label="validate %" type="number" >
    <template v-slot:append>
      <v-tooltip text="If nextdata is linked, will use epoch 1 for each fit, and keep track of epoch in msg._databatch">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.batchSize" :rules="posetiv" label="Batch size" type="number" >
  </v-text-field>
  <v-select 
  v-model="node.data.traingraph"
  :items="[{id: 'loss', name: 'Loss'}, {id: 'acc', name: 'Accuracy'}, {id: 'mse', name: 'meanSquaredError'}, {id: 'val_loss', name: 'Validate Loss'}, {id: 'val_acc', name: 'Validate Accuracy'}, {id: 'val_mse', name: 'Validate meanSquaredError'}]"
  item-title="name"
  item-value="id"
  label="Inner graph"
  outlined >
  </v-select>
  <v-checkbox label="Shuffle data" v-model="node.data.shuffle" >
  </v-checkbox>
  <v-checkbox label="Reset model before first fit" v-model="node.data.resetmodel" >
  </v-checkbox>
  <v-checkbox label="Send weights after each epoch" v-model="node.data.sendweights" >
    <template v-slot:append>
      <v-tooltip text="If enabled will send model weights after each epoch, if disabled will send weight differences. Do not enable on big models">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-checkbox>
</template>

<script>
import { openiap } from "@openiap/jsapi";
import eventBus from '../../eventBus'

export default {
  data() {
    return {
      models: [],
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
    eventBus.$on('receive-node-uievent', this.onReceiveUIEvent)
    this.client.Query({ collectionname: "mlflows", query: {"_type": "model"}}).then((models) => {
      this.models = models;
    });
  },
  beforeUnmount() {
    eventBus.$off('receive-node-uievent', this.onReceiveUIEvent);
  },
  methods: {
    resetModel() {
      eventBus.$emit('send-node-uievent', {id: this.node.id}, {"command": "deletemodel"})
    },
    onReceiveUIEvent(config, data) {
      if(config.id == this.node.id) {
        console.log("received UI event", data)
      }
    }
  }
}


</script>