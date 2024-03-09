<template>
  <div ref="rootElement" class="node-plotly nowheel">
    <button class="reset-button" @click="ResetUI">Reset</button>
    <div ref="labelElement"> {{ node.label }}</div>
    <div ref="canvasElement" :id="canvasId" class="nodrag"></div>
    <!-- <div ref="canvasOverlay" class="canvasoverlay">Sample Data</div> -->
    <Handle id="target" type="target" :position="Position.Left" :is-valid-connection="validConnectionTarget"></Handle>
    <Handle id="source" type="source" :position="Position.Right" :is-valid-connection="validConnectionSource"></Handle>
  </div>
</template>
<script setup>
import { nextTick, watch, ref, onBeforeUnmount, onMounted, provide, render } from 'vue';
import { MarkerType, Handle, Position, useNode, useVueFlow } from '@vue-flow/core'
import eventBus from '../../eventBus'

const { node } = useNode();
const rootElement = ref(null);
const canvasElement = ref(null);
const labelElement = ref(null);
const canvasOverlay = ref(null);
let myChart = null;


let canvasId = ref(Math.random().toString(36).substring(2, 11))

if (node.data == null || Object.keys(node.data).length == 0) {
  node.data = {};
  node.data.appendmode = "";
  // node.data.autosave = true;
  node.data.appendmaxdatasets = 10;
  node.data.appendmaxdatasetvalues = 100;
  node.data.func = `async (engine: engine, node: node, msg: message) => {
  const result = {
    data: [],
    layout: {},
    options: {}
  }
  // user count and name from array of objects in msg.payload
  // result.push({
  //   label: "data",
  //   data: msg.payload.map((row) => row.count),
  // })

  // append data test with merge values/add labels
  result.data.push({
    label: "data",
    y: [Math.floor(Math.random() * 10 + 1), Math.floor(Math.random() * 10 + 1)],
    x: ["#" + Math.floor(Math.random() * 10 + 1), "#" + Math.floor(Math.random() * 10 + 1)],
  })

  return result;
}`;
}

import Plotly from 'plotly.js-dist-min';

let graphindex = 0;
async function onReceiveNodeData(config, data) {
  if (config.id != node.id) { return; }
  if (firsttime == true) {
    firsttime = false;
    if (canvasOverlay.value != null && canvasOverlay.value.style != null) canvasOverlay.value.style.display = 'none';
    myChartData = [];
  }
  if (data == null || data.length == 0) {
    graphindex = 0;
    myChartData = [];
    await Plotly.redraw(canvasId.value, myChartData, myChartLayout, myChartOptions);
    return;
  }
  let traceadded = false;
  myChartLayout = Object.assign(myChartLayout, data.layout);
  myChartOptions = Object.assign(myChartOptions, data.options);
  if (myChartData.length == 0 || node.data.appendmode == null || node.data.appendmode == "") {
    if (data.data != null) {
      if (Array.isArray(data.data)) {
        myChartData = data.data;
      } else {
        myChartData = [data.data];
      }
    }
  } else {
    const { appendmaxdatasets, appendmaxdatasetvalues } = node.data;
    if (node.data.appendmode == "mergevalues") {
      for (let i = 0; i < data.data.length; i++) {
        const d = data.data[i];
        if (d.x != null && !Array.isArray(d.x)) d.x = [d.x];
        if (d.y != null && !Array.isArray(d.y)) d.y = [d.y];
        if (d.z != null && !Array.isArray(d.z)) d.z = [d.z];
        let trace = null;
        if (myChartData.length > i && d.name != null && d.name != "") {
          trace = myChartData.find((t) => t.name == d.name);
        } else if (myChartData.length > i) {
          trace = myChartData[i];
        }
        if (trace == null) {
          trace = {
            name: d.name,
            x: d.x,
            y: d.y,
            x: d.z
          }
          traceadded = true;
          myChartData.push(trace);
        } else {
          if (trace.x != null && !Array.isArray(trace.x)) trace.x = [trace.x];
          if (trace.y != null && !Array.isArray(trace.y)) trace.y = [trace.y];
          if (trace.z != null && !Array.isArray(trace.z)) trace.z = [trace.z];
          trace.x = trace.x.concat(d.x);
          trace.y = trace.y.concat(d.y);
          if (d.z != null && Array.isArray(d.z)) {
            trace.z = trace.z.concat(d.z);
          }
        }
        if (appendmaxdatasetvalues != null && appendmaxdatasetvalues != "" && appendmaxdatasetvalues > 0) {
          trace.x = trace.x.slice(-appendmaxdatasetvalues);
          trace.y = trace.y.slice(-appendmaxdatasetvalues);
          trace.z = trace.z.slice(-appendmaxdatasetvalues);
        }
      }
    } else if (node.data.appendmode == "mergevaluessetlabels") {
      myChartData = myChartData.concat(data.data);
      if (appendmaxdatasets != null && appendmaxdatasets != "" && appendmaxdatasetvalues > 0) {
        myChartData = myChartData.slice(-appendmaxdatasets);
      }
    }
  }
  InitChart()
}

