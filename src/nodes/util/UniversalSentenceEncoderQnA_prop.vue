<template>
  QnA #{{ node.id }}

  <v-text-field v-model="node.label" :counter="30" :rules="nameRules" label="Name" required />
  <v-select 
  v-model="node.data.model"
  :items="models"
  item-title="name"
  item-value="_id"
  label="QnA model"
  outlined >
    <template v-slot:append>
      <v-btn @click="resetModel" v-if="node.data.model">
        <v-icon color="error">mdi-delete</v-icon></v-btn>
      <v-btn v-if="node.data.model" :to="{ name: 'ModelWithId', params: { id: node.data.model }}" >
        <v-icon color="primary">mdi-open-in-new</v-icon></v-btn>
    </template>
  </v-select>
  <v-text-field v-model="node.data.queries" :rules="text60" label="Queries field" required />
  <v-text-field v-model="node.data.responses" :rules="text60" label="Responses field" required />
  <v-text-field v-model="node.data.contexts" :rules="text60" label="contexts field" required />
  <v-text-field v-model="node.data.tokenizer" :rules="text60" label="Tokenizer field" required />

</template>
<script>
import { openiap } from "@openiap/jsapi";
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
    this.client.Query({ collectionname: "mlflows", query: {"_type": "model"}}).then((models) => {
      this.models = models;
    });
  }
}
</script>