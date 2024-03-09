<template>
  <div ref="rootElement" class="node-table">
    <EasyDataTable ref="refdatatable" class="easy-table" :items="datatable" :headers="datatableheaders"
      :hide-rows-per-page="true" :rows-per-page="rowsPerPage" style="width:100%; height:100%" v-if="showTable">
      <template #item-name="item">
        <div>
          {{ item.name }}
        </div>
      </template>
    </EasyDataTable>
    <Handle id="target" type="target" :position="Position.Left" :is-valid-connection="validConnectionTarget"></Handle>
    <Handle id="source" type="source" :position="Position.Right" :is-valid-connection="validConnectionSource"></Handle>
  </div>
</template>
<script setup lang="ts">
import { nextTick, watch, ref, onBeforeUnmount, onMounted, provide, render } from 'vue';
import { MarkerType, Handle, Position, useNode, useVueFlow } from '@vue-flow/core'
import eventBus from '../../eventBus'

const { node } = useNode();
const rootElement = ref(null);
const showTable = ref(true);

if(node.data == null || Object.keys(node.data).length == 0) {
  node.data = {};
  node.data.input = "payload";
  node.data.scrollToLast = true;
}

const refdatatable = ref<any>(null);
let datatable = ref([
])
let datatableheaders = ref([
  { text: "Name", value: "name" },
  { text: "Action", value: "action" },
  { text: "Id", value: "id" },
])
let text = ref("");
const rowsPerPage = ref(!Number.isNaN(parseInt(node.data.rowsPerPage)) ? parseInt(node.data.rowsPerPage) : 10);

function onReceiveNodeData(config, data) {
  if (config.id != node.id) { return; }
  if(data != null && data.length == 1 && Array.isArray(data[0]) ) {
    console.log("data is an array wth only one item, but that is an array, so unwrap that");
    data = data[0];
  }
  if (data == null || data.length == 0) {
    return;
  } else if (Array.isArray(data) == false) {
    data = [data];
  }
  if(typeof data[0] != 'object') {
    data = data.map((item) => {
      return { value: item }
    })
  }


  if(node.data.append == true) {
    datatable.value = datatable.value.concat(data);
    if(node.data.appendmaxitems != null && node.data.appendmaxitems != "") {
      datatable.value = datatable.value.slice(-node.data.appendmaxitems);
    }
  } else {
    datatable.value = data;
  }
  if (node.data.fields != null && node.data.fields != "") {
    datatableheaders.value = node.data.fields.split(',').map(key => {
      return { text: key, value: key }
    });
  } else {
    if(data != null && data.length > 0 && data[0] != null && typeof data[0] == 'object') {
      datatableheaders.value = Object.keys(data[0]).map(key => {
      return { text: key, value: key }
    });
    }

    nextTick(() => {
      const lastpagenumber = Math.ceil(datatable.value.length / rowsPerPage.value);
      if(refdatatable.value != null && refdatatable.value.updatePage != null) {
        refdatatable.value.updatePage(lastpagenumber);
      }
    })
  }
}
function ResetUI() {
  datatable.value = [];
  datatableheaders.value = [];
  nextTick(() => {
    const lastpagenumber = Math.ceil(datatable.value.length / rowsPerPage.value);
    if(refdatatable.value != null && refdatatable.value.updatePage != null) {
      refdatatable.value.updatePage(lastpagenumber);
    }
  })

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

import { computed } from 'vue'
const sourceHandleStyleA = computed(() => ({ filter: 'invert(100%)', top: '10px' }))

const sourceHandleStyleB = computed(() => ({
  filter: 'invert(100%)',
  bottom: '10px',
  top: 'auto',
}))

function fixStyles() {
  if (rootElement.value == null) { return; }
  let minwidth = node.data.minwidth ?? '300px';
  rowsPerPage.value = !Number.isNaN(parseInt(node.data.rowsPerPage)) ? parseInt(node.data.rowsPerPage) : 10;
  nextTick(() => {
    if (rootElement.value == null ) {
      return;
    }
    // @ts-ignore
    rootElement.value.style?.setProperty('min-width', minwidth + 'px');
  });
}
watch(node.data, (newValue) => {
  showTable.value = false; // hide/show to destroy and recreate, since ROWS PER PAGE is not updated on update
  nextTick(() => {
    showTable.value = true;
    fixStyles()
  })
})

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
.toolbox-node-table {
  background: whitesmoke;
}

body.dark .toolbox-node-table {
  background: #2867ef80;
}

.easy-table {
  margin-left: 2px;
}

/* .vue-flow__node-table {
} 
body.dark .vue-flow__node-table {
  --bg-color: #444;
  --bg-secondary-color: #777;
} */

</style>
<style scoped>
.node-table {
  --bg-color: whitesmoke;
  --bg-secondary-color: whitesmoke;
  --easy-table-header-background-color: var(--bg-color);
  --easy-table-footer-background-color: var(--bg-color);

  text-align: center;
  border: 1px solid #777;
  padding: 10px;
  border-radius: 10px;
  background: var(--bg-color);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  max-width: 250px
}
.node-table {
  margin-left: 3px;
  padding-left: 4px;
  padding-right: 8px;
}
</style>