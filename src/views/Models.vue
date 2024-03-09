<template>
  <v-text-field ref="searchfield" label="Search for model by name or using json query" @keyup="DoSearch" v-model="searchValue" />
  <div class="card">
    <div class="row">
      <div class="col">
      </div>
      <div class="col">
        <footer class="is-right">
          <v-btn @click="Reload">Reload</v-btn>
          <v-btn @click="Insert" class="primary">Insert</v-btn>
          <v-btn @click="Delete" :disabled='itemsSelected.length == 0' class="error">Delete</v-btn>
        </footer>
      </div>
      </div>
      <div class="row">
        <div class="col">

        <button class="hidden" @click="Delete" :disabled='itemsSelected.length == 0'
          v-shortkey.propagte="['shift', 'del']" @shortkey="HardDelete">Hard Delete</button>
        <button class="hidden" v-shortkey.propagte="['arrowright']" @shortkey="NextPage">Next</button>
        <button class="hidden" v-shortkey.propagte="['arrowleft']" @shortkey="PreviusPage">Previus</button>
        <!-- <button class="hidden" v-shortkey.propagte="['arrowup']" @shortkey="PreviusCollection">Next</button>
        <button class="hidden" v-shortkey.propagte="['arrowdown']" @shortkey="NextCollection">Previus</button> -->
        <button class="hidden" @click="SelectAll" v-shortkey.propagte="['ctrl', 'a']" @shortkey="SelectAll">SelectAll</button>
        <button class="hidden" @click="FocusSearch" v-shortkey.propagte="['ctrl', 'f']" @shortkey="FocusSearch">FocusSearch</button>
        <button class="hidden" @click="Insert" v-shortkey.propagte="['insert']" @shortkey="Insert">Insert</button>
        <button class="hidden" @click="Delete" v-shortkey.propagte="['del']" @shortkey="Delete">Delete</button>
        <button class="hidden" @click="SelectAll" v-shortkey.propagte="['ctrl', 'a']" @shortkey="SelectAll">SelectAll</button>
      </div>
    </div>
  </div>
  <div v-if="errormessage" class="row">
    <div class="col">
      <div class="card">
        <h1 class="text-error">{{errormessage}}</h1>
      </div>
    </div>
  </div>
  <div class="card">
    <EasyDataTable :headers="headers" :items="items" :loading="loading" :server-items-length="serverItemsLength"
      v-model:server-options="serverOptions" :rowsItems="rowsItems" alternating must-sort
      v-model:items-selected="itemsSelected" @click-row="RowClick">

      <template #item-_created="item">
        {{ _timeSince(item._created) }}
      </template>
      <template #item-metadata._created="item">
        {{ _timeSince(item.metadata._created) }}
      </template>
      <template #item-_modified="item">
        {{ _timeSince(item._modified) }}
      </template>
      <template #item-metadata._modified="item">
        {{ _timeSince(item.metadata._modified) }}
      </template>
      <template #item-timestamp="item">
        {{ _timeSince(item.timestamp) }}
      </template>
      <template #item-lastseen="item">
        {{ _timeSince(item.lastseen) }}
      </template>
      <template #item-lastrun="item">
        {{ _timeSince(item.lastrun) }}
      </template>
      <template #item-name="item">
        <router-link :to="{ name: 'ModelWithId', params: { id: item._id }}">{{item.name}}</router-link>
      </template>
      <template #item-operation="item">
        <div class="operation-wrapper">
          <router-link :to="{ name: 'ModelWithId', params: { id: item._id }}">Open</router-link>
        </div>
      </template>
      <template #item-fa="item">
        <div>
        </div>
      </template>

    </EasyDataTable>
    <small class="is-center">Click to select, left/right arrows to page/ del to delete </small>
  </div>
</template>

<script>
import { Util } from "./../Util"
import { mapActions, mapGetters } from 'vuex'
import { vue3Debounce } from 'vue-debounce'

