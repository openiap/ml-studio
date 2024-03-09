<template>
  <div class="node-tf_model_fit">
    <div>{{ node.label }}</div>
    <div :style="canvasWrapperStyle" v-if="node.data.traingraph != null && node.data.traingraph != ''">
      <canvas :id="canvasId"></canvas>
    </div>

    <Handle id="fit" type="target" :position="Position.Left" :is-valid-connection="validConnectionTarget"
      :style="sourceHandleStyleA"></Handle>

    <Handle id="source" type="source" :position="Position.Right" :is-valid-connection="validConnectionSource"
      :style="sourceHandleStyleA">output</Handle>
    <Handle id="nextdata" type="source" :position="Position.Right" :is-valid-connection="validConnectionSource"
      :style="sourceHandleStyleB">nextdata</Handle>
    <Handle id="history" type="source" :position="Position.Right" :is-valid-connection="validConnectionSource"
      :style="sourceHandleStyleC">history</Handle>
    <Handle id="weights" type="source" :position="Position.Right" :is-valid-connection="validConnectionSource"
      :style="sourceHandleStyleD">weights</Handle>

  </div>
</template>
<script setup>
import { nextTick, watch, ref, onBeforeUnmount, onMounted } from 'vue';
import { Handle, Position, useNode, useVueFlow } from '@vue-flow/core'
import eventBus from '../../eventBus'

const { node } = useNode();
let canvasId = ref(Math.random().toString(36).substring(2, 11))

if (node.data == null || Object.keys(node.data).length == 0) {
  node.data = {};
  node.data.output = "output";
  node.data.traingraph = "loss";
  node.data.x = "x";
  node.data.y = "y";
  node.data.epoch = 50;
  node.data.shuffle = true;
  node.data.resetmodel = true;
}

import { Chart } from 'chart.js/auto'

let graphindex = 0;
const datasets = [
  {
    label: 'loss',
    data: []
  },
  {
    label: 'loss batch',
    data: []
  },
  {
    label: 'acc',
    data: []
  },
  {
    label: 'acc batch',
    data: []
  },
  {
    label: 'mse',
    data: []
  },
  {
    label: 'mse batch',
    data: []
  },
  {
    label: 'val_loss',
    data: []
  },
  {
    label: 'val_loss batch',
    data: []
  },
  {
    label: 'val_acc',
    data: []
  },
  {
    label: 'val_acc batch',
    data: []
  },
  {
    label: 'val_mse',
    data: []
  },
  {
    label: 'val_mse batch',
    data: []
  },
];
function onReceiveNodeData(config, data) {
  if (config.id != node.id) { return; }
  if (myChart == null) return;
  if (data == null || data.data == null) {
    graphindex = 0;
    myChart.data.labels = [];
    myChart.data.datasets = [];
    myChart.update('none');
    return;
  }
  var keys = Object.keys(data.data);

  graphindex++;


  console.log(data.data.epoch, data.data.batch);
  for (let key in data.data) {
    let ds = datasets.find((ds) => ds.label == key);
    if (data.data.batch != null) {
      ds = datasets.find((ds) => ds.label == (key + " batch"));
      if (ds == null) continue;
      if (data.data.batch == 0) {
        ds.data = [];
      }
    } else {
      if (ds == null) continue;
      if (data.data.epoch == 0) {
        ds.data = [];
        // myChart.data.labels = [];
      }
    }

    const value = data.data[key];
    ds.data.push(value);
    if (myChart.data.labels.length < ds.data.length) {
      myChart.data.labels.push(ds.data.length);
    }
  }
  myChart.data.datasets = datasets.filter((ds) => ds.label.startsWith(node.data.traingraph));
  myChart.update('none');

}
function ResetUI() {
  if (myChart == null) return;
  graphindex = 0;
  myChart.data.labels = [];
  myChart.data.datasets = [];
  myChart.update('none');
}
onBeforeUnmount(() => {
  eventBus.$off('receive-node-data', onReceiveNodeData);
  eventBus.$off('reset-ui-elements', ResetUI);
});

