<template>
  <div ref="rootElement" class="node-chart">
    <div ref="labelElement"> {{ node.label }}</div>
    <div :style="canvasWrapperStyle">
      <canvas ref="canvasElement" :id="canvasId"></canvas>
      <div ref="canvasOverlay" class="canvasoverlay">Sample Data</div>
    </div>
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


let canvasId = ref(Math.random().toString(36).substring(2, 11))

if (node.data == null || Object.keys(node.data).length == 0) {
  node.data = {};
  node.data.type = "bar";
  node.data.appendmode = "";
  // node.data.autosave = true;
  node.data.appendmaxdatasets = 10;
  node.data.appendmaxdatasetvalues = 100;
  node.data.animated = true;
  node.data.func = `async (engine: engine, node: node, msg: message) => {
  const result = {
    datasets: [],
    labels: []
  }

  // graph diff data from tf_model_fit ( how much the weights changed per epoch)
  // let sums = [];
  // for (let i = 0; i < msg.payload.length; i++) {
  //   const layer = msg.payload[i];
  //   if (layer.diff == null) continue;
  //   const sum = layer.diff.reduce((partialSum, a) => Math.abs(partialSum) + a, 0);
  //   sums.push(sum);
  // }
  // result.datasets.push({
  //   label: "diff",
  //   data: [sums],
  // })
  // result.labels = [msg.payload[0].epoch]

  // graph history data from tf_model_fit ( gets data for both batch and epoch)
  // if(msg.payload.batch != null) {
  //   // result.datasets.push({
  //   //   label: "batch loss",
  //   //   data: [msg.payload.loss],
  //   //   reset: (msg.payload.batch == 0)
  //   // });
  //   // result.labels = [(msg.payload.batch + 1 )]
  // } else {
  //   result.datasets.push({
  //     label: "loss",
  //     data: [msg.payload.loss],
  //   });
  //   result.labels = [(msg.payload.epoch + 1) ];
  // }

  // Graph count and name from array of objects in msg.payload
  // result.datasets.push({
  //   label: "data",
  //   data: msg.payload.map((row) => row.count),
  // })
  // result.labels = msg.payload.map((row) => row.name)



  // append data test with merge values/add labels
  result.datasets.push({
    label: "data",
    data: [Math.floor(Math.random() * 10 + 1), Math.floor(Math.random() * 10 + 1), Math.floor(Math.random() * 10 + 1)],
  })
  result.labels = ["#" + Math.floor(Math.random() * 10 + 1), "#" + Math.floor(Math.random() * 10 + 1), "#" + Math.floor(Math.random() * 10 + 1)]
  return result;
}`;
}

import { Chart } from 'chart.js/auto'

