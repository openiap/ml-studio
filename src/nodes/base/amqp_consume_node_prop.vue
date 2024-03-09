<template>
  consume #{{ node.id }}
  <v-text-field v-model="node.label" :counter="30" :rules="nameRules" label="Name" required />

  <v-text-field v-model="node.data.queuename" :rules="text60" :counter="60" label="queue name" required>
    <template v-slot:append>
      <v-tooltip text="Queue name to listen on, this should be all lower case, no space or special chrecters">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-text-field v-model="node.data.output" :rules="text20" :counter="20" label="output field" required>
    <template v-slot:append>
      <v-tooltip text="msg field to receive the document">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-checkbox label="auto ack" v-model="node.data.autoack" >
    <template v-slot:append>
      <v-tooltip text="Send an ack to messages right away, with an empty payload, if not, you must use ab amqp ack node to send reply back">
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
      collections: [],
      nameRules: [
        v => !!v || 'Label is required',
        v => (v && v.length <= 30) || 'Label must be less than 10 characters',
        v => (v && v.length > 5) || 'Label must be more than 5 characters'
      ],
      zerotoone: [
        v => (v == null || v == "" || (parseFloat(v) > 0 && parseFloat(v) <= 1)) || 'Value must be between 0 and 1 and more than 0'
      ],
      posetiv: [
        v => (v == null || v == "" || (parseFloat(v) > 0)) || 'Value must be more than 0'
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
    this.client.ListCollections().then((collections) => {
      this.collections = collections;
    });
  }
}


</script>
