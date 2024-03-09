<template>
  <div ref="rootElement" class="debug-node">
    <div :style="canvasWrapperStyle" >
      <span v-html="text"></span>
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

if(node.data == null || Object.keys(node.data).length == 0) {
  node.data = {};
  node.data.input = "payload";
}
let text = ref(node.label ?? "");

function onReceiveNodeData(config, data) {
  if(config.id != node.id) { return; }
  if(data == null || data.length == 0) { 
    return; 
  } else if( Array.isArray(data) == false) {
    data = [data];
  }

  var msg = data[0].toString();
  if(msg = "[object Object]") {
    msg = JSON.stringify(data[0]);
  }
  let max = node.data.max ?? 30;
  if(msg.length > max) {
    text.value = msg.substring(0, max) + "...";
  } else {
    text.value = msg;
  }
  text.value = text.value.split("\\n").join("<br />").replace(/\n/g, "<br />");
  if(msg != null && msg != "") {
    eventBus.$emit('add-logitem', { id: node.id}, { name: "OUTPUT", action: "OUTPUT", message: msg });
  }
}
function ResetUI() {
  text.value = node.label ?? "";
}
onBeforeUnmount(() => {
  eventBus.$off('receive-node-data', onReceiveNodeData);
  eventBus.$off('reset-ui-elements', ResetUI);
});

onMounted(() => {
  eventBus.$on('receive-node-data', onReceiveNodeData)
  eventBus.$on('reset-ui-elements', ResetUI);
  fixStyles()
});

import { computed } from 'vue';
const sourceHandleStyleA = computed(() => ({  filter: 'invert(100%)', top: '10px' }))

const sourceHandleStyleB = computed(() => ({
  filter: 'invert(100%)',
  bottom: '10px',
  top: 'auto',
}))

const canvasWrapperStyle = computed(() => {
  // if(node.dimensions.width < 10 || node.dimensions.height < 10) { return; }
  // return {
  //   width: node.dimensions.width + 'px',
  //   overflow: 'hidden', // Hide any content that exceeds the dimensions
  //   position: 'relative', // Ensure the canvas is positioned relative to the wrapper
  // };
}
)
function fixStyles() {
  // const parentNode = rootElement.value.closest('.vue-flow__node');
  // let minwidth = node.data.minwidth ?? '300px';

  // parentNode.style?.setProperty('min-width', '0px');
  // rootElement.style?.setProperty('min-width', '0px');
}
watch(node.data, (newValue) => {
  fixStyles()
})

const instance = useVueFlow({})
function validConnectionSource(data) {
  if(data.target == node.id) { return false; }
  var sourcenode = instance.findNode(data.source)
  if(sourcenode == null) { return false; }
  var sourcehandle = sourcenode.handleBounds.source?.find((handle) => handle.id == data.sourceHandle)
  if(sourcehandle == null) { return false; }
  var targetnode = instance.findNode(data.target)
  if(targetnode == null) { return false; }
  var targethandle = targetnode.handleBounds.target?.find((handle) => handle.id == data.targetHandle)
  if(targethandle == null) { return false; }
  return true;
}
function validConnectionTarget(data) {
  if(data.source == node.id) { return false; }
  var sourcenode = instance.findNode(data.source)
  if(sourcenode == null) { return false; }
  var sourcehandle = sourcenode.handleBounds.source?.find((handle) => handle.id == data.sourceHandle)
  if(sourcehandle == null) { return false; }
  var targetnode = instance.findNode(data.target)
  if(targetnode == null) { return false; }
  var targethandle = targetnode.handleBounds.target?.find((handle) => handle.id == data.targetHandle)
  if(targethandle == null) { return false; }
  return true;
}
</script>
<style>
.toolbox-debug-node {
  background: var(--ml-studio-debug-node-background-color);
  color: var(--ml-studio-debug-node-font-color);
}
</style>
<style scoped>
.debug-node {
  background: var(--ml-studio-debug-node-background-color);
  color: var(--ml-studio-debug-node-font-color);

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
</style>