let graphindex = 0;
function onReceiveNodeData(config, data) {
  // console.log("onReceiveNodeData", config, data)
  if (config.id != node.id) { return; }
  if (myChart == null) { return; }

  if(firsttime == true){
    firsttime = false;
    canvasOverlay.value.style.display = 'none';
    myChartData.datasets = [];
    myChartData.labels = [];
  }
  if (data == null || data.length == 0) {
    graphindex = 0;
    if (myChart != null) {
      myChartData.datasets = [];
      myChart.update(node.data.animated == true ? '' : 'none');
    }
    return;
  }
  if (myChartData.datasets.length == 0) {
    myChartData.datasets = data.datasets;
    myChartData.labels = data.labels;
  } else {
    const { appendmaxdatasets, appendmaxdatasetvalues } = node.data;
    if (node.data.appendmode == null || node.data.appendmode == "") {
      myChartData.datasets = data.datasets;
      myChartData.labels = data.labels;
    } else if (node.data.appendmode == "mergevaluesaddlabels") {
      for (let i = 0; i < data.datasets.length; i++) {
        let dataset = data.datasets[i];
        if(!Array.isArray(dataset.data)) {
          dataset.data = [dataset.data];
        }
        if(!Array.isArray(myChartData.datasets.data)) {
          myChartData.datasets.data = [myChartData.datasets.data];
        }
        let uidataset = myChartData.datasets.find(x => x.label == dataset.label);
        if(dataset.reset == true && uidataset != null){
          uidataset.data = [];
        }
        let labelindex = myChartData.labels.indexOf(data.labels[i]);
        if(uidataset == null){
          myChartData.datasets.push(dataset);
          uidataset = dataset;
        } else {
          if(labelindex > -1) {
            uidataset.data[labelindex] = dataset.data[0];
          } else {
            uidataset.data = uidataset.data.concat(dataset.data);
          }
        }
        // if(myChartData.datasets.length <= i){
        //   myChartData.datasets.push(dataset);
        // } else {
        //   myChartdataset.data = myChartdataset.data.concat(dataset.data);
        // }
        if(appendmaxdatasetvalues != null && appendmaxdatasetvalues != "" && appendmaxdatasetvalues > 0){
          // myChartdataset.data = myChartdataset.data.slice(-appendmaxdatasetvalues);
          uidataset.data = uidataset.data.slice(-appendmaxdatasetvalues);
        }
      }
      for(let i = 0; i < data.labels.length; i++){
        let label = data.labels[i];
        let idx = myChartData.labels.indexOf(label);
        if(idx == -1){
          myChartData.labels.push(label);
        }
      }
      // myChartData.labels = myChartData.labels.concat(data.labels);
      if(appendmaxdatasetvalues != null && appendmaxdatasetvalues != "" && appendmaxdatasetvalues > 0){
        myChartData.labels = myChartData.labels.slice(-appendmaxdatasetvalues);
      }
    } else if (node.data.appendmode == "mergevaluessetlabels") {
      myChartData.datasets = myChartData.datasets.concat(data.datasets);
      myChartData.labels = data.labels;
      if(appendmaxdatasets != null && appendmaxdatasets != "" && appendmaxdatasetvalues > 0){
        myChartData.datasets = myChartData.datasets.slice(-appendmaxdatasets);
      }
    }
  }
  InitChart()
  myChart.update(node.data.animated == true ? '' : 'none');
  fixStyles()
}
function ResetUI() {
  graphindex = 0;
  myChartData.datasets = [];
  myChartData.labels = [];
  if (myChart != null) {
    myChart.update(node.data.animated == true ? '' : 'none');
  }
  fixStyles()
}
onBeforeUnmount(() => {
  eventBus.$off('receive-node-data', onReceiveNodeData);
  eventBus.$off('reset-ui-elements', ResetUI);
});

onMounted(() => {
  eventBus.$on('receive-node-data', onReceiveNodeData)
  eventBus.$on('reset-ui-elements', ResetUI);
  fixStyles()

  InitChart();
});

import { computed } from 'vue'
import Function_node from './function_node.vue';
const sourceHandleStyleA = computed(() => ({ filter: 'invert(100%)', top: '10px' }))

const sourceHandleStyleB = computed(() => ({
  filter: 'invert(100%)',
  bottom: '10px',
  top: 'auto',
}))


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
/**
 * @type {Chart}
 */