onBeforeUnmount(() => {
  eventBus.$off('receive-node-data', onReceiveNodeData);
  eventBus.$off('reset-ui-elements', ResetUI);
});

onMounted(() => {
  eventBus.$on('receive-node-data', onReceiveNodeData)
  eventBus.$on('reset-ui-elements', ResetUI);
  fixStyles()

  const plotlyChart = document.getElementById(canvasId.value);
  plotlyChart.addEventListener('mousewheel', function (e) {
    e.stopPropagation();
  });


  InitChart();
});

import { computed } from 'vue'
const sourceHandleStyleA = computed(() => ({ filter: 'invert(100%)', top: '10px' }))

const sourceHandleStyleB = computed(() => ({
  filter: 'invert(100%)',
  bottom: '10px',
  top: 'auto',
}))


let firsttime = true;
let myChartData = [];
let myChartLayout = {
  width: 300, // Match the width of the container
  // height: 200, // Match the height of the container
  margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 }, // Adjust margins as needed
  responsive: true,
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent'
};
let myChartOptions = {
  displayModeBar: false
};

function fixStyles() {
  try {
    if (firsttime == true) {
      canvasElement.value.style.filter = 'blur(2px)';
      labelElement.value.style.filter = 'blur(2px)';
    } else {
      canvasElement.value.style.filter = 'none';
      labelElement.value.style.filter = 'none';
    }
  } catch (error) {
    console.error(error);
  }
}
watch(node.data, (newValue) => {
  // fixStyles()
  // InitChart();
})
let markers = 0;
async function updateChart(renew = false) {
  if (myChartData.length == 0) return;
  if (markers != myChartData.length) {
    renew = true;
  }
  if (myChart == null || renew == true) {
    console.log("new plotly chart");
    markers = myChartData.length;
    myChart = await Plotly.newPlot(canvasId.value, myChartData, myChartLayout, myChartOptions);
  } else {
    console.log("do nothing");
    // await Plotly.react(canvasId.value, myChartData, myChartLayout, myChartOptions);
    // myChart = await Plotly.newPlot(canvasId.value, myChartData, myChartLayout, myChartOptions);
    // for(let i = 0; i < myChartData.length; i++){
    //   await Plotly.restyle(canvasId.value, myChartData[i], [i]);
    // }
    // await Plotly.redraw(canvasId.value, myChartData, myChartLayout, myChartOptions);
  }
}
function InitChart() {
  nextTick(async () => {

    try {
      if (node.data.minwidth != null && node.data.minwidth != "") {
        myChartLayout.width = node.data.minwidth - 10;
      } else {
        myChartLayout.width = 200;
      }
      if (myChartData.length > 0) {
        myChart = await Plotly.newPlot(canvasId.value, myChartData, myChartLayout, myChartOptions);
      }

      await updateChart();

      if (firsttime == true) {
        myChartData = [];
        myChartData.push({
          x: ['giraffes', 'orangutans', 'monkeys', 'squids', 'whales', 'dolphins', 'sharks'],
          y: [10, 20, 30, 40, 50, 60, 70]
        });
        await updateChart();
      }
      const rootStyle = getComputedStyle(document.body);
      fixStyles()
    } catch (error) {
      console.error(error)
    }
  });
}

async function ResetUI() {
  myChartData = [];
  myChartLayout = {
    margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
    responsive: true,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent'
  };
  myChartOptions = {
    displayModeBar: false
  };
  myChart = await Plotly.newPlot(canvasId.value, myChartData, myChartLayout, myChartOptions);
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
</script>
<style>
.toolbox-node-plotly {
  background: var(--ml-studio-plotly-node-background-color);
  color: var(--ml-studio-plotly-node-font-color);
}
</style>
<style scoped>
.node-plotly {
  background: var(--ml-studio-plotly-node-background-color);
  color: var(--ml-studio-plotly-node-font-color);
  text-align: center;
  border: 1px solid #777;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.canvasoverlay {
  position: absolute;
  display: none;
  /* disable for now */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  /* Choose a color that stands out */
  background-color: rgba(0, 0, 0, 0.3);
  /* Semi-transparent background */
  padding: 10px;
  border-radius: 5px;
  pointer-events: none;
  /* Ensures clicks pass through to the canvas */
}
.reset-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #33a6b8;
  color: white;
  border: none;
  padding: 5px 10px;
  text-align: center;
  text-decoration: none;
}
</style>