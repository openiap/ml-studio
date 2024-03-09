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
    if(this.Signedin == true) {
      this.GetWorkflow()
    }
    this.setNodes();
  },

  watch: {
    Signedin: {
      handler: function (val, val2) {
        if (val == true && val2 != null) {
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
      if(this.client == null || this.client.Query == null) { console.log("client is null"); return; }
      if(this.id == null || this.id == "") {
        this.flow.value = {
          _id: "",
          name: "new Workflow",
          _type: "flow",
          nodes: [{
            id: "1",
            type: "tf_model",
            label: "Tensorflow model",
            position: { x: 200, y: 1 }
          },
          {
            id: "2",
            type: "inject",
            label: "Predict",
            position: { x: 1, y: 1 }
          },
          {
            id: "3",
            type: "table",
            label: "show result",
            position: { x: 495, y: -135 }
          },
          {
            id: "4",
            type: "inject",
            label: "Train",
            position: { x: 1, y: 100 }
          },
          {
            id: "5",
            type: "table",
            label: "show history",
            position: { x: 495, y: 135 }
          }],
          edges: [  
          { id: "2-1", source: "2", sourceHandle: "source", target: "1", targetHandle: "predict" },
          { id: "4-1", source: "4", sourceHandle: "source", target: "1", targetHandle: "fit" },
          { id: "1-3", source: "1", sourceHandle: "prediction", target: "3", targetHandle: "target" },
          { id: "1-5", source: "1", sourceHandle: "history", target: "5", targetHandle: "target" }
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
        const result = await this.client.InsertOne({ collectionname: "mlflows", item: this.flow.value });
        this.flow.value = result;
        if(this.watch == "") {
          const paths = ["$.[?(@._id == '" + this.flow.value._id + "')]"];
          this.watch = await this.client.Watch({ collectionname: 'mlflows', paths }, this.onWatch);
        }
      } else {
        await this.client.UpdateOne({ collectionname: "mlflows", item: this.flow.value });
      }
      this.router.replace({ path: `/Flow/${this.flow.value._id}` })

    },
    async setNodes() {
      if(this.client == null || this.client.Query == null) { return; }
      // @ts-ignore
      var nodetypes = {...this.nodetypes};
      // @ts-ignore
      this.nodetypes = null;


          // const inject:any = (await import('./inject_node.vue')).default;
    // const tfmodel:any = (await import('./tf_model.vue')).default;
    // nodeTypes.value = {
    //   "inject": markRaw(defineComponent(inject)),
    //   "tf_model": markRaw(defineComponent(tfmodel)),
    // };
    const inject_node = (await import('../nodes/base/inject_node.vue')).default
    const inject_node_prop = (await import('../nodes/base/inject_node_prop.vue')).default

    const debug_node = (await import('../nodes/base/debug_node.vue')).default
    const debug_node_prop = (await import('../nodes/base/debug_node_prop.vue')).default

    const table_node = (await import('../nodes/base/table_node.vue')).default
    const table_node_prop = (await import('../nodes/base/table_node_prop.vue')).default

    const function_node = (await import('../nodes/base/function_node.vue')).default
    const function_node_prop = (await import('../nodes/base/function_node_prop.vue')).default

    const amqp_consume_node = (await import('../nodes/base/amqp_consume_node.vue')).default
    const amqp_consume_node_prop = (await import('../nodes/base/amqp_consume_node_prop.vue')).default


    const tokenizer_encode = (await import('../nodes/util/tokenizer_encode.vue')).default
    const tokenizer_encode_prop = (await import('../nodes/util/tokenizer_encode_prop.vue')).default

    const tokenizer_embed = (await import('../nodes/util/tokenizer_embed.vue')).default
    const tokenizer_embed_prop = (await import('../nodes/util/tokenizer_embed_prop.vue')).default

    const UniversalSentenceEncoderQnA = (await import('../nodes/util/UniversalSentenceEncoderQnA.vue')).default
    const UniversalSentenceEncoderQnA_prop = (await import('../nodes/util/UniversalSentenceEncoderQnA_prop.vue')).default
    
    const tf_model = (await import('../nodes/tf/tf_model_node.vue')).default
    const tf_model_node_prop = (await import('../nodes/tf/tf_model_node_prop.vue')).default

    const tf_model_fit = (await import('../nodes/tf/tf_model_fit.vue')).default
    const tf_model_fit_prop = (await import('../nodes/tf/tf_model_fit_prop.vue')).default

    const tf_model_execute = (await import('../nodes/tf/tf_model_execute.vue')).default
    const tf_model_execute_prop = (await import('../nodes/tf/tf_model_execute_prop.vue')).default

    
    const chart_node = (await import('../nodes/base/chart_node.vue')).default
    const chart_node_prop = (await import('../nodes/base/chart_node_prop.vue')).default

    const plotly_node = (await import('../nodes/base/plotly_node.vue')).default
    const plotly_node_prop = (await import('../nodes/base/plotly_node_prop.vue')).default


    const csv_node = (await import('../nodes/base/csv_node.vue')).default
    const csv_node_prop = (await import('../nodes/base/csv_node_prop.vue')).default
    const json_node = (await import('../nodes/base/json_node.vue')).default
    const json_node_prop = (await import('../nodes/base/json_node_prop.vue')).default
    const text_node = (await import('../nodes/base/text_node.vue')).default
    const text_node_prop = (await import('../nodes/base/text_node_prop.vue')).default
    

    const findone_node = (await import('../nodes/base/findone_node.vue')).default
    const findone_node_prop = (await import('../nodes/base/findone_node_prop.vue')).default
    const query_node = (await import('../nodes/base/query_node.vue')).default
    const query_node_prop = (await import('../nodes/base/query_node_prop.vue')).default
    const watch_node = (await import('../nodes/base/watch_node.vue')).default
    const watch_node_prop = (await import('../nodes/base/watch_node_prop.vue')).default

    const tf_util_shuffle = (await import('../nodes/tf/tf_util_shuffle.vue')).default
    const tf_util_shuffle_prop = (await import('../nodes/tf/tf_util_shuffle_prop.vue')).default

    this.nodetypes = [
      { name: "inject", type: "inject", node: markRaw(inject_node), editor: markRaw(inject_node_prop) },
      { name: "debug", type: "debug", node: markRaw(debug_node), editor: markRaw(debug_node_prop) },
      { name: "table", type: "table", node: markRaw(table_node), editor: markRaw(table_node_prop) },
      { name: "chart", type: "chart", node: markRaw(chart_node), editor: markRaw(chart_node_prop) },
      { name: "plotly", type: "plotly", node: markRaw(plotly_node), editor: markRaw(plotly_node_prop) },
      { name: "csv", type: "csv", node: markRaw(csv_node), editor: markRaw(csv_node_prop) },
      { name: "json", type: "json", node: markRaw(json_node), editor: markRaw(json_node_prop) },
      { name: "text", type: "text", node: markRaw(text_node), editor: markRaw(text_node_prop) },      
      { name: "function", type: "function", node: markRaw(function_node), editor: markRaw(function_node_prop) },
      { name: "consume", type: "amqp_consume", node: markRaw(amqp_consume_node), editor: markRaw(amqp_consume_node_prop) },

      { name: "encode", type: "tokenizer_encode", node: markRaw(tokenizer_encode), editor: markRaw(tokenizer_encode_prop) },
      { name: "embed", type: "tokenizer_embed", node: markRaw(tokenizer_embed), editor: markRaw(tokenizer_embed_prop) },
      { name: "Universal QnA", type: "UniversalSentenceEncoderQnA", node: markRaw(UniversalSentenceEncoderQnA), editor: markRaw(UniversalSentenceEncoderQnA_prop) },
      
      
      { name: "findone", type: "findone", node: markRaw(findone_node), editor: markRaw(findone_node_prop) },
      { name: "query", type: "query", node: markRaw(query_node), editor: markRaw(query_node_prop) },
      { name: "watch", type: "watch", node: markRaw(watch_node), editor: markRaw(watch_node_prop) },
      { name: "tf_model", type: "tf_model", node: markRaw(tf_model), editor: markRaw(tf_model_node_prop) },
      { name: "Train model", type: "tf_model_fit", node: markRaw(tf_model_fit), editor: markRaw(tf_model_fit_prop) },
      { name: "Execute model", type: "tf_model_execute", node: markRaw(tf_model_execute), editor: markRaw(tf_model_execute_prop) },
      
      
      { name: "tf_util_shuffle", type: "tf_util_shuffle", node: markRaw(tf_util_shuffle), editor: markRaw(tf_util_shuffle_prop) },
    ];

    }
  }
});

</script>