let myChart = null;
let firsttime = true;
let myChartData = {
  datasets: [],
  labels: []
}
function fixStyles() {
  try {
    const parentNode = rootElement.value.closest('.vue-flow__node');
    let minwidth = node.data.minwidth ?? '200px';

    if(firsttime == true){
      canvasElement.value.style.filter = 'blur(2px)';
      labelElement.value.style.filter = 'blur(2px)';
    } else {
      canvasElement.value.style.filter = 'none';
      labelElement.value.style.filter = 'none';
    }

    parentNode.style?.setProperty('min-width', minwidth);
    rootElement.style?.setProperty('min-width', minwidth);
  } catch (error) {
    console.error(error);
  }
}
watch(node.data, (newValue) => {
  fixStyles()
  InitChart();
})
function InitChart() {
  nextTick(() => {

    try {
      const parentNode = rootElement.value.closest('.vue-flow__node');
      const canvas = document.getElementById(canvasId.value);
      const existingChart = Chart.getChart(canvas);
      let minwidth = node.data.minwidth ?? '200px';
      let currentwidth = parentNode.style.getPropertyValue('min-width');
      const widthchanged = currentwidth != minwidth;
      if (existingChart != null && myChart.config.type == (node.data.type ?? 'line') && widthchanged == false) {
        return;
      }
      if (existingChart != null) {
        existingChart.destroy();
      }

      Chart.defaults.color = 'var(--font-color)';
      myChart = new Chart(canvas, {
        type: node.data.type ?? 'line',
        data: myChartData,
        options: {
          responsive: true,
          // indexAxis: node.data.indexAxis ?? 'x',
          // scales: {
          //   y: {
          //     beginAtZero: true
          //   }
          // }
        }
      });
      // myChart.options.plugins.legend.labels.color = "var(--font-color)";
      // Chart.defaults.global.defaultFontColor = 'var(--font-color)';
      // var isdarkmode = localStorage.getItem("user-theme") == "dark";
      // if(isdarkmode == true){

      //   // myChart.options.scales.x.grid.color = darkGridLineColor;
      //   // myChart.options.scales.y.grid.color = darkGridLineColor
      // }
      canvas.style.width = '100%';
      canvas.style.height = '100%';

      const rootStyle = getComputedStyle(document.body);
      const fontColor = rootStyle.getPropertyValue('--ml-studio-chart-node-grid-font-color').trim();
      const gridLineColor = rootStyle.getPropertyValue('--ml-studio-chart-node-grid-line-color').trim() ;
      let stacked = false;
      if(node.data.stacked == true) stacked = true;

      myChart.options.color = fontColor;
      myChart.options.scales = {
        x: {
          stacked: stacked,
          grid: {
            color: gridLineColor,
          },
          ticks: {
            color: fontColor,  // X-axis labels
          }
        },
        y: {
          stacked: stacked,
          grid: {
            color: gridLineColor,
          },
          ticks: {
            color: fontColor,  // Y-axis labels
          }
        }
      };


      if(firsttime == true){
        const placeholderColors = ['#4B89DC', '#68B3C8', '#9B59B6', '#E67E22', '#F1C40F', '#E74C3C', '#95A5A6'];
        myChartData.datasets = [{
          label: 'Sample Data',
          data: [10, 20, 30, 40, 50, 60, 70],
          borderWidth: 1,
          backgroundColor: placeholderColors
        }];
        if (node.data.type == "scatter") {
          myChartData.datasets = [{
            label: 'Sample Scatter Data',
            data: [
              { x: -10, y: 0 },
              { x: 0, y: 10 },
              { x: 10, y: 5 },
              { x: 0.5, y: 5.5 },
              { x: -7.5, y: -5 },
              { x: 5, y: -2 },
              { x: 3, y: 8 },
              { x: -5, y: 7 },
              { x: 6, y: -3 },
              { x: -4, y: 4 },
              { x: 7, y: -6 },
              { x: -3, y: 6 },
              { x: 2, y: -8 },
              { x: -8, y: -4 },
              { x: 4, y: 9 },
              { x: -9, y: 1 },
              { x: 1, y: -7 },
              { x: 8, y: 3 },
              { x: -2, y: -9 },
              { x: 9, y: 2 },
              { x: -1, y: -1 },
              { x: -6, y: -2 }
            ],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)'
          }]
        }
        if (node.data.type == "bubble") {
          myChartData.datasets = [{
            label: 'Sample Bubble Data',
            data: [
              { x: 20, y: 30, r: 15 },
              { x: 40, y: 10, r: 10 },
              { x: 10, y: 20, r: 20 },
              { x: 30, y: 40, r: 5 },
              { x: 50, y: 25, r: 8 },
              { x: 35, y: 15, r: 12 }
            ],
            backgroundColor: 'rgba(255, 99, 132, 0.5)'
          }];
        }
        myChartData.labels = ['Sample 1', 'Sample 2', 'Sample 3', 'Sample 4', 'Sample 5', 'Sample 6', 'Sample 7'];
        if (node.data.type == "radar") {
          myChartData.labels = ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running', 'Reading', 'Traveling', 'Gaming'];
          myChartData.datasets = [{
            label: 'Sample Radar Data',
            data: [65, 59, 90, 81, 56, 55, 40, 70, 45, 80],
            fill: true,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
          }]
        }

        // myChartData.datasets[0].backgroundColor = myChartData.datasets[0].data.map((value) => {
        //   return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
        // });
        
        myChart.update(node.data.animated == true ? '' : 'none');
      }

      fixStyles()
    } catch (error) {
      console.error(error)
    }
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
</script>
<style>
.toolbox-node-chart {
  background: var(--ml-studio-chart-node-background-color);
  color: var(--ml-studio-chart-node-font-color);
}

.vue-flow__node-chart {
  background: var(--ml-studio-chart-node-background-color);
  color: var(--ml-studio-chart-node-font-color);
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
<style scoped>
.canvasoverlay {
  position: absolute;
  display: none; /* disable for now */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff; /* Choose a color that stands out */
  background-color: rgba(0, 0, 0, 0.3); /* Semi-transparent background */
  padding: 10px;
  border-radius: 5px;
  pointer-events: none; /* Ensures clicks pass through to the canvas */
}
</style>
