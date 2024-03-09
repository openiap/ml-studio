<template>
  <!-- align all fields horizontally -->
    <v-row no-gutters>
      <v-col v-if="props.modelValue.value != null">
        <v-text-field v-model="props.modelValue.value.name" :rules="nameRules" label="Name" required />
      </v-col>
      <!-- <v-col>
        <v-text-field v-model="props.modelValue.value._id" label="id" readonly />
      </v-col> -->
      <v-col sm="1" v-if="isModel">
        <v-select v-model="props.modelValue.value.modeltype" :items="['layers', 'graph']" label="Model Type" />
      </v-col>
      <v-col  sm="2" v-if="isModel">
        <v-text-field v-model="props.modelValue.value.modelurl" label="Model Url" required />
      </v-col>
      <v-col sm="1" v-if="isModel">
        <v-checkbox label="tf hub" v-model="props.modelValue.value.tfhub" />
      </v-col>
      <v-col sm="1">
        <v-checkbox v-model="ShowPrivateOnly" label="Private Only" />
      </v-col>
      <v-col sm="1">
        <v-checkbox v-model="FollowFlow" label="Follow Flow" />
      </v-col>
    </v-row>

  <!-- <v-text-field v-model="count" label="Element count" readonly />
    <v-text-field v-model="nodeCount" label="Node count" readonly />
    
    
    <v-text-field v-model="props.modelValue.value.name" :counter="100" :rules="nameRules" label="Workflow name" required />
    <v-text-field v-model="props.modelValue.value.name" :counter="100" :rules="nameRules" label="Model name" required />
    <v-select v-model="props.modelValue.value.modeltype" :items="['layers', 'graph']" label="Model Type" />
    <v-text-field v-model="props.modelValue.value.modelurl" label="Model URL" />
    <v-checkbox v-model="props.modelValue.value.tfhub" label="TF Hub" /> -->
  <div class="flowcontainer">
    <Sidebar :nodetypes="props.nodetypes" />
    <div class="basicflow" @drop="onDrop">

      <VueFlow v-model="elements" @dragover="onDragOver"
        v-if="props.modelValue && props.modelValue.value && nodeCount > 0" @node-double-click="onNodeDoubleClick"
        @selection-context-menu="onContextMenu($event, 'selection')" @edge-context-menu="onContextMenu($event, 'edge')"
        @pane-context-menu="onContextMenu($event, 'pane')" @node-context-menu="onContextMenu($event, 'node')"
        :snap-to-grid="true" :connect-on-click="true" :node-types="nodeTypes" :fit-view-on-init="true"
        :connection-radius="50" :auto-connect="true" :max-zoom="2" :min-zoom="0.01" :zoom-on-scroll="true"
        :zoom-on-double-click="false">
        <MiniMap pannable />

        <template #connection-line="{ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }">
          <ConnectionLine :source-x="sourceX" :source-y="sourceY" :target-x="targetX" :target-y="targetY"
            :source-position="sourcePosition" :target-position="targetPosition" />
        </template>
        <!-- 

        <Background :variant="BackgroundVariant.Lines" /> -->

        <Panel position="top-left" class="controls">
          <button style="background-color: #113285; color: white" title="Reset Transform" @click="resetTransform">
            <Icon name="reset" />
          </button>

          <!-- 6f3381 113285 6f3381 -->
          <button style="background-color: #33b843" @click="Run">
            <Icon name="play" />
          </button>
          <button style="background-color: #33a6b8" @click="onSave">
            <Icon name="save" />
          </button>
          <button style="background-color: #b83333" @click="onResetModel" v-if="isModel">
            <Icon name="red_exclamationpoint" />
          </button>
          <button class="error" v-if="errormessagenodeid != ''" @click="onGotoError">Goto Error</button>

        </Panel>
      </VueFlow>
    </div>
    <div class="resizer2"></div>
    <div class="data">
      <div v-if="showProperties" class="node-properties">
        <v-sheet class="mx-auto">
        <v-form ref="form">
          <v-btn @click="ToogleShowProperties">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <component :is="dynamicComponent" :node="selectedNode" :client="componentclient"></component>
        </v-form>
        </v-sheet>
      </div>
      <div v-if="!showProperties">
        <button class="reset-button" @click="ResetLogitems">Reset</button>
        <EasyDataTable ref="refdatatable" :items="logitems" :headers="logheaders" :hide-rows-per-page="true"
          :rows-per-page="rowsPerPage" :currentPage="currentPage">
          <template #item-name="item">
            <div @mouseover="HighlightNode(item.id)" @mouseleave="UnhighlightNode(item.id)" >
              <span @click="GotoNode(item.id)">{{ item.name }}</span><br />
              <div @click="CopyText(item.message)" v-if="item.message != null && item.message != ''">{{ item.message }}
              </div>
            </div>
          </template>
          <template #item-dt="item">
            {{ formatDate(item.dt, item.firstdt, item.lastdt) }}
          </template>
          <template #item-firstdt="item">
            {{ formatDate(item.dt, item.firstdt, item.lastdt) }}
          </template>
          <template #item-lastdt="item">
            {{ formatDate(item.dt, item.lastdt, item.firstdt) }}
          </template>
        </EasyDataTable>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
