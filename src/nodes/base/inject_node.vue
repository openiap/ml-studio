<template>
  <div class="node-inject">
    <button title="Run" type="button" @click="onButtonClick" @dblclick="onButtondblClick"></button>
    <div v-if="node">{{ node.label }} </div>
    <Handle id="source" type="source" :position="Position.Right" :is-valid-connection="validConnectionSource"></Handle>
  </div>
</template>
<script setup>
import { Handle, Position, useNode, useVueFlow } from '@vue-flow/core'
import eventBus from '../../eventBus'

const { node } = useNode();
const instance = useVueFlow({})

if(node.data == null || Object.keys(node.data).length == 0) {
  node.data = {};
  node.data.resetui = false;
  node.data.output = "payload";
  node.data.func = `async (engine: engine, node: node) => {
  const msg: message = {
    payload: {}
  }
  return msg;
}`;

}
function onButtondblClick(e) {
  e.preventDefault();
  e.stopPropagation();
}
function onButtonClick(e) {
  e.preventDefault();
  e.stopPropagation();
  if(node.data.resetui == true) {
    eventBus.$emit('reset-ui-elements', {id: node.id}, msg)
  }  
  var msg = JSON.parse(JSON.stringify(node.data))
  eventBus.$emit('onSend', {id: node.id}, msg)
}

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
</script>
<style>
.toolbox-node-inject {
  background: var(--ml-studio-inject-node-background-color);
  color: var(--ml-studio-inject-node-font-color);
}
</style>
<style scoped>
.node-inject {
  background: var(--ml-studio-inject-node-background-color);
  color: var(--ml-studio-inject-node-font-color);
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
.node-inject button {
  background: var(--ml-studio-inject-node-button-background-color);
  color: var(--ml-studio-inject-node-button-font-color);
  padding: 5px;
  width: 25px;
  height: 25px;
  border-radius: 25px;
  -webkit-box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, .3);
  box-shadow: 0 5px 10px #0000004d;
  cursor: pointer
}
.node-inject button :hover {
  opacity: .9;
  transform: scale(105%);
  transition: .25s all ease
}
</style>