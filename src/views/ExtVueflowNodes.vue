<script setup lang="ts">
import { watch, markRaw, ref } from 'vue';
const nodeTypes:any = ref([]);
const txtsearch:any = ref(null);
const props:any = defineProps({
  nodetypes: {
    type: Object,
    required: true,
  }
})
function mapNodes() {
  var keys = Object.keys(props.nodetypes);
  if(keys.length == 0) {
    setTimeout(() => {
      mapNodes()
    }, 200)
    return;
  }
  nodeTypes.value = props.nodetypes;
}
watch(() => props.nodetypes, (newValue) => {
  mapNodes()
});
mapNodes()
function onDragStart(event, nodeType, nodeName) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', JSON.stringify({"name": nodeName, "type": nodeType}))
    event.dataTransfer.effectAllowed = 'move'
  }
}
function filterList(e) {
  if(e && e.keyCode == 13) {
    e.preventDefault();
  }
  const search = txtsearch.value.value;
  if(search) {
    nodeTypes.value = nodeTypes.value.filter((node) => {
      return node.name.toLowerCase().indexOf(search.toLowerCase()) > -1;
    })
  } else {
    mapNodes()
  }
}
</script>

<template>
  <aside class="toolbox">
    <v-text-field ref="txtsearch" label="Search nodes" @keyup="filterList" />
    <div v-for="node in nodeTypes" :class="'toolbox-node-' + node.type" 
    class="toolbox-node" :draggable="true" @dragstart="onDragStart($event, node.type, node.name)">{{node.name}}</div>
  </aside>
</template>

<style scoped>
.toolbox {
  overflow: auto;
  min-width: 280px;
}
</style>