// TODO: implement https://github.com/dagrejs/dagre for layout npm i @dagrejs/dagre

import Icon from './Icon.vue'
import ConnectionLine from './SnappableConnectionLine.vue'
import ContextMenu from '@imengyu/vue3-context-menu'
import { onUnmounted } from 'vue';
import { Background, BackgroundVariant } from '@vue-flow/background'
import { Panel, VueFlow, useVueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/minimap/dist/style.css'

import Sidebar from './ExtVueflowNodes.vue'
import { openiap } from "@openiap/jsapi";

import eventBus from '../eventBus'
import { computed } from 'vue'
import { nextTick, markRaw, watch, Ref, ref, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
// import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';

const nodeTypes: any = ref({
});
// let flow = ref({});
interface props {
  modelValue: any;
  nodetypes: any;
  client: openiap;
}

const props: props = defineProps({
  // flow: {
  //   required: true,
  //   default: () => ({ value: {} }),
  // },
  modelValue: {
    default: {},
    sync: true
  },
  client: {
    required: true,
    type: openiap
  },
  nodetypes: {
    type: Object,
    required: true,
  }
})
const isModel = computed(() => {
  return props.modelValue != null && props.modelValue.value != null && props.modelValue.value._type == "model";
})
const emit = defineEmits(['update:modelValue'])
watch(props.modelValue, async (newValue) => {
  if (newValue != null) {
    onRestore()
    await RegisterQueue();
  }
});
if (monaco.languages.typescript != null) {
  monaco.languages.typescript.typescriptDefaults.addExtraLib(`
declare interface message {
  [key: string]: any;
  payload: any;
}
declare interface engine {
  nodes: node[];
  node_types: { type: string, node: any }[];
  client: openiap;
  messages: IHashTable<message>;
  flow: workflow;
  model: any;
  loadflow(): Promise<void>;
  ForwardMessage: (message: message, node: node_def, handle: string, msgid: string) => Promise<void>;
  SendNodeData: (message: message, nodeid: string, data: any) => Promise<void>;
  SendPushGraphData: (message: message, nodeid: string, label: string, data: any[]) => Promise<void>;
  runNode: (replyto: string, edge: any, nodedef: node_def, msgid: string) => Promise<void>;
  Start: (message: message) => Promise<message>;
  onConnected: (client: openiap) => Promise<void>;
}
declare interface node_def {
  id: string;
  type: string;
  label: string;
  data: any;
}
declare interface edge_def {
  id: string;
  type: string;
  name: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}
declare interface node {
  id: string;
  type: string;
  startnode: boolean;
  endnode: boolean;
  label: string;
  data: any;
  source_edges: edge_def[];
  target_edges: edge_def[];
  unmount: (engine: engine) => Promise<void>;
  mount: (engine: engine) => Promise<void>;
  run: (engine: engine, flow: workflow, edge: edge_def, msgid: string) => Promise<void>;
}
declare interface workflow = {
  _id: string;
  _type: string;
  name: string;
  nodes: node_def[];
  edges: edge_def[];
}
`);
  monaco.languages.typescript.typescriptDefaults.addExtraLib(`
declare var tf: any;
declare var fs: any;
  `);
}
// import { Background, BackgroundVariant, Controls, MiniMap } from '@vue-flow/additional-components'
const refdatatable = ref<any>(null);
const currentPage = ref(1);
const rowsPerPage = ref(10);
const ShowPrivateOnly = ref(false);
const FollowFlow = ref(false);
const errormessagenodeid = ref("")
interface logitem {
  dt: Date;
  lastdt: Date;
  firstdt: Date;
  name: string;
  action: string;
  id: string;
  message: string;
}
class Logitem implements logitem {
  dt: Date;
  lastdt: Date;
  firstdt: Date;
  name: string;
  action: string;
  id: string;
  message: string;
  constructor() {
    this.dt = new Date();
    this.firstdt = new Date();
    this.lastdt = new Date();
    this.name = "";
    this.action = "";
    this.id = "";
    this.message = "";
  }
}
const logitems = ref<logitem[]>([])
const logheaders = ref([
  { text: "first", value: "firstdt" },
  { text: "last", value: "lastdt" },
  { text: "Action", value: "action" },
  { text: "Name", value: "name" }
])
/**
 * @type {openiap}
 */
let queue = ref("")
let exchage = ref("")


const nameRules = [
  v => !!v || 'Label is required',
  v => (v && v.length <= 30) || 'Label must be less than 10 characters',
  v => (v && v.length > 5) || 'Label must be more than 5 characters'
]


function ResetLogitems() {
  logitems.value = [];
}
function addLogitem(item: logitem) {
  let lastitem = logitems.value[logitems.value.length - 1];
  if (lastitem != null) item.lastdt = lastitem.dt;
  let firstitem = logitems.value[0];
  if (firstitem != null) item.firstdt = firstitem.dt;
  logitems.value.push(item);
}
function mapNodes() {
  for (let i = 0; i < props.nodetypes.length; i++) {
    const n = props.nodetypes[i];
    nodeTypes.value[n.type] = markRaw(n.node);
  }
}
function formatDate(dt, firstdt, lastdt) {
  if (isValidDate(dt)) {
    const date = new Date(dt);
    if (lastdt == null) lastdt = new Date();
    if (firstdt == null) firstdt = new Date();

    const diff = date.getTime() - firstdt.getTime();
    if (diff < 1000) {
      return `${diff}ms ago`;
    }
    if (diff < 1000 * 60) {
      return `${Math.floor(diff / 1000)}s ago`;
    }
    if (diff < 1000 * 60 * 60) {
      return `${Math.floor(diff / 1000 / 60)}m ago`;
    }
    if (diff < 1000 * 60 * 60 * 24) {
      return `${Math.floor(diff / 1000 / 60 / 60)}h ago`;
    }
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
  }
  return dt; // Return original value if it's not a date
}
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date as any);
}

