<template>
  <!-- <div class="row">
    <div class="col-2">
      <div class="form-group">
        <div class="btn-group-vertical buttons" role="group" aria-label="Basic example">
          <button class="btn btn-secondary" @click="add">Add</button>
          <button class="btn btn-secondary" @click="replace">Replace</button>
        </div>

        <div class="form-check">
          <input id="disabled" type="checkbox" v-model="enabled" class="form-check-input" />
          <label class="form-check-label" for="disabled">DnD enabled</label>
        </div>
      </div>
    </div>
    <div class="col-6">
      <h3>Draggable {{ draggingInfo }}</h3>

      <draggable :list="list" :disabled="!enabled" item-key="name" class="list-group" ghost-class="ghost"
        :move="checkMove" @start="dragging = true" @end="dragging = false">
        <template #item="{ element }">
          <div class="list-group-item" :class="{ 'not-draggable': !enabled }">
            {{ element.name }}
          </div>
        </template>
      </draggable>
    </div>

    <rawDisplayer class="col-3" :value="list" title="List" />
  </div> -->
  <div class="row" id="status"></div>
  <div class="row">

    <!-- <vuep5 @draw="draw" @setup="setup" @keypressed="keypressed"></vuep5> -->
  </div>
  <!-- <div class="row">
    <div class="col">
      <button type="button" class="button primary col-3" v-on:click="Save"
      v-shortkey.propagte="['alt', 's']" @shortkey="Save">Save
      </button>
      <button @click="Insert" class="button hidden" v-shortkey.propagte="['insert']" @shortkey="Insert">Insert
        key</button>
      <button @click="SwapMode('json')" class="button">json</button>
      <button @click="SwapMode('form')" class="button">form</button>
      <ACL v-model="item" :showinvoke="collectionname=='users'||collectionname=='openrpa'||collectionname=='mq'" ></ACL>
    </div>
  </div>
  <section v-if="mode=='form'">
    <div class="row">
      <div class="col">
        <h1>{{item.name}}</h1>
      </div>
    </div>
    <div v-if="errormessage" class="row">
      <div class="col">
        <div class="card">
          <h1 class="text-error">{{errormessage}}</h1>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <img src="./images/delete.png" class="operation-icon disabled" />
        name
      </div>
      <div class="col">
        <editableTextField v-model="item.name" />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <img src="./images/delete.png" class="operation-icon disabled" />
        type
      </div>
      <div class="col">
        <editableTextField v-model="item._type" />
      </div>
    </div>
    <div class="row">
      <div class="col">
    
        <div v-for="(service, i) in item" :key="i">
          <div v-if="!i.startsWith('_') && i != 'name'" class="row">
            <editableTextField v-if="editingname == i" class="col" v-model="newname" @escaped="CancelEditname"
              @accepted="AcceptEditname" :emitevents="emitevents" Editing=true>
            </editableTextField>
            <div v-if="editingname != i && i != '_type' && i != 'name'" class="col"><img src="./images/delete.png"
                class="operation-icon" @click="delete item[i]" /><span @click="EditName(i)">{{i}}</span></div>
            <div v-if="editingname != i && (i == '_type' || i == 'name')" class="col">{{i}}</div>
            <div class="col">
              <editableTextField v-model="item[i]"></editableTextField>
            </div>
    
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <small>click field to edit, press insert to add field, press esc to cancel</small>
      </div>
    </div>
    </section>
    <textarea v-if="mode=='json'" ref="myTextarea" v-model="json" rows="20" :min-height="30" :max-height="350" />
        <div class="row">
          <div class="col">
        <button type="button" class="button primary col-3" v-on:click="Save"
        v-shortkey.propagte="['ctrl', 's']" @shortkey="Save">Save
        </button>
        <button @click="Insert" class="button hidden" v-shortkey.propagte="['insert']" @shortkey="Insert">Insert
          key</button>
          <button @click="SwapMode('json')" class="button">json</button>
          <button @click="SwapMode('form')" class="button">form</button>
          <button @click="SwapMode('acl')" class="button">acl</button>
    </div>
  </div> -->
