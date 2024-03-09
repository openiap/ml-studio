<template>
  text #{{ node.id }}
  <v-text-field v-model="node.label" :counter="30" :rules="nameRules" label="Name" required />
  <v-text-field v-model="node.data.output" :rules="text60" label="Output field" required />
  <v-select clearable
  v-if="(node.data.data == null || node.data.data == '') && (node.data.url == null || node.data.url == '')"
  v-model="node.data.file"
  :items="files"
  item-title="metadata.name"
  item-value="_id"
  label="Filename"
  outlined >
  </v-select>
  <v-text-field v-model="node.data.url" :rules="text200" :counter="200" label="Load from url"
  v-if="(node.data.file == null || node.data.file == '') && (node.data.data == null || node.data.data == '')">
  </v-text-field>
  <v-textarea v-model="node.data.data" label="text data" 
  v-if="(node.data.file == null || node.data.file == '') && (node.data.url == null || node.data.url == '')"></v-textarea>
</template>
<script>
import { openiap } from "@openiap/jsapi";
export default {
  data() {
    return {
      files: [],
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
    // regex, files ending with .csv
    this.client.Query({ collectionname: "files", query: {"metadata.name": /.*\.txt$/}}).then((files) => {
      this.files = files;
    });
  }
}
</script>
<style scoped>
legend {
  white-space: nowrap;
  width: 100px; 
}
</style>