watch(() => logitems, (newValue) => {
  nextTick(() => {
    const lastpagenumber = Math.ceil(logitems.value.length / rowsPerPage.value);
    if (refdatatable.value != null && refdatatable.value.updatePage != null) {
      refdatatable.value.updatePage(lastpagenumber);
    }
  })
}, { deep: true });
watch(() => props.nodetypes, (newValue) => {
  mapNodes();
});
onMounted(async () => {
  mapNodes();
  RegisterEvents();
  onRestore();
  await RegisterQueue();
})

onBeforeUnmount(async () => {
  await UnregisterQueue();
  UnRegisterEvents();
});

function onCopy(e) {
  if (showProperties.value == true) { return; }
  const selectedNodes = instance.nodes.value.filter(x => x.selected == true);
  const selectedEdges = instance.edges.value.filter(x => x.selected == true);
  if (selectedNodes.length > 0) {
    var json = JSON.stringify({ selectedNodes, selectedEdges });
    e.clipboardData.setData('application/json', json);
    e.preventDefault();
  }
}
let mousemove = null;
function onPaste(e) {
  if (showProperties.value == true) { return; }
  var json = e.clipboardData.getData('application/json');
  // console.log("onPaste", json)
  const { selectedNodes, selectedEdges } = JSON.parse(json);
  instance.nodes.value.filter(x => x.selected == true).map(x => x.selected = false);
  instance.edges.value.filter(x => x.selected == true).map(x => x.selected = false);
  // addNode(node.type, mousemove, null, null, node);
  selectedNodes.map(node => {
    var newid = getId();
    selectedEdges.filter(x => x.source == node.id).map(x => x.source = newid);
    selectedEdges.filter(x => x.target == node.id).map(x => x.target = newid);

    node.id = newid;
    var exists = instance.nodes.value.find(x => x.label == node.label);
    if(exists != null) {
      var label = node.label;
      // remove all numbers
      label = label.replace(/\d+/g, '');
      node.label = label + newid;
    }
    node.position.x += 10;
    node.position.y += 10;
  })
  selectedEdges.map(edge => {
    edge.id = getId();
  })
  instance.addNodes(selectedNodes)
  instance.addEdges(selectedEdges);
  zoomToNode(selectedNodes.map(x => x.id))
}
function keydown(e) {
  let ele = document.activeElement
  while (ele?.parentElement != null) {
    if (ele?.parentElement?.classList.contains('node-properties')) {
      return;
    }
    ele = ele?.parentElement;
  }
  // esc
  if (e.key == "Escape") {
    if (showProperties.value == true) {
      ToogleShowProperties();
      return;
    }
    instance.nodes.value.map(x => x.selected = false);
    instance.edges.value.map(x => x.selected = false);
  }
  if (e.key == "z" && e.ctrlKey) {
    if (node_hist.length > 0) {
      const nodes = node_hist.pop();
      onRestoreJson(nodes)
    }
  }
  if (e.key == "a" && e.ctrlKey) {
    if (showProperties.value == true) { return; }
    instance.nodes.value.map(x => x.selected = true);
    instance.edges.value.map(x => x.selected = true);
    e.preventDefault();
    e.stopPropagation();
  }
  if (e.key == "Delete") {
    if (showProperties.value == true) { return; }
    const selectedNodes = instance.nodes.value.filter(x => x.selected == true);
    const selectedEdges = instance.edges.value.filter(x => x.selected == true);
    if (selectedNodes.length > 0) {
      instance.removeNodes(selectedNodes.map(x => x.id))
    }
    if (selectedEdges.length > 0) {
      instance.removeEdges(selectedEdges.map(x => x.id))
    }
  }
}
function onMousemove(e) {
  mousemove = e;
}
function RegisterEvents() {
  document.addEventListener('mousemove', onMousemove)
  document.addEventListener('copy', onCopy)
  document.addEventListener('paste', onPaste)
  document.addEventListener('keydown', keydown)
}
function UnRegisterEvents() {
  document.removeEventListener('mousemove', onMousemove)
  document.removeEventListener('copy', onCopy)
  document.removeEventListener('paste', onPaste)
  document.removeEventListener('keydown', keydown)
}
async function mqMessage(msg, payload, user, jwt) {
  try {

    const { command, nodeid, edgeid } = payload;
    // console.log("mqMessage", command, nodeid, JSON.stringify(payload).length)
    if (payload.requestor != queue.value && ShowPrivateOnly.value == true) {
      return;
    }
    var log = new Logitem();
    log.action = command.toUpperCase();
    const node = instance.findNode(nodeid)
    const edge = instance.findEdge(edgeid)
    if (command == "error") {
      try {
        payload.error = JSON.parse(payload.error)
      } catch (error) {
      }
      log.name = "flow"
      log.action = "ERROR"
      log.id = props.modelValue.value._id
      log.message = payload.error.message ? payload.error.message : payload.error
      addLogitem(log);
      errormessagenodeid.value = "";
    }

    if (command == "receive") {
      if (node == null) { console.error("receive: node not found", nodeid); return; }
      log.name = node.label as string
      log.id = node.id
      addLogitem(log);
      if (edge != null) {
        edge.animated = true;
      }
      HighlightNode(nodeid)
    }
    if (command == "forward") {
      if (node == null) { console.error("forward: node not found", nodeid); return; }
      log.name = node.label as string
      node.class = node.class?.toString().replace("error", "")
      log.id = node.id
      // addLogitem(log);
      UnhighlightNode(nodeid)
      for (let i = 0; i < instance.edges.value.length; i++) {
        const edge = instance.edges.value[i];
        if (edge.target != nodeid) { continue; }
        UnhighlightEdge(edge.id)
      }
    }
    if (command == "flowerror") {
      try {
        payload.error = JSON.parse(payload.error)
      } catch (error) {

      }
      log.name = node?.label as string
      log.action = "ERROR"
      log.id = node?.id as string
      log.message = payload.error.message ? payload.error.message : payload.error;
      addLogitem(log);
      if (node == null) { console.error("flowerror: node not found", nodeid); return; }
      node.class = "error"
      eventBus.$emit('receive-node-error', { id: nodeid }, payload.error)
      errormessagenodeid.value = nodeid;
    }
    if (command == "notifynode") {
      if (node == null) { console.error("notifynode: node not found", nodeid); return; }
      eventBus.$emit('receive-node-data', { id: nodeid }, payload.data)
    }
  } catch (error) {
    console.error(error)
  }
}



