<template>
  query #{{ node.id }}
  <v-text-field v-model="node.label" :counter="30" :rules="nameRules" label="Name" required />
  <v-select 
  v-model="node.data.collectionname"
  :items="collections"
  item-title="name"
  item-value="name"
  label="Collection to query"
  outlined >
  </v-select>
  <v-text-field v-model="node.data.output" :rules="text20" :counter="20" label="output field" required>
    <template v-slot:append>
      <v-tooltip text="msg field to receive the document">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
  <v-textarea v-model="node.data.query" label="Mongodb query"></v-textarea>
  <v-text-field v-model="node.projection" :counter="30" label="Mongodb projection" />
  <v-text-field v-model="node.orderby" :counter="30" label="Mongodb orderby" />
  <v-text-field v-model="node.orderby" :counter="30" label="Mongodb orderby" />
  <v-text-field v-model="node.data.top" :rules="posetiv" label="top" type="number" />
  <v-text-field v-model="node.data.skip" :rules="posetiv" label="Skip" type="number" />
</template>
<script>
import { openiap } from "@openiap/jsapi";

export default {
  data() {
    return {
      collections: []
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
<style scoped>
legend {
  white-space: nowrap;
  width: 150px; 
}
</style>