export default {
  props: {
    propcollectionname: { default: 'mlflows' }
  },
  data() {
    return {
      errormessage: "",
      loading: false,
      searchValue: "",
      collectionname: "",
      lastSearchValue: "",
      serverItemsLength: 0,
      rowsItems: [10, 25, 50, 100],
      autoUpdateInterval: 0,
      serverOptions: {
        page: 1,
        rowsPerPage: 10,
        sortBy: '_created',
        sortType: 'desc',
      },
      collections: ['audit', 'entities', 'users'],
      headers: [
      ],
      searchfields: ['name'],
      items: [
      ],
      itemsSelected: [],
      timer: null,
    }
  },
  async created() {
    this.collectionname = this.propcollectionname;
    if(this.collectionname == "") {
      this.collectionname = await this.PageStateGet({key: "entities_collection", defaultvalue: "entities"})
    }
    this.searchValue = await this.PageStateGet({key: "entities_" + this.collectionname + "_searchValue", defaultvalue: ""});
    this.serverOptions.rowsPerPage = await this.PageStateGet({key: "entities_" + this.collectionname + "_rowsPerPage", defaultvalue: 10});
    this.serverOptions.sortBy = await this.PageStateGet({key: "entities_" + this.collectionname + "_sortby", defaultvalue: "_created"});
    if(this.collectionname == "fs.files" && this.serverOptions.sortBy == "_created") {
      this.serverOptions.sortBy = "metadata._created"
    }
    this.serverOptions.sortType = await this.PageStateGet({key: "entities_" + this.collectionname + "_sorttype", defaultvalue: "desc"});
    this.GetData()
    this.LoadCollections()
  },
  mounted() {
    this.FocusSearch();
  },
  computed: {
    ...mapGetters(['User', 'Signedin', 'Config', 'Client', 'Cache'])
  },
  directives: {
    debounce: vue3Debounce({ lock: true })
  },
  components: {
  },
  watch: {
    Signedin: function (val, oldVal) {
      if (val == true && oldVal != val) {
        this.GetData();
        this.LoadCollections()
      }
    },
    collectionname: async function (val, oldVal) {
      if (!Util.IsNullEmpty(val) == true && oldVal != val) {
        this.searchValue = await this.PageStateGet({key: "entities_" + this.collectionname + "_searchValue", defaultvalue: ""});
        this.PageStateSet({key: "entities_collection", value: val});
        // this.$router.push(`Entities/${val}`)
        // this.$router.replace({ path: `/Entities/${val}` })
        this.itemsSelected = [];
        this.serverItemsLength = 0;
        this.serverOptions.page = await this.PageStateGet({key: "entities_" + this.collectionname + "_page", defaultvalue: 1});
        this.serverOptions.sortBy = await this.PageStateGet({key: "entities_" + this.collectionname + "_sortby", defaultvalue: "_created"});
        if(this.collectionname == "fs.files" && this.serverOptions.sortBy == "_created") {
          this.serverOptions.sortBy = "metadata._created"
        }

        this.serverOptions.sortType = await this.PageStateGet({key: "entities_" + this.collectionname + "_sorttype", defaultvalue: "desc"});
        this.GetData();
      }
    },
    serverOptions: {
      handler: function (val, oldVal) {
        if (oldVal != val) {
          this.GetData();
        }
      },
      deep: true
    }
  },
  beforeMount() {
    this.addAutoUpdate();
  },
  beforeUnmount() {
    this.cancelAutoUpdate();
  },
  methods: {
    ...mapActions(['PageStateGet','PageStateSet']),
    async HardDelete() {
      if (this.itemsSelected.length > 0) {
        var recursive = false;
        let isExecuted = confirm("Are you sure want to HARD delete the " + this.itemsSelected.length + " selected items?");
        if (!isExecuted) return;
        if (this.collectionname == "users") {
          recursive = true;
        }
        await this.Client.DeleteMany({ collectionname: this.collectionname, ids: this.itemsSelected.map(x => x._id), recursive });
        this.itemsSelected = [];
        this.serverItemsLength = 0;
        this.GetData();
      }
    },
    async Delete() {
      if (this.itemsSelected.length > 0) {
        let isExecuted = confirm("Are you sure want to delete the " + this.itemsSelected.length + " selected items?");
        if (!isExecuted) return;
        await this.Client.DeleteMany({ collectionname: this.collectionname, ids: this.itemsSelected.map(x => x._id) });
        this.itemsSelected = [];
        this.serverItemsLength = 0;
        this.GetData();
      }
    },
    editItem(item) {
      this.$router.push({ name: 'ModelWithId', params: { id: item._id } });
    },
    openlinkItem(item) {
      if(item.href != "" && item.href != null) {
        window.open(item.href, '_blank');
      }
    },
    Insert() {
      this.$router.push({ name: 'Model', params: {  } });
    },
    RowClick(item) {
      // this.itemsSelected = [...this.itemsSelected, item];
      var rowitem = this.items.find(x => x._id == item._id);
      rowitem.isSelected = !item.isSelected;
      item.isSelected = !item.isSelected;
      this.itemsSelected = this.items.filter(x => x.isSelected == true);
      // this.itemsSelected.push(item);
    },
    Reload() {
      this.GetData();
    },
    async DoSearch(e) {
      console.log("DoSearch", e)
      if (this.lastSearchValue != this.searchValue) {
        await this.PageStateSet({key: "entities_" + this.collectionname + "_searchValue", value: this.searchValue});
        this.serverItemsLength = 0;
        this.serverOptions.page = 1;
        this.GetData();
      }
    },
    PreviusPage() {
      if (this.serverOptions.page > 1) {
        this.serverOptions.page--;
        this.GetData();
      }
    },
    NextPage() {
      if (this.serverOptions.page < this.serverItemsLength / this.serverOptions.rowsPerPage) {
        this.serverOptions.page++;
        this.GetData();
      }
    },
    PreviusCollection() {
      var index = this.collections.indexOf(this.collectionname);
      if (index > 0) {
        this.itemsSelected = [];
        this.serverItemsLength = 0;
        this.serverOptions.page = 1;
        this.collectionname = this.collections[index - 1];
      }
    },
    NextCollection() {
      var index = this.collections.indexOf(this.collectionname);
      if (index < this.collections.length - 1) {
        this.itemsSelected = [];
        this.serverItemsLength = 0;
        this.serverOptions.page = 1;
        this.collectionname = this.collections[index + 1];
      }
    },
    SelectAll() {
      this.itemsSelected = this.items;
    },
    FocusSearch(e) {
      if(e != null) {
        console.log("focus search",e);
        e.cancelBubble = true;
        e.preventDefault();
        e.stopPropagation();
      }
      this.$refs.searchfield.focus();
    },
    async LoadCollections() {
      if (!this.Signedin) return;
      var collections = await this.Client.ListCollections({});
      this.collections = collections.map(x => x.name);
    },
    async GetData() {
      if (!this.Signedin) return;
      this.loading = true
      this.cancelAutoUpdate();
      try {
        var orderby = {};
        if (this.serverOptions.sortType == "asc") {
          orderby[this.serverOptions.sortBy] = 1;
        }
        if (this.serverOptions.sortType == "desc") {
          orderby[this.serverOptions.sortBy] = -1;
        }
        var query = {"_type": "model"};
        var exactquery = null;
        await this.PageStateSet({key: "entities_" + this.collectionname + "_searchValue", value: this.searchValue});
        if (this.searchValue !== "" && this.searchValue != null) {
          if (this.searchValue.indexOf("{") == 0) {
            if (this.searchValue.lastIndexOf("}") == (this.searchValue.length - 1)) {
              try {
                this.errormessage = "";
                query = this.parseJson(this.searchValue, null, null);
              } catch (error) {
                this.errormessage = error.message ? error.message : error;
              }
            }
          } else {
            let finalor = [];
            const finalexactor = [];
            for (let i = 0; i < this.searchfields.length; i++) {
              let newq = {};
              const newexactq = {};
              // exact match case sensitive
              // newq[this.searchfields[i]] = this.searchValue;
              // exact match case insensitive
              newexactq[this.searchfields[i]] = new RegExp(["^", this.searchValue, "$"].join(""), "i");
              // newexactq[this.searchfields[i]] = new RegExp(["^", this.searchValue].join(""), "i");

              // exact match string contains
              newq[this.searchfields[i]] = new RegExp([this.searchValue.substring(1)].join(""), "i");

              finalor.push(newq);
              finalexactor.push(newexactq);
            }
            var hastextindex = false;
            if (this.Config.collections_with_text_index.indexOf(this.collectionname) > -1) {
              hastextindex = true;
            }
            if (!this.searchValue.startsWith(".") && hastextindex) {
              finalor = [{ $text: { $search: this.searchValue.toLowerCase() } }]
            }
            if (Object.keys(query).length == 0) {
              query = { $or: finalor.concat() };
              exactquery = { $or: finalexactor.concat() };
            } else {
              query = { $and: [query, { $or: finalor.concat() }] };
              exactquery = { $and: [query, { $or: finalexactor.concat() }] };
            }
            if (!this.searchValue.startsWith(".") && hastextindex) {
              exactquery = { "_searchnames": this.searchValue.toLowerCase() };
            }

          }
        }
        this.headers = [
          { text: "Name", value: "name" },
          { text: "Type", value: "_type", sortable: true },
          { text: "By", value: "_createdby", sortable: true },
          { text: "Created", value: "_created", sortable: true },
          { text: "Modified", value: "_modified", sortable: true },
          { text: "Operation", value: "operation" },
        ]
        if (this.collectionname == "workitems") {
          this.headers = [
            { text: "Name", value: "name" },
            { text: "State", value: "state", sortable: true },
            { text: "By", value: "_createdby", sortable: false },
            { text: "Created", value: "_created", sortable: true },
            { text: "Due", value: "lastrun", sortable: false },
            { text: "Operation", value: "operation" },
          ]
        }
        if (this.collectionname == "users") {
          this.headers = [
            { text: "Name", value: "name" },
            { text: "Type", value: "_type", sortable: true },
            { text: "Username", value: "username", sortable: true },
            { text: "By", value: "_createdby", sortable: false },
            { text: "Created", value: "_created", sortable: true },
            { text: "Modified", value: "_modified", sortable: true },
            { text: "Lastseen", value: "lastseen", sortable: true },
            { text: "Operation", value: "operation" },
          ]
        }
        if (this.collectionname == "audit") {
          this.headers = [
            { text: "", value: "fa" },
            { text: "Name", value: "name" },
            { text: "Agent", value: "clientagent", sortable: true },
            { text: "Version", value: "clientversion", sortable: true },
            { text: "Username", value: "username", sortable: true },
            { text: "IP", value: "remoteip", sortable: true },
            { text: "Created", value: "_created", sortable: true },
            { text: "Operation", value: "operation" },
          ]
        }
        if (this.collectionname == "fs.files") {
          this.headers = [
            { text: "Name", value: "metadata.name" },
            { text: "Type", value: "contentType", sortable: false },
            { text: "By", value: "metadata._createdby", sortable: false },
            { text: "Created", value: "metadata._created", sortable: true },
            { text: "Modified", value: "metadata._modified", sortable: false },
            { text: "Operation", value: "operation" },
          ]
          if (this.serverOptions.sortType == "asc") {
            orderby = { "metadata._created": 1 };
          }
          if (this.serverOptions.sortType == "desc") {
            orderby = { "metadata._created": -1 };
          }
        }
        if (this.collectionname == "dbusage") {
          this.headers = [
            { text: "Name", value: "name" },
            { text: "Type", value: "_type", sortable: false },
            { text: "By", value: "_createdby", sortable: false },
            { text: "Created", value: "timestamp", sortable: true },
            { text: "Modified", value: "_modified", sortable: false },
            { text: "Operation", value: "operation" },
          ]
          if (this.serverOptions.sortType == "asc") {
            orderby = { "timestamp": 1 };
          }
          if (this.serverOptions.sortType == "desc") {
            orderby = { "timestamp": -1 };
          }
        }
        if(this.serverOptions.page == 1){
          await this.PageStateSet({key: "entities_" + this.collectionname + "_page", value: ""});
        } else {
          await this.PageStateSet({key: "entities_" + this.collectionname + "_page", value: this.serverOptions.page});
        }
        if(this.serverOptions.rowsPerPage == 10){
          await this.PageStateSet({key: "entities_" + this.collectionname + "_rowsperpage", value: ""});
        } else {
          await this.PageStateSet({key: "entities_" + this.collectionname + "_rowsperpage", value: this.serverOptions.page});
        }
        if(this.serverOptions.sortBy == "_created" && this.collectionname != "fs.files") {
          await this.PageStateSet({key: "entities_" + this.collectionname + "_sortby", value: ""});
        } else if(this.serverOptions.sortBy == "metadata._created" && this.collectionname == "fs.files") {
          await this.PageStateSet({key: "entities_" + this.collectionname + "_sortby", value: ""});
        } else {
          await this.PageStateSet({key: "entities_" + this.collectionname + "_sortby", value: this.serverOptions.sortBy});
        }
        if(this.serverOptions.sortType == "desc") {
          await this.PageStateSet({key: "entities_" + this.collectionname + "_sorttype", value: ""});
        } else {
          await this.PageStateSet({key: "entities_" + this.collectionname + "_sorttype", value: this.serverOptions.sortType});
        }
        
        
        if (this.collectionname != "cvr" && this.collectionname != "linkedin" && this.collectionname != "dbusage") {
          if (this.serverItemsLength == 0) {
            this.serverItemsLength = ((this.serverOptions.page - 1) * this.serverOptions.rowsPerPage) + this.serverOptions.rowsPerPage + 1;
            // this.serverItemsLength = await this.Client.Count({ query, collectionname: this.collectionname });
            this.Client.Count({ query, collectionname: this.collectionname }).then(value => {
              this.serverItemsLength = value;
            });
          }
        } else {
          // fake more items
          this.serverItemsLength = ((this.serverOptions.page - 1) * this.serverOptions.rowsPerPage) + this.serverOptions.rowsPerPage + 1;
          if (this.items.length < this.serverOptions.rowsPerPage) {
            this.serverItemsLength = ((this.serverOptions.page - 1) * this.serverOptions.rowsPerPage) + this.items.length;
          }
          if (this.serverItemsLength < 1) this.serverItemsLength = 11;
        }
        if (this.serverItemsLength > 0) {
          if (exactquery != null && this.serverOptions.page == 1) {
            var arr = (await this.Client.Query({
              query: exactquery, collectionname: this.collectionname, top: 1
            }));
            if (arr.length > 0) {
              arr = arr.concat(await this.Client.Query({
                query, collectionname: this.collectionname, top: this.serverOptions.rowsPerPage - 1, orderby
              }));
            } else {
              arr = await this.Client.Query({
                query, collectionname: this.collectionname, top: this.serverOptions.rowsPerPage, orderby
              });

            }
            this.items = arr.filter((v, i, a) => a.findIndex(v2 => (v2._id === v._id)) === i)
          } else {
            this.items = await this.Client.Query({
              query, collectionname: this.collectionname, top: this.serverOptions.rowsPerPage,
              skip: (this.serverOptions.page - 1) * this.serverOptions.rowsPerPage,
              orderby,
              sort: this.serverOptions.sortBy + " " + this.serverOptions.sortType
            })
            if (this.serverOptions.page == 1 && this.items.length < this.serverOptions.rowsPerPage) {
              this.serverItemsLength = this.items.length;
            }
          }
        } else {
          this.items = [];
        }
        for (let i = 0; i < this.items.length; i++) {
          const model = this.items[i];
          model.fa = "fa-solid fa-question-circle";
          model.fa2 = "";
          if (model.clientagent == 'openrpa') model.fa = 'fa-solid fa-robot';
          if (model.clientagent == 'webapp') model.fa = 'fa-solid fa-globe';
          if (model.clientagent == 'browser') model.fa = 'fa-solid fa-globe';
          if (model.clientagent == 'mobileapp') model.fa = 'fa-solid fa-mobile-alt';
          if (model.clientagent == 'nodered') model.fa = 'fa-brands fa-node-js';
          if (model.clientagent == 'getUserFromRequest') model.fa = 'fa-brands fa-node-js';
          if (model.clientagent == 'googleverify') model.fa = 'fa-brands fa-google';
          if (model.clientagent == 'samlverify') model.fa = 'fa-brands fa-windows';
          if (model.clientagent == 'aiotwebapp') model.fa = 'fa-solid fa-globe';
          if (model.clientagent == 'aiotmobileapp') model.fa = 'fa-solid fa-mobile-alt';
          if (model.clientagent == 'nodered-cli') model.fa = 'fa-brands fa-node-js';
          if (model.clientagent == 'openflow-cli') model.fa = 'fa-brands fa-node-js';

          if (model.impostorname != '' && model.impostorname != null) model.fa2 = 'fa-solid fa-user-secret';
          // fa-solid fa-user-secret
        }

        this.lastSearchValue = this.searchValue;
      } catch (error) {
        console.error(error);
      }
      finally {
        this.addAutoUpdate();
        this.loading = false;
      }
    },
    addAutoUpdate() {
      if (this.timer == null && this.autoUpdateInterval > 0) {
        this.timer = setInterval(this.doAutoUpdate, this.autoUpdateInterval * 1000);
      }
    },
    doAutoUpdate() {
      try {
        if (this.itemsSelected == null || this.itemsSelected.length == 0) {
          this.GetData();
        } else {
          this.addAutoUpdate();
        }
      } catch (error) {
      }
    },
    cancelAutoUpdate() {
      clearInterval(this.timer);
      this.timer = null;
    },
    parseJson(txt, reviver) {
      const context = 50;
      try {
        return JSON.parse(txt, reviver)
      } catch (e) {
        if (typeof txt !== "string") {
          const isEmptyArray = Array.isArray(txt) && txt.length === 0
          const errorMessage = "Cannot parse " +
            (isEmptyArray ? "an empty array" : String(txt))
          throw new TypeError(errorMessage)
        }
        const syntaxErr = e.message.match(/^Unexpected token.*position\s+(\d+)/i)
        const errIdx = syntaxErr
          ? +syntaxErr[1]
          : e.message.match(/^Unexpected end of JSON.*/i)
            ? txt.length - 1
            : null
        if (errIdx != null) {
          const start = errIdx <= context
            ? 0
            : errIdx - context
          const end = errIdx + context >= txt.length
            ? txt.length
            : errIdx + context
          e.message += ` while parsing near "${start === 0 ? "" : "..."
            }${txt.slice(start, end)}${end === txt.length ? "" : "..."
            }"`
        } else {
          e.message += ` while parsing "${txt.slice(0, context * 2)}"`
        }
        throw e
      }
    },
    _timeSince(timeStamp) {
      try {
        timeStamp = new Date(timeStamp);
      } catch (error) {
        return;
      }
      const now = new Date(),
        secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
      if (secondsPast < 60) {
        return parseInt(secondsPast.toString()) + 's';
      }
      if (secondsPast < 3600) {
        return parseInt((secondsPast / 60).toString()) + 'm';
      }
      if (secondsPast <= 86400) {
        return parseInt((secondsPast / 3600).toString()) + 'h';
      }
      if (secondsPast > 86400) {
        let day = timeStamp.getDate();
        let month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
        let year = timeStamp.getFullYear() == now.getFullYear() ? "" : " " + timeStamp.getFullYear();
        return day + " " + month + year;
      }
    },
    _timeToo(timeStamp) {
      const now = new Date();
      let secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
      var suffix = "";
      if (secondsPast > 0) suffix = " ago";
      if (secondsPast < 0) secondsPast *= -1

      if (secondsPast < 60) {
        return parseInt(secondsPast.toString()) + 's' + suffix;
      }
      if (secondsPast < 3600) {
        return parseInt((secondsPast / 60).toString()) + 'm' + suffix;
      }
      if (secondsPast <= 86400) {
        return parseInt((secondsPast / 3600).toString()) + 'h' + suffix;
      }
      if (secondsPast > 86400) {
        let day = timeStamp.getDate();
        let month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
        let year = timeStamp.getFullYear() == now.getFullYear() ? "" : " " + timeStamp.getFullYear();
        return day + " " + month + year;
      }
    },
  },


  name: 'EntitiesView'
}
</script>

<style scoped>
body.dark {
  filter: saturate(3);
  --easy-table-header-font-color: rgba(255, 255, 255, 0.418);
}

body.dark .easy-checkbox {
  background: var(--easy-table-header-font-color)
}

body.dark .card a {
  color: var(--easy-table-header-font-color);
}
.operation-wrapper .operation-icon {
  width: 20px;
  cursor: pointer;
}

body.dark .operation-wrapper .operation-icon {
  filter: invert(100%);
}
</style>