onMounted(() => {
  eventBus.$on('receive-node-data', onReceiveNodeData)
  eventBus.$on('reset-ui-elements', ResetUI);
  InitChart();
});

import { computed } from 'vue'
const sourceHandleStyleA = computed(() => ({ filter: 'invert(100%)', top: '10px' }))
// const sourceHandleStyleB = computed(() => ({  filter: 'invert(100%)', top: '30px' }))
// const sourceHandleStyleC = computed(() => ({  filter: 'invert(100%)', top: '50px' }))

const sourceHandleStyleB = computed(() => ({
  filter: 'invert(100%)',
  bottom: '50px',
  top: 'auto',
}))
const sourceHandleStyleC = computed(() => ({
  filter: 'invert(100%)',
  bottom: '30px',
  top: 'auto',
}))
const sourceHandleStyleD = computed(() => ({
  filter: 'invert(100%)',
  bottom: '10px',
  top: 'auto',
}))


/**
 * @type {Chart}
 */
let myChart = null;
let myChartData = {
  labels: [],
  datasets: [{
    label: 'loss',
    data: []
  }, {
    label: 'batch loss',
    data: []
  }]
}
watch(node.data, (newValue) => {
  if (myChart) {
    myChart.destroy();
    myChart = null;
  } else {
    const canvas = document.getElementById(canvasId.value);
    if (canvas == null || canvas.style == null) { return; }
    canvas.style.width = '100%';
    canvas.style.height = '100%';
  }
  InitChart();
})
function InitChart() {
  nextTick(() => {
    const canvas = document.getElementById(canvasId.value);
    if (canvas == null || canvas.style == null) { return; }

    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }
    myChart = new Chart(canvas, {
      type: 'line',
      data: myChartData,
      options: {
        responsive: true,
      }
    });

    myChart.data.datasets = datasets.filter((ds) => ds.label.startsWith(node.data.traingraph));
    myChart.update('none');

  });
}


const instance = useVueFlow({})
function validConnectionSource(data) {
  if (data.target == node.id) { return false; }
  var sourcenode = instance.findNode(data.source)
  if (sourcenode == null) { return false; }
  var sourcehandle = sourcenode.handleBounds.source?.find((handle) => handle.id == data.sourceHandle)
  if (sourcehandle == null) { return false; }
  var targetnode = instance.findNode(data.target)
  if (targetnode == null) { return false; }
  var targethandle = targetnode.handleBounds.target?.find((handle) => handle.id == data.targetHandle)
  if (targethandle == null) { return false; }
  return true;
}
function validConnectionTarget(data) {
  if (data.source == node.id) { return false; }
  var sourcenode = instance.findNode(data.source)
  if (sourcenode == null) { return false; }
  var sourcehandle = sourcenode.handleBounds.source?.find((handle) => handle.id == data.sourceHandle)
  if (sourcehandle == null) { return false; }
  var targetnode = instance.findNode(data.target)
  if (targetnode == null) { return false; }
  var targethandle = targetnode.handleBounds.target?.find((handle) => handle.id == data.targetHandle)
  if (targethandle == null) { return false; }
  return true;
}

const canvasWrapperStyle = computed(() => {
  if (node.dimensions.width < 10 || node.dimensions.height < 10) { return; }
  // Calculate the dimensions of the canvas wrapper based on the node's size
  return {
    width: node.dimensions.width + 'px',
    overflow: 'hidden', // Hide any content that exceeds the dimensions
    position: 'relative', // Ensure the canvas is positioned relative to the wrapper
  };
}
)

</script>
<style>
.toolbox-node-tf_model_fit {
  background: var(--ml-studio-tf_model_train-node-background-color);
  color: var(--ml-studio-tf_model_train-node-font-color);
}
</style>
<style scoped>
.node-tf_model_fit {
  background: var(--ml-studio-tf_model_train-node-background-color);
  color: var(--ml-studio-tf_model_train-node-font-color);
  text-align: center;
  border: 1px solid #777;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  max-width: 250px
}
</style>