<template>
  <div class="node-amqp_consume">
    <div>{{ node.label }}</div>
    <Handle id="source" type="source" :position="Position.Right" :is-valid-connection="validConnectionSource"></Handle>
  </div>
</template>
<script setup>
import { nextTick, watch, ref, onBeforeUnmount, onMounted, provide, render } from 'vue';
import { MarkerType, Handle, Position, useNode, useVueFlow } from '@vue-flow/core'
import eventBus from '../../eventBus'

const { node } = useNode();

if(node.data == null || Object.keys(node.data).length == 0) {
  node.data = {};
  node.data.output = "payload";
}

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
.toolbox-node-amqp_consume {
  background: var(--ml-studio-amqp_consume-node-background-color);
  color: var(--ml-studio-amqp_consume-node-font-color);
}
</style>
<style scoped>
/* .vue-flow__node-amqp_consume {
  background: #dd1fca;
  color: #fffffb;
}
body.dark .vue-flow__node-amqp_consume {
  background: #dd1fca9c;
} */
.node-amqp_consume {
  background: var(--ml-studio-amqp_consume-node-background-color);
  color: var(--ml-studio-amqp_consume-node-font-color);
  text-align: center;
  border: 1px solid #777;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  max-width: 250px
}
</style>