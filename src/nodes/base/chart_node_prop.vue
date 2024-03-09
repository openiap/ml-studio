<template>
  chart #{{ node.id }}
  <v-text-field v-model="node.label" :counter="30" :rules="nameRules" label="Name" required />
  <v-select 
  v-model="node.data.type"
  :items="types"
  item-title="name"
  item-value="id"
  label="Select chart type"
  outlined />
  <div ref="editorContainer" id="container" style="width: 100%; height: 400px; border: 1px solid grey"></div>
  <v-select clearable
  v-model="node.data.indexAxis"
  :items="[{id: 'x', name: 'X'}, {id: 'y', name: 'Y'}]"
  item-title="name"
  item-value="id"
  label="select index axis"
  outlined />
  <v-select clearable
  v-model="node.data.appendmode"
  :items="[{id: 'mergevaluesaddlabels', name: 'merge values/add labels'}, {id: 'mergevaluessetlabels', name: 'add datasets/overwrite labels'}]"
  item-title="name"
  item-value="id"
  label="Append mode"
  outlined >
  <template v-slot:append>
    <v-tooltip text="If not select, function values will be set as graph value. If selected, will either append all new datasets or merge dataset values based on dataset label or index">
      <template v-slot:activator="{ props }">
        <v-icon v-bind="props" color="primary">mdi-information</v-icon>
      </template>
    </v-tooltip>
  </template>
  </v-select> 

  <v-text-field v-model="node.data.appendmaxdatasetvalues" :rules="posetiv" label="Max values" type="number" 
  v-if="node.data.appendmode == 'mergevaluesaddlabels'">
    <template v-slot:append>
      <v-tooltip text="Allow only this number of values per dataset in the graph">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>

  <v-text-field v-model="node.data.appendmaxdatasets" :rules="posetiv" label="Max datasets" type="number" 
  v-if="node.data.appendmode == 'mergevaluessetlabels'">
    <template v-slot:append>
      <v-tooltip text="Allow only this number of datasets in the graph">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" color="primary">mdi-information</v-icon>
        </template>
      </v-tooltip>
    </template>
  </v-text-field>


  <v-text-field v-model="node.data.minwidth" :rules="minwidthrule" label="Minimum width" type="number" >
  </v-text-field>

  <v-checkbox label="Stacked" v-model="node.data.stacked" >
  </v-checkbox>

  <v-checkbox label="Animated" v-model="node.data.animated" >
  </v-checkbox>

</template>
<script>
import { openiap } from "@openiap/jsapi";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
let monacoInstance = null;
import eventBus from '../../eventBus'



export default {
  data() {
    return {
      models: [],
      monacoModel: null,
      monacoInstance: null,
      nameRules: [
        v => !!v || 'Label is required',
        v => (v && v.length <= 30) || 'Label must be less than 10 characters',
        v => (v && v.length > 5) || 'Label must be more than 5 characters'
      ],
      minwidthrule: [ 
        v => (v == null || v == "" || (parseFloat(v) > 30 )) || 'Value must be more than 30'
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
      ],

      types: [
        { id: 'bar', name: 'bar' },
        { id: 'line', name: 'line' },
        { id: 'pie', name: 'pie' },
        { id: 'doughnut', name: 'doughnut' },
        { id: 'scatter', name: 'scatter' },
        { id: 'bubble', name: 'bubble' },
        { id: 'polarArea', name: 'polarArea' },
        { id: 'radar', name: 'radar' }]
    }
  },
  props: {
    node: Object,
    client: openiap
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
      if(this.node.data.func == null) this.node.data.func = ""
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
        // has errors ?
        const hasErrrors = monaco.editor.getModelMarkers().filter(x => x.severity === monaco.MarkerSeverity.Error).length > 0;
        if(hasErrrors) {
          this.node.data.func = monacoInstance.getValue();
          return;
        }
        this.node.data.func = monacoInstance.getValue();
        // if(this.node.data.autosave == true) {
        //   eventBus.$emit('workflow-save')
        // }
      });
    }
  },
  beforeUnmount() {
    monacoInstance.dispose();
  },
}
</script>