</template>
<script>
import { mapGetters } from 'vuex';
import editableTextField from '@/components/editableTextField.vue';
import ResizeByMixin from '@/components/ResizeByMixin.vue';
import TypeAheadQuery from '@/components/TypeAheadQuery.vue';
import ACL from '@/components/ACL.vue';
import { Util } from '@/Util';
import { Base } from "./../Base"
import draggable from "vuedraggable";
import rawDisplayer from '@/components/rawDisplayer.vue';

// import vuep5 from '@/components/vuep5.vue';
// import ml5 from 'ml5';
import * as uil from 'uil';

// import * as tf from '@tensorflow/tfjs-node';
// import * as tf from '@tensorflow/tfjs';


let id = 1;
export default {
  name: 'EntityView',
  emits: ['update:item'],
  components: {
    editableTextField,
    ResizeByMixin,
    TypeAheadQuery,
    ACL,
    draggable,
    rawDisplayer,
  },
  data() {
    return {
      json: "",
      item: new Base(),
      errormessage: '',
      editingname: '',
      emitevents: false,
      newname: 'newname',
      mode: 'form',
      user: new Base(),

      enabled: true,
      list: [
        { name: "John", id: 0 },
        { name: "Joao", id: 1 },
        { name: "Jean", id: 2 }
      ],
      dragging: false,

      sk: null,
      model: null,
      resolution: 20,
      cols: 0,
      rows: 0,

      video: null,
      yolo: null,
      status: null,
      objects: [],
      gui: null,
      runBest: false,
      params: {
        epochs: 50,
        epoch: 0,
        loss: 0,
        activation: 'relu', // sigmoid
        vector: { x: 10, y: -30 },
        graphUp: null,
        ny: 0,
        learningRate: 0.25,
        isTraining: false,
        toggleTraining: () => {
          if (!this.params.isTraining) {
            this.params.uiloss.open();
            this.params.uiepoch.open();
            this.params.uitrain.label("training . . .")
            this.beginTraining();
          }
        },
      },

    }
  },
  props: ['collectionname', 'id'],
  computed: {
    ...mapGetters(['Signedin', 'Client']),
    draggingInfo() {
      return this.dragging ? "under drag" : "";
    }

  },
  created() {
    this.GetData()
  },
  watch: {
    Signedin: function (val, oldVal) {
      if (val == true && oldVal != val) {
        this.GetData();
      }
    },
    id: function (val, oldVal) {
      if (!Util.IsNullEmpty(val) == true && oldVal != val) {
        this.GetData();
      }
    },
  },
  methods: {
    setup(sk) {
      this.sk = sk;
      sk.createCanvas(600, 600);
      this.cols = sk.width / this.resolution;
      this.rows = sk.height / this.resolution;
      this.status = sk.select('#status');

      let colors = [
        { bg: '#ddd', text: '#333', button: '#ddd', select: '#0ff', back: '#ccc', size: 16, shadow: 'none', borderSize: 2, fontSize: '13', sx: 6, sy: 4, radius: 12, showOver: 0 },
        { shadow: '#000', font: "'Roboto Mono', monospace", fontSize: 14 },
        { backgroundOver: 'rgba(50,80,50,0.3)', content: '#000', bg: '#000', text: '#0c0', button: '#333', select: '#a00', back: '#222', font: 'Tahoma', fontSize: 16, weight: 'bold', shadow: 'none', sx: 12, sy: 10 }
      ]
      this.gui = new uil.Gui({ // create GUI
        w: 300,
        autoresize: true,
        colors: colors[2]
      });
      this.gui.add('title', {
        name: 'XOR laerning',
        h: 50
      });
      this.params.uilearningRate = this.gui.add(this.params, 'learningRate', { type: 'slide', min: 0.01, max: 1, precision: 2, step: 0.01 })
      this.params.uiepochs = this.gui.add(this.params, 'epochs', { type: 'slide', min: 1, max: 200, precision: 0, step: 1 })

      

      this.params.uiactivation = this.gui.add(this.params, 'activation', { type: 'list', 
        list: ['none', 'sigmoid', 'tanh', 'relu', 'elu', 'selu', 'softplus', 'softsign', 'softmax'], 
        miniCanvas:true, canvasBg:'green', h:30 })

      // ui.add( 'list',   { name:'List', list:list, miniCanvas:true, canvasBg:'green', h:30 })

      this.params.uitrain = this.gui.add('button', { name: 'Begin training', callback: this.params.toggleTraining });

      this.gui.add('fps', { h: 22, hplus: 70, res: 80 });
      
      var b = this.gui.add('fps', {
        name: 'epoch', h: 22, hplus: 90, custom: true, alpha: 1, res: 50,
        names: [''], cc: ['50,160,222', '222,120,50', '222,222,50'], // 
        range: [200], precision: 0, radius: 2, color: '#EEEEEE', adding: true
      })// .onOpen(this.updateGraph).onClose(this.stopGraph)
      // b.range = [1]
      // b.rSize()
      this.params.uiepoch = b;
      this.params.uiloss = this.gui.add('fps', {
        name: 'loss', h: 22, hplus: 90, custom: true, alpha: 1, res: 50,
        names: [''], cc: ['222,120,50'], // , '', '222,222,50'
        range: [1], precision: 5, radius: 2, color: '#EEEEEE', adding: true
      })// .onOpen(this.updateGraph).onClose(this.stopGraph)

      this.params.uiepoch.open();
      this.params.uiloss.open();
      this.updateGraph();

      let index = 0;
      for (let i = 0; i < this.cols; i++) {
        for (let j = 0; j < this.rows; j++) {
          let br = 255; //y_values[index] * 255
          sk.fill(br);
          sk.rect(i * this.resolution, j * this.resolution, this.resolution, this.resolution);
          sk.fill(255 - br);
          sk.textSize(6);
          sk.textAlign(sk.CENTER, sk.CENTER);
          // sk.text(sk.nf(0.5, 1, 2), i * this.resolution + this.resolution / 2, j * this.resolution + this.resolution / 2)
          //text(nf(y_values[index], 1, 2), i * resolution + resolution / 2, j * resolution + resolution / 2)
          // sk.text(sk.nf(0.5, 1, 2), i * this.resolution + this.resolution / 2, j * this.resolution + this.resolution / 2)
          let x1 = i / this.cols;
          let x2 = j / this.rows;
          // sk.text([x1.toFixed(2), x2.toFixed(2)].toString().replace(",", " | "), i * this.resolution + this.resolution / 2, j * this.resolution + this.resolution / 2)
          // sk.text([x1.toFixed(2), x2.toFixed(2)].toString().replace(",", " | "), i * this.resolution + this.resolution / 2, j * this.resolution + this.resolution / 2)

          index++;
        }
      }
    },
    updateGraph() {
      this.params.graphUp = requestAnimationFrame(this.updateGraph)
      if (this.params.ny == 4) {
        // this.params.graph.tick([5 * Math.random(), 5 * Math.random(), 8 * Math.random()])
        this.params.uiepoch.tick([this.params.epoch])
        this.params.uiloss.tick([this.params.loss])
        
        this.params.ny = 0
      }
      this.params.ny++
    },
    stopGraph() {
      cancelAnimationFrame(this.params.graphUp)
    },
    beginTraining() {

    },
    whileTraining(epoch, loss) {
      this.params.epoch = epoch;
      this.params.loss = loss.loss;
      this.status.html("epoch " + epoch + " loss: " + loss.loss);
      let xs = [];
      for (let i = 0; i < this.cols; i++) {
        for (let j = 0; j < this.rows; j++) {
          let x1 = i / this.cols;
          let x2 = j / this.rows;
          xs.push([x1, x2]);
        }
      }
      this.model.predictMultiple(xs, this.gotResults);
      this.model.save
    },
    finishedTraining() {
    },
    gotResults(error, results) {
      this.sk.background(0);
      if (error) {
        console.error(err)
        return
      }
      let index = 0;
      for (let i = 0; i < this.cols; i++) {
        for (let j = 0; j < this.rows; j++) {
          const value = results[index]; // [0].value
          let br = value * 255; //y_values[index] * 255
          this.sk.fill(br);
          this.sk.rect(i * this.resolution, j * this.resolution, this.resolution, this.resolution);
          this.sk.fill(255 - br);
          this.sk.textSize(8);
          this.sk.textAlign(this.sk.CENTER, this.sk.CENTER);
          this.sk.text(this.sk.nf(0.5, 1, 2), i * this.resolution + this.resolution / 2, j * this.resolution + this.resolution / 2)
          var t = this.sk.nf(value, 1, 2);
          this.sk.text(this.sk.nf(value, 1, 2), i * this.resolution + this.resolution / 2, j * this.resolution + this.resolution / 2)
          index++;
        }
      }

      // finishedTraining()
    },
    async test() {
    },
    draw(sk) {
      // sk.line(sk.pmouseX, sk.pmouseY, sk.mouseX, sk.mouseY);
    },
    keypressed(sk) {
      // convert the key code to it's string
      // representation and print it
      // const key = String.fromCharCode(sk.keyCode);
      // sk.print(key);
    },

    add: function () {
      this.list.push({ name: "Juan " + id, id: id++ });
    },
    replace: function () {
      do {
        this.list.pop();
      } while (this.list.length > 0)
      // this.list = [{ name: "Edgard", id: id++ }];
      this.list.push({ name: "Edgard", id: id++ });
    },
    checkMove: function (e) {
    },

    SwapMode(newmode) {
      this.mode = newmode;
      if (this.mode == 'json') {
        this.json = JSON.stringify(this.item, null, 2);
      } else {
        this.item = JSON.parse(this.json)
      }
    },
    EditName(i) {
      this.editingname = i;
      this.newname = i;
      setTimeout(() => { this.emitevents = true }, 200)
    },
    CancelEditname() {
      this.emitevents = false;
      this.editingname = '';
      this.newname = "newname"
    },
    AcceptEditname() {
      this.emitevents = false;
      if (this.newname != this.editingname) {
        this.item[this.newname] = this.item[this.editingname];
        delete this.item[this.editingname];
      }
      this.editingname = '';
      this.newname = "newname"
    },
    Insert() {
      this.item['newfield'] = '';
    },
    async GetData() {
      this.item.name = "new item";
      if (this.Signedin == true && !Util.IsNullEmpty(this.id)) {
        var results = await this.Client.Query({ collectionname: this.collectionname, query: { _id: this.id }, top: 1 });
        if (results.length > 0) {
          this.item = results[0];
          this.json = JSON.stringify(this.item, null, 2);
        }
      }
    },
    async Save(e) {
      if (e != null) {
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        e.returnValue = 'Really want to quit the game?';
      }
      var item = { ...this.item };
      if (this.mode == "json") var item = JSON.parse(this.json);
      try {
        if (!Util.IsNullEmpty(this.id)) {
          await this.Client.UpdateOne({ collectionname: this.collectionname, item });
        } else {
          await this.Client.InsertOne({ collectionname: this.collectionname, item });
        }
        if (e != null) {
          setTimeout(() => {
            this.$router.push({ name: 'EntitiesCollection', params: { propcollectionname: this.collectionname } });
          }, 200)
        } else {
          this.$router.push({ name: 'EntitiesCollection', params: { propcollectionname: this.collectionname } });
        }

      } catch (error) {
        this.errormessage = error
      }
      return false;
    }
  }
}
</script>

<style></style>
<style scoped>
.operation-icon {
  margin-bottom: -5px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.operation-icon.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

body.dark .operation-icon {
  filter: invert(100%);
}

.row {
  display: flex;
}

.col {
  flex: 1;
  border: 1px #ccc;
  align-self: flex-end;
}
</style>
