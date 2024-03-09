<template>
  <extvueflow :client="client" :modelValue="flow" :nodetypes="nodetypes" v-if="nodetypes && nodetypes.length > 0"
  @update:modelValue="SaveWorkflow">
  </extvueflow>
</template>
<script lang="ts">
import { defineComponent, ref, Ref, markRaw, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import extvueflow from './ExtVueflow.vue';
import { openiap } from "@openiap/jsapi";
import { Panel, VueFlow, isNode, useVueFlow } from '@vue-flow/core'

export default defineComponent({
  props: {
    id: String
  },  
  components: {
    extvueflow
  },
  data() {
    return {
      watch: "",
    };
  },
  setup(props) {
    const store = useStore();
    const router = useRouter();
    const instance = useVueFlow({})
    const client = ref<openiap>(store.getters.Client);
    const Signedin = ref<boolean>(store.getters.Signedin);
    const flow = ref<any>({});

  // const inject:any = (await import('./inject_node.vue')).default;
  // const tfmodel:any = (await import('./tf_model.vue')).default;
  // nodeTypes.value = {
  //   "inject": markRaw(defineComponent(inject)),
  //   "tf_model": markRaw(defineComponent(tfmodel)),
  // };

    const nodetypes: Ref<any[]> = ref([]);

    watch(() => store.getters.Client, (newClient) => {
      client.value = newClient;
    });
    watch(() => store.getters.Signedin, (newSignedin) => {
      Signedin.value = newSignedin;
    });
    watch(() => flow, (newFlow) => {
    });
    return {
      client,
      Signedin,
      instance,
      flow,
      nodetypes,
      router
    };
  },
  mounted() {
    this.GetWorkflow()
    this.setNodes();
  },
  watch: {
    Signedin: {
      handler: function (val) {
        if (val) {
          this.GetWorkflow()
          this.setNodes();
        }
      },
      immediate: true
    },
  },
  methods: {
    async onWatch(operation, document) {
      console.log("onWatch " + operation, "reloading", document._id)
      try {
        await this.GetWorkflow();        
      } catch (error) {
        console.error(error);         
      }
    },
    async GetWorkflow() {
      if(this.client == null || this.client.Query == null) { console.warn("GetWorkflow: client is null"); return; }
      if(this.id == null || this.id == "") {
        this.flow.value = {
          _id: "",
          name: "new model",
          _type: "model",
          modeltype: "layers",
          nodes: [{
            id: '1',
            type: 'tf_model_start',
            label: 'START',
            position: { x: 1, y: 1 }
          },
          {
            id: '2',
            type: 'tf_sequential',
            label: 'sequential',
            position: { x: 100, y: 1 }
          },
          {
            id: '200',
            type: 'tf_model_end',
            label: 'end',
            position: { x: 500, y: 1 }
          }
          ],
          edges: [  
          { id: '1-2', source: '1', sourceHandle: 'source', target: '2' },
          ],
          position: [  163, 214],
          zoom: 1.1
        };
        return;
      }
      var workflows = await this.client.Query<any>({collectionname: 'mlflows', query: {_id: this.id}});
      this.flow.value = workflows[0]; 
      if(this.watch == "") {
        const paths = ["$.[?(@._id == '" + this.id + "')]"];
        this.watch = await this.client.Watch({collectionname: 'mlflows', paths }, this.onWatch);
      }
    },
    async SaveWorkflow(newFlow) {
      if (this.flow.value._id == null || this.flow.value._id == "") {
        this.flow.value = await this.client.InsertOne({ collectionname: "mlflows", item: this.flow.value });
        if(this.watch == "") {
          const paths = ["$.[?(@._id == '" + this.flow.value._id + "')]"];
          this.watch = await this.client.Watch({ collectionname: 'mlflows', paths }, this.onWatch);
        }
      } else {
        this.flow.value = await this.client.UpdateOne({ collectionname: "mlflows", item: this.flow.value });
      }
      this.router.replace({ path: `/Model/${this.flow.value._id}` })

    },
    async setNodes() {
      if(this.client == null || this.client.Query == null) { return; }
      // @ts-ignore
      var nodetypes = {...this.nodetypes};
      // @ts-ignore
      this.nodetypes = null;


    const debug_node = (await import('../nodes/base/debug_node.vue')).default
    const debug_node_prop = (await import('../nodes/base/debug_node_prop.vue')).default

    const table_node = (await import('../nodes/base/table_node.vue')).default
    const table_node_prop = (await import('../nodes/base/table_node_prop.vue')).default

    const chart_node = (await import('../nodes/base/chart_node.vue')).default
    const chart_node_prop = (await import('../nodes/base/chart_node_prop.vue')).default

    const plotly_node = (await import('../nodes/base/plotly_node.vue')).default
    const plotly_node_prop = (await import('../nodes/base/plotly_node_prop.vue')).default

    const tf_sequential = (await import('../nodes/tf/tf_sequential.vue')).default
    const tf_sequential_prop = (await import('../nodes/tf/tf_sequential_prop.vue')).default

    const tf_op = (await import('../nodes/tf/tf_op.vue')).default
    const tf_op_prop = (await import('../nodes/tf/tf_op_prop.vue')).default

    const tf_model_start = (await import('../nodes/tf/tf_model_start.vue')).default
    const tf_model_start_prop = (await import('../nodes/tf/tf_model_start_prop.vue')).default

    const tf_model_end = (await import('../nodes/tf/tf_model_end.vue')).default
    const tf_model_end_prop = (await import('../nodes/tf/tf_model_end_prop.vue')).default

    const tf_layers_activation = (await import('../nodes/tf/tf_layers_activation.vue')).default
    const tf_layers_activation_prop = (await import('../nodes/tf/tf_layers_activation_prop.vue')).default

    const tf_layers_batchNormalization = (await import('../nodes/tf/tf_layers_batchNormalization.vue')).default
    const tf_layers_batchNormalization_prop = (await import('../nodes/tf/tf_layers_batchNormalization_prop.vue')).default

    const tf_layers_dense = (await import('../nodes/tf/tf_layers_dense.vue')).default
    const tf_layers_dense_prop = (await import('../nodes/tf/tf_layers_dense_prop.vue')).default

    const tf_layers_dropout = (await import('../nodes/tf/tf_layers_dropout.vue')).default
    const tf_layers_dropout_prop = (await import('../nodes/tf/tf_layers_dropout_prop.vue')).default

    const tf_layers_elu = (await import('../nodes/tf/tf_layers_elu.vue')).default
    const tf_layers_elu_prop = (await import('../nodes/tf/tf_layers_elu_prop.vue')).default

    const tf_layers_embedding = (await import('../nodes/tf/tf_layers_embedding.vue')).default
    const tf_layers_embedding_prop = (await import('../nodes/tf/tf_layers_embedding_prop.vue')).default

    const tf_layers_flatten = (await import('../nodes/tf/tf_layers_flatten.vue')).default
    const tf_layers_flatten_prop = (await import('../nodes/tf/tf_layers_flatten_prop.vue')).default

    const tf_layers_layerNormalization = (await import('../nodes/tf/tf_layers_layerNormalization.vue')).default
    const tf_layers_layerNormalization_prop = (await import('../nodes/tf/tf_layers_layerNormalization_prop.vue')).default

    const tf_layers_leakyReLU = (await import('../nodes/tf/tf_layers_leakyReLU.vue')).default
    const tf_layers_leakyReLU_prop = (await import('../nodes/tf/tf_layers_leakyReLU_prop.vue')).default

    const tf_layers_permute = (await import('../nodes/tf/tf_layers_permute.vue')).default
    const tf_layers_permute_prop = (await import('../nodes/tf/tf_layers_permute_prop.vue')).default

    const tf_layers_prelu = (await import('../nodes/tf/tf_layers_prelu.vue')).default
    const tf_layers_prelu_prop = (await import('../nodes/tf/tf_layers_prelu_prop.vue')).default

    const tf_layers_reLU = (await import('../nodes/tf/tf_layers_reLU.vue')).default
    const tf_layers_reLU_prop = (await import('../nodes/tf/tf_layers_reLU_prop.vue')).default

    const tf_layers_repeatVector = (await import('../nodes/tf/tf_layers_repeatVector.vue')).default
    const tf_layers_repeatVector_prop = (await import('../nodes/tf/tf_layers_repeatVector_prop.vue')).default

    const tf_layers_reshape = (await import('../nodes/tf/tf_layers_reshape.vue')).default
    const tf_layers_reshape_prop = (await import('../nodes/tf/tf_layers_reshape_prop.vue')).default

    const tf_layers_softmax = (await import('../nodes/tf/tf_layers_softmax.vue')).default
    const tf_layers_softmax_prop = (await import('../nodes/tf/tf_layers_softmax_prop.vue')).default

    const tf_layers_spatialDropout1d = (await import('../nodes/tf/tf_layers_spatialDropout1d.vue')).default
    const tf_layers_spatialDropout1d_prop = (await import('../nodes/tf/tf_layers_spatialDropout1d_prop.vue')).default

    const tf_layers_thresholdedReLU = (await import('../nodes/tf/tf_layers_thresholdedReLU.vue')).default
    const tf_layers_thresholdedReLU_prop = (await import('../nodes/tf/tf_layers_thresholdedReLU_prop.vue')).default

    const tf_layers_averagePooling1d = (await import('../nodes/tf/tf_layers_averagePooling1d.vue')).default
    const tf_layers_averagePooling1d_prop = (await import('../nodes/tf/tf_layers_averagePooling1d_prop.vue')).default

    const tf_layers_convLstm2d = (await import('../nodes/tf/tf_layers_convLstm2d.vue')).default
    const tf_layers_convLstm2d_prop = (await import('../nodes/tf/tf_layers_convLstm2d_prop.vue')).default

    const tf_layers_convLstm2dCell = (await import('../nodes/tf/tf_layers_convLstm2dCell.vue')).default
    const tf_layers_convLstm2dCell_prop = (await import('../nodes/tf/tf_layers_convLstm2dCell_prop.vue')).default

    const tf_layers_gru = (await import('../nodes/tf/tf_layers_gru.vue')).default
    const tf_layers_gru_prop = (await import('../nodes/tf/tf_layers_gru_prop.vue')).default
    
    const tf_layers_lstm = (await import('../nodes/tf/tf_layers_lstm.vue')).default
    const tf_layers_lstm_prop = (await import('../nodes/tf/tf_layers_lstm_prop.vue')).default

    const tf_layers_rnn = (await import('../nodes/tf/tf_layers_rnn.vue')).default
    const tf_layers_rnn_prop = (await import('../nodes/tf/tf_layers_rnn_prop.vue')).default

    const tf_layers_simpleRNN = (await import('../nodes/tf/tf_layers_simpleRNN.vue')).default
    const tf_layers_simpleRNN_prop = (await import('../nodes/tf/tf_layers_simpleRNN_prop.vue')).default


    const tf_layers_Layer = (await import('../nodes/tf/tf_layers_Layer.vue')).default
    const tf_layers_Layer_prop = (await import('../nodes/tf/tf_layers_Layer_prop.vue')).default

    this.nodetypes = [
      { name: "op", type: "tf_op", node: markRaw(tf_op), editor: markRaw(tf_op_prop) },
      { name: "start", type: "tf_model_start", node: markRaw(tf_model_start), editor: markRaw(tf_model_start_prop) },
      { name: "end", type: "tf_model_end", node: markRaw(tf_model_end), editor: markRaw(tf_model_end_prop) },

      { name: "debug", type: "debug", node: markRaw(debug_node), editor: markRaw(debug_node_prop) },
      { name: "table", type: "table", node: markRaw(table_node), editor: markRaw(table_node_prop) },
      { name: "chart", type: "chart", node: markRaw(chart_node), editor: markRaw(chart_node_prop) },
      { name: "plotly", type: "plotly", node: markRaw(plotly_node), editor: markRaw(plotly_node_prop) },

      { name: "sequential", type: "tf_sequential", node: markRaw(tf_sequential), editor: markRaw(tf_sequential_prop) },

      { name: "activation", type: "tf_layers_activation", node: markRaw(tf_layers_activation), editor: markRaw(tf_layers_activation_prop) },
      { name: "batchNormalization", type: "tf_layers_batchNormalization", node: markRaw(tf_layers_batchNormalization), editor: markRaw(tf_layers_batchNormalization_prop) },
      { name: "dense", type: "tf_layers_dense", node: markRaw(tf_layers_dense), editor: markRaw(tf_layers_dense_prop) },
      { name: "dropout", type: "tf_layers_dropout", node: markRaw(tf_layers_dropout), editor: markRaw(tf_layers_dropout_prop) },
      { name: "elu", type: "tf_layers_elu", node: markRaw(tf_layers_elu), editor: markRaw(tf_layers_elu_prop) },
      { name: "embedding", type: "tf_layers_embedding", node: markRaw(tf_layers_embedding), editor: markRaw(tf_layers_embedding_prop) },
      { name: "flatten", type: "tf_layers_flatten", node: markRaw(tf_layers_flatten), editor: markRaw(tf_layers_flatten_prop) },
      { name: "layerNormalization", type: "tf_layers_layerNormalization", node: markRaw(tf_layers_layerNormalization), editor: markRaw(tf_layers_layerNormalization_prop) },
      { name: "leakyReLU", type: "tf_layers_leakyReLU", node: markRaw(tf_layers_leakyReLU), editor: markRaw(tf_layers_leakyReLU_prop) },
      { name: "permute", type: "tf_layers_permute", node: markRaw(tf_layers_permute), editor: markRaw(tf_layers_permute_prop) },
      { name: "prelu", type: "tf_layers_prelu", node: markRaw(tf_layers_prelu), editor: markRaw(tf_layers_prelu_prop) },
      { name: "reLU", type: "tf_layers_reLU", node: markRaw(tf_layers_reLU), editor: markRaw(tf_layers_reLU_prop) },
      { name: "repeatVector", type: "tf_layers_repeatVector", node: markRaw(tf_layers_repeatVector), editor: markRaw(tf_layers_repeatVector_prop) },
      { name: "reshape", type: "tf_layers_reshape", node: markRaw(tf_layers_reshape), editor: markRaw(tf_layers_reshape_prop) },
      { name: "softmax", type: "tf_layers_softmax", node: markRaw(tf_layers_softmax), editor: markRaw(tf_layers_softmax_prop) },
      { name: "spatialDropout1d", type: "tf_layers_spatialDropout1d", node: markRaw(tf_layers_spatialDropout1d), editor: markRaw(tf_layers_spatialDropout1d_prop) },
      { name: "thresholdedReLU", type: "tf_layers_thresholdedReLU", node: markRaw(tf_layers_thresholdedReLU), editor: markRaw(tf_layers_thresholdedReLU_prop) },
      { name: "averagePooling1d", type: "tf_layers_averagePooling1d", node: markRaw(tf_layers_averagePooling1d), editor: markRaw(tf_layers_averagePooling1d_prop) },

      { name: "convLstm2d", type: "tf_layers_convLstm2d", node: markRaw(tf_layers_convLstm2d), editor: markRaw(tf_layers_convLstm2d_prop) },
      { name: "convLstm2dCell", type: "tf_layers_convLstm2dCell", node: markRaw(tf_layers_convLstm2dCell), editor: markRaw(tf_layers_convLstm2dCell_prop) },
      { name: "gru", type: "tf_layers_gru", node: markRaw(tf_layers_gru), editor: markRaw(tf_layers_gru_prop) },
      { name: "lstm", type: "tf_layers_lstm", node: markRaw(tf_layers_lstm), editor: markRaw(tf_layers_lstm_prop) },
      { name: "rnn", type: "tf_layers_rnn", node: markRaw(tf_layers_rnn), editor: markRaw(tf_layers_rnn_prop) },
      { name: "simpleRNN", type: "tf_layers_simpleRNN", node: markRaw(tf_layers_simpleRNN), editor: markRaw(tf_layers_simpleRNN_prop) },
      

      

      
      { name: "Custom", type: "tf_layers_Layer", node: markRaw(tf_layers_Layer), editor: markRaw(tf_layers_Layer_prop) },
    ];

    }
  }
});

</script>
