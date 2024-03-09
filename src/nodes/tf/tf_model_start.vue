<template>
  <div class="node-basenode">
    <div>{{ node.label }} </div>
    <Handle id="source" type="source" :position="Position.Right" :is-valid-connection="validConnectionSource"></Handle>
  </div>
</template>
<script setup>
import { nextTick, watch, ref, onBeforeUnmount, onMounted } from 'vue';
import { MarkerType, Handle, Position, useNode, useVueFlow } from '@vue-flow/core'

const { node } = useNode();

node.deletable = false;
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
</script>
<style>
.toolbox-node-basenode {
  background: #80a3ec ;
  color: #fffffb;
}
body.dark .toolbox-node-basenode {
  background: #2867ef80 ;  
}
</style>
<style scoped>
.node-basenode {
  border: 1px solid #777;
  padding: 10px;
  border-radius: 10px;
  background: whitesmoke;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  max-width: 250px
}
</style>