async function UnregisterQueue() {
  const _queue = queue.value;
  const _exchage = exchage.value;
  queue.value = "";
  exchage.value = "";
  if (_queue != null || _queue != "") {
    await props.client.UnRegisterQueue({ queuename: _queue });
  }
  if (_exchage != null || _exchage != "") {
    await props.client.UnRegisterQueue({ queuename: _exchage })
  }
}

async function RegisterQueue() {
  try {
    if (queue.value == null || queue.value == "") {
      queue.value = "BLOCK";
      queue.value = await props.client.RegisterQueue({ queuename: "" }, mqMessage);
    }
    if (exchage.value == null || exchage.value == "") {
      if (props.modelValue.value != null && props.modelValue.value._id != null && props.modelValue.value._id != "") {
        exchage.value = "BLOCK";
        exchage.value = await props.client.RegisterExchange({ exchangename: props.modelValue.value._id }, mqMessage);
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const instance = useVueFlow({})
function onDragOver(event) {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}
const node_hist: any[] = [];
let dragging = false;
let updating = true;
instance.onNodeDragStart((node) => {
  dragging = true;
})
instance.onNodeDragStop((node) => {
  dragging = false;
})
instance.onNodesChange((nodes) => {
  if (dragging == true || updating == true) {
    return;
  }
  var obj: any = instance.toObject();
  node_hist.push(JSON.stringify(obj));
  if (node_hist.length > 100) {
    node_hist.shift();
  }
})

let id = 0
function getId() {
  do {
    id++;
    let found = false;
    for (let i = 0; i < elements.value.length; i++) {
      // ts-ignore
      if (elements.value[i] != null && elements.value[i].id == id.toString()) {
        found = true;
        // break
      }
    }
    if (!found) {
      return `${id}`
    }
  } while (true);
}
function onDrop(event) {
  try {
    const { name, type } = JSON.parse(event.dataTransfer?.getData('application/vueflow'));
    addNode(type, name, event, undefined, undefined, undefined)
  } catch (error) {
    console.error(error)
  }
}
function addNode(type, name, event, targetnode, targetedge, data) {
  if (instance.vueFlowRef.value == null) return;
  const { left, top } = instance.vueFlowRef.value.getBoundingClientRect()

  const position = instance.project({
    x: event.clientX - left,
    y: event.clientY - top,
  })

  const id = getId();
  let label = name + " #" + id;
  const newNode = {
    id,
    type,
    position,
    label,
    data: {} as any,
    //label: `${type} node #${id}`,
  }

  if (data != null) {
    newNode.data = data.data;
    if (data.label != null && data.label != "") newNode.label = data.label;
    // newNode.position = data.position;
  }
  instance.addNodes([newNode])

  // align node position after drop, so it's centered to the mouse
  nextTick(() => {
    const node = instance.findNode(newNode.id)
    if (node == null) return;
    const stop = watch(
      () => node.dimensions,
      (dimensions) => {
        if (dimensions.width > 0 && dimensions.height > 0) {
          node.position = { x: node.position.x - node.dimensions.width / 2, y: node.position.y - node.dimensions.height / 2 }
          stop()

          if (targetnode != null) {

            // instance.addEdges([{ source: targetnode.id, target: newNode.id }])
            // instance.addEdges([{id: 'e1-2', source: '1', target: '2', label: 'this is an edge label'}]);
            var newEgde = { id: getId(), source: targetnode.id, target: newNode.id, label: 'this is an edge label' };
            instance.addEdges([newEgde]);

          }

        }
      },
      { deep: true, flush: 'post' },
    )
  })
}
const elements: Ref<any> = ref([]);
const count = ref(elements.value.length)
watch(elements, (newElements) => {
  count.value = newElements.length
})


// const resetTransform = () => instance.setViewport({ x: 0, y: 0, zoom: 1 })
const resetTransform = () => {
  instance.setViewport({ x: 0, y: 0, zoom: 1 });
  setCookie('flow_layout_properties', null, 7); // Save for 7 days
  setCookie('flow_layout', null, 7); // Save for 7 days
}


const onSend = async (config, msg) => {
  var node = instance.findNode(config.id)
  if (node == null) {
    return;
  }
  node.class = ""
  var log: logitem = new Logitem();
  log.name = node.label as string;
  log.action = "inject";
  log.id = node.id;
  try {
    // await onSave();
    addLogitem(log);
    const result = await props.client.QueueMessage({ queuename: props.modelValue.value._id, data: { nodeid: node.id, command: "inject" } }, true)
    if (result.error != null) {
      let log = new Logitem();
      log.name = "onsend";
      log.action = "ERROR";
      log.id = props.modelValue.value._id;
      log.message = result.error.message ? result.error.message : result.error;
      addLogitem(log);
    }
  } catch (error: any) {
    log.action = "ERROR"
    log.message = error.message ? error.message : error
    addLogitem(log);
    console.error(error)
  }
}

const onResetUiElements = async (config, msg) => {
  logitems.value = [];
  instance.nodes.value.map(x => x.class = "");
  instance.edges.value.map(x => x.class = "");
  instance.edges.value.map(x => x.animated = false);

}
async function OnNodeSendData(config, data) {
  const { id } = config;
  try {
    const result = await props.client.QueueMessage({ queuename: props.modelValue.value._id, data: { nodeid: id, command: "node-uievent", data } }, true)
    if (result != null) {
      eventBus.$emit('receive-node-uievent', { id }, result)
    }
    if (result.error != null) {
      let log = new Logitem();
      log.name = "uievent";
      log.action = "ERROR";
      log.id = props.modelValue.value._id;
      log.message = result.error.message ? result.error.message : result.error;
    }
  } catch (error) {
    console.error(error)
    eventBus.$emit('receive-node-uievent', { id }, { error })
  }
}
async function onAddLogItem(config, data) {
  const { id } = config;
  var log = new Logitem();
  log.name = data.name;
  log.action = data.action;
  log.id = id;
  log.message = data.message;
  addLogitem(log);
}




onUnmounted(() => {
  eventBus.$off('onSend', onSend)
  eventBus.$off('reset-ui-elements', onResetUiElements)
  eventBus.$off('workflow-save', onSave)
  eventBus.$off('send-node-uievent', OnNodeSendData)
  eventBus.$off('add-logitem', onAddLogItem)
});


eventBus.$on('onSend', onSend)
eventBus.$on('reset-ui-elements', onResetUiElements)
eventBus.$on('workflow-save', onSave)
eventBus.$on('send-node-uievent', OnNodeSendData)
eventBus.$on('add-logitem', onAddLogItem)



let showProperties = ref(false)
const ToogleShowProperties = () => {
  showProperties.value = !showProperties.value;
  if (showProperties.value == false) {
    if (selectedNode.value != null) {
      // @ts-ignore
      selectedNode.value.selected = false;
      // UnhighlightNode(selectedNode.value.id)
    }
    onSave();
    nextTick(() => {
      const lastpagenumber = Math.ceil(logitems.value.length / rowsPerPage.value);
      if (refdatatable.value != null && refdatatable.value.updatePage != null) {
        refdatatable.value.updatePage(lastpagenumber);
      }
    })
  }
}

function updatePropertyEditor(component, node) {
  selectedNode.value = node;
  showProperties.value = true;
  dynamicComponent.value = component;

}
eventBus.$on('update-property-editor', updatePropertyEditor)


async function Run() {
  logitems.value = []
  errormessagenodeid.value = ""
  try {
    const result = await props.client.QueueMessage({ queuename: props.modelValue.value._id, data: { command: "run" } }, true)
    if (result.error != null) {
      let log = new Logitem();
      log.name = "flow";
      log.action = "ERROR";
      log.id = props.modelValue.value._id;
      log.message = result.error.message ? result.error.message : result.error;
      addLogitem(log);
    }
  } catch (error) {
    console.error(error)
  }
}
function HighlightNode(id) {
  if (FollowFlow.value == true) {
    zoomToNode(id)
  } else {
    setTimeout(() => {
      var node = instance.findNode(id)
      if (node == null) return;
      node.class = node.class?.toString().replace("highlight", "")
      // if(node.class != null && node.class.indexOf("error") > -1) return;
      node.class = node.class?.trim() + " highlight"
    }, 20);
  }
}
function UnhighlightNode(id, ms = 1000) {
  setTimeout(() => {
    var node = instance.findNode(id)
    if (node == null) return;
    node.class = node.class?.toString().replace("highlight", "")
  }, ms);
}
function UnhighlightEdge(id, ms = 1000) {
  setTimeout(() => {
    var edge = instance.findEdge(id)
    if (edge == null) { return; }
    if (edge.animated != true) { return; }
    if (edge != null && edge.animated == true) {
      edge.animated = false
    }
  }, ms);
}
function onGotoError() {
  zoomToNode(errormessagenodeid.value)
}
function zoomToNode(nodeIds, duration = 500, padding = 1) {
  var _nodeids = nodeIds;
  if (!Array.isArray(nodeIds)) _nodeids = [nodeIds];
  instance.fitView({
    nodes: _nodeids,
    duration, // use this if you want a smooth transition to the node
    padding // use this for some padding around the node
  })
}
async function GotoNode(id) {
  var node = instance.findNode(id)
  if (node == null) { return; }
  zoomToNode(id)
}
function CopyText(text) {
  if(text == null) return;
  console.log("COPYING TEXT", text);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => console.log("Text copied to clipboard"))
        .catch(err => console.error("Failed to copy text: ", err));
    } else {
      console.error("Clipboard API not available");
    }
  } catch (error) {
    console.error(error)
  }
}

const dynamicComponent = shallowRef(null);
const selectedNode = ref(null);
const componentclient = ref(null);
async function onNodeDoubleClick(e) {
  const { connectedEdges, event, node } = e;

  var n = props.nodetypes.find(x => x.type == node.type);
  if (n == null) {
    console.log("onNodeDoubleClick.Failed locating node")
    return;
  }
  dynamicComponent.value = n.editor;
  // var i = await import('./' + node.type + 'Prop.vue');
  // const InjectProp = defineComponent(i);
  // @ts-ignore
  componentclient.value = props.client;
  selectedNode.value = node;
  showProperties.value = true;
  // @ts-ignore
  // dynamicComponent.value = InjectProp.default;
}

const onContextMenu = (e, soruce) => {
  let { x, y } = e;

  if (e.event) {
    x = e.event.x;
    y = e.event.y;
    e.event.preventDefault();
  } else {
    e.preventDefault();
  }
  const items: any[] = [
  ]
  if (e.edge != null || e.node != null) {
    items.push({
      label: "Delete",
      onClick: () => {
        if (e.edge?.id != null) {
          instance.removeEdges([e.edge.id])
        } else if (e.node?.id != null) {
          instance.removeNodes([e.node.id])
        }
      }
    })
  }
  items.push({
    label: "Add",
    onClick: () => {
      addNode("csv", "csv", e.event, e.node, e.edge, undefined)
    }
  })
  if (items.length == 0) {
    return
  }
  // (dark.value === true) ? 'dark' : 'default'
  ContextMenu.showContextMenu({
    theme: "default",
    x,
    y,
    items
  });
}

async function onSave() {
  errormessagenodeid.value = ""
  var obj = instance.toObject();
  // cleanup UI properties
  obj.nodes.map(x => x.class = "")
  obj.edges.map(x => x.class = "")
  obj.edges.map(x => x.animated = false);
  props.modelValue.value.nodes = obj.nodes;
  props.modelValue.value.edges = obj.edges;
  props.modelValue.value.position = obj.position;
  props.modelValue.value.zoom = obj.zoom;

  props.modelValue.value.snapToGrid = instance.snapToGrid.value;
  props.modelValue.value.snapGrid = instance.snapGrid.value;
  emit('update:modelValue', props.modelValue.value);
}
async function onResetModel() {
  errormessagenodeid.value = ""
  try {
    const result = await props.client.QueueMessage({ queuename: props.modelValue.value._id, data: { id: props.modelValue.value._id, command: "resetmodelweights" } }, true)
    console.log(result)
  } catch (error) {
    console.error(error)
  }
}
async function onRestoreJson(json) {
  if (json == null || json.length < 5) return;
  nextTick(() => {
    var obj = JSON.parse(json);
    var currentobj = instance.toObject();
    if (obj.snapToGrid != null) {
      instance.snapToGrid.value = obj.snapToGrid;
    }
    if (obj.snapGrid != null) {
      instance.snapGrid.value = obj.snapGrid;
    }
    instance.connectOnClick.value = true;
    instance.autoConnect.value = true;
    instance.connectionRadius.value = 50;
    obj.nodes.forEach((node) => {
      node.class = "";
    });
    currentobj.nodes.forEach((node) => {
      node.class = "";
    });
    var oldnodes = JSON.stringify(currentobj.nodes);
    var newnodes = JSON.stringify(obj.nodes);
    if (oldnodes != newnodes) {
      instance.setNodes(obj.nodes)
      showProperties.value = false;
    }
    instance.setEdges(obj.edges)
    const [x = 0, y = 0] = obj.position
    let setTransErrCounter = 0;
    const setTrans = () => {
      try {
        if (setTransErrCounter > 10) return;
        instance.setTransform({ x, y, zoom: obj.zoom || 0 })
        setTransErrCounter = 0;
      } catch (error) {
        setTransErrCounter++;
        setTimeout(() => { setTrans(); }, 500);
      }
    }
    setTimeout(() => { setTrans(); }, 500);
    updating = false;
  });
}
async function onRestore() {
  try {
    // instance.$reset()
  } catch (error) {
  }

  if (props.modelValue.value != null) {
    onRestoreJson(JSON.stringify(props.modelValue.value))
  } else {
    updating = false;
  }
}



function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
watch(showProperties, (newValue) => {
  loadLayout()
})
function loadLayout() {
  let layout = getCookie('flow_layout');
  if (showProperties.value == true) {
    layout = getCookie('flow_layout_properties');
  }
  if (layout) {
    const leftSide = document.querySelector('.basicflow');
    const rightSide = document.querySelector('.data');
    if (leftSide == null || rightSide == null) return;

    let dimensions = layout.split(',');
    if (dimensions.length === 2) {
      // @ts-ignore
      leftSide.style.flex = `0 0 ${dimensions[0]}%`;
      // @ts-ignore
      rightSide.style.flex = `0 0 ${dimensions[1]}%`;
    }
  }
}

setTimeout(() => {
  const resizer = document.querySelector('.resizer2'); // Ensure this matches your HTML
  const leftSide = document.querySelector('.basicflow');
  const rightSide = document.querySelector('.data');
  if (leftSide == null || rightSide == null || resizer == null) return;
  const container = leftSide.parentNode; // Assuming the container wraps both columns

  let isDragging = false;
  let initialMouseX, initialLeftWidth, initialRightWidth;

  loadLayout()
  // Function to convert width to flex-basis percentage
  function widthToFlexBasis(width, totalWidth) {
    return (width / totalWidth) * 100;
  }

  resizer.addEventListener('mousedown', function (e: any) {
    e.preventDefault();
    isDragging = true;
    initialMouseX = e.clientX;
    // @ts-ignore
    initialLeftWidth = leftSide.offsetWidth;
    // @ts-ignore
    initialRightWidth = rightSide.offsetWidth;
  });

  window.addEventListener('mousemove', function (e) {
    if (!isDragging) return;

    const deltaX = e.clientX - initialMouseX;
    let leftWidth = initialLeftWidth + deltaX;
    let rightWidth = initialRightWidth - deltaX;

    if (leftWidth > 100 && rightWidth > 100) { // Simplified condition
      // @ts-ignore
      leftSide.style.flex = `0 0 ${widthToFlexBasis(leftWidth, container?.offsetWidth)}%`;
      // @ts-ignore
      rightSide.style.flex = `0 0 ${widthToFlexBasis(rightWidth, container?.offsetWidth)}%`;
    }
  });

  window.addEventListener('mouseup', function () {
    if (isDragging) {
      // @ts-ignore
      let totalWidth = container?.offsetWidth;
      // @ts-ignore
      let leftWidth = leftSide?.offsetWidth;
      // @ts-ignore
      let rightWidth = rightSide?.offsetWidth;
      let leftFlexBasis = widthToFlexBasis(leftWidth, totalWidth);
      let rightFlexBasis = widthToFlexBasis(rightWidth, totalWidth);
      if (showProperties.value == true) {
        setCookie('flow_layout_properties', `${leftFlexBasis},${rightFlexBasis}`, 7); // Save for 7 days
      } else {
        setCookie('flow_layout', `${leftFlexBasis},${rightFlexBasis}`, 7); // Save for 7 days
      }
      isDragging = false;
    }
  });

}, 500);

// const safeFlowName = computed(() => props.modelValue.value?.name || '');
const safeFlowName = computed({
  get: () => props.modelValue.value?.name || '', // Safely access name or provide a default
  set: (newValue) => {
    if (props.modelValue && props.modelValue.value) {
      props.modelValue.value.name = newValue; // Update the name when it changes
    }
  },
});

const nodeCount = computed(() => (nodeTypes.value ? Object.keys(nodeTypes.value).length : 0));

</script>
<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";
@import "FlowTest.css";
</style>
<style scoped>
.reset-button {
  background-color: #33a6b8;
  color: white;
  border: none;
  padding: 5px 10px;
  text-align: center;
  text-decoration: none;
}
.data {
  /* min-width: 100px;  */
  flex: 0 0 25%; /* Adjust the width as necessary */
  /*height: 100%;  Full height of the container */
  /* Other styling as needed */
  overflow-y: scroll; 
  max-height: 80vh; 
  
  box-sizing: border-box;
}

</style>