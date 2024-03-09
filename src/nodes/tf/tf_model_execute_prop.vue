<template>
  model execute #{{ node.id }}
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
  <v-text-field v-model="node.data.inputs" :rules="text20" :counter="20" label="Inputs field" required>
  </v-text-field>
  <v-text-field v-model="node.data.outputs" :rules="text20" :counter="20" label="Outputs field" required>
  </v-text-field>
  <v-text-field v-model="node.data.results" :rules="text20" :counter="20" label="Results field" required>
  </v-text-field>
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