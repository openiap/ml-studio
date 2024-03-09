<template>
  function #{{ node.id }}
  <v-text-field v-model="node.label" :counter="30" :rules="nameRules" label="Name" required />
  <div ref="editorContainer" id="container" style="width: 100%; height: 600px; border: 1px solid grey"></div>
</template>
<script>
import { openiap } from "@openiap/jsapi";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
let monacoInstance = null;
export default {
  props: {
    node: Object,
    client: openiap
  },
  data() {
    return {
      id: "",
      monacoModel: null,
      monacoInstance: null,
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
  watch: {
    node: {
      handler: function (val, oldVal) {
        if (monacoInstance && this.id != this.node.id) {
          this.id = this.node.id
          monacoInstance.setValue(val.data.func);
        }
      },
      deep: true
    }
  },
  mounted() {
    this.initializeMonaco();
  },
  methods: {
    initializeMonaco() {
      this.id = this.node.id
      monacoInstance = monaco.editor.create(this.$refs.editorContainer, {
        value: this.node.data.func,
        language: 'typescript',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: {
          enabled: false
        }
      });
      monacoInstance.onDidChangeModelContent((e) => {
        this.node.data.func = monacoInstance.getValue();
      });
    }
  },
  beforeUnmount() {
    monacoInstance.dispose();
  },
}
</script>
<style scoped>
legend {
  white-space: nowrap;
  width: 100px; 
}
</style>
