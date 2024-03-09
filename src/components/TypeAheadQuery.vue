<template>

    <TypeAhead :inputId="id" :placeholder="placeholder" :items="items" :minInputLength="0"
        :minItemLength="minItemLength" :selectOnTab="selectOnTab" :defaultItem="defaultItem"
        @selectItem="selectItemEventHandler" @onInput="onInputEventHandler" @onFocus="onFocusEventHandler"
        :filterlocal="false" :allowempty="allowempty" :itemProjection="itemProjection" @onBlur="onBlurEventHandler"
        ref="typeahead" :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    </TypeAhead>
</template >
<script>
import { mapGetters } from 'vuex';
import TypeAhead from './TypeAhead.vue';
export default {
    name: "TypeAheadQuery",
    emits: ['update:modelValue', 'selectItem', 'onFocus', 'onBlur'],
    props: {
        modelValue: {
            default: {},
            sync: true
        },
        id: {
            type: String
        },
        allowempty: {
            type: Boolean,
            default: false,
        },
        filterlocal: {
            type: Boolean,
            default: true,
        },
        placeholder: {
            type: String,
            default: '',
        },
        defaultItem: {
            default: null,
        },
        itemProjection: {
            type: Function,
            default(item) {
                return item.name;
            },
        },
        minInputLength: {
            type: Number,
            default: 2,
            validator: (prop) => {
                return prop >= 0;
            },
        },
        minItemLength: {
            type: Number,
            default: 0,
            validator: (prop) => {
                return prop >= 0;
            },
        },
        selectOnTab: {
            type: Boolean,
            default: false,
        },
        basequery: {
            type: Object,
            default: {},
        },
        collectionname: {
            type: String,
            default: 'entities',
        },
    },
    data() {
        return {
            items: [],
            searchstring: "",
            hasFocus: false,
        };
    },
    computed: {
        ...mapGetters(["Signedin", "Client"]),
    },
    watch: {
        Signedin: function (val, oldVal) {
            if (val == true && oldVal != val) {
                this.GetData();
            }
        },
        defaultItem: function (val) {
            // console.debug('TypeAheadQuery: defaultItem changed to ' + newValue?._id + ' from ' + oldValue?._id);
            if (val != null) {
                this.GetData();
            }
        },
        modelValue(newValue, oldValue) {
            // console.debug('TypeAheadQuery: modelValue changed to ' + newValue?._id + ' from ' + oldValue?._id);
            this.$emit('update:modelValue', newValue)
            this.GetData();
        },
    },
    mounted() {
        if (this.Signedin) this.GetData();
    },

    methods: {
        async GetData() {
            // console.debug("TypeAheadQuery: GetData " + this.Signedin + " " + this.modelValue?.name + " " + this.modelValue?._id);
            if (!this.Signedin) return;
            var query = { ...this.basequery };
            var results = [];
            var top = 10;
            var neq = [];
            if (this.allowempty) {
                results.push({ name: "(none selected)", _id: "" });
            }
            // if field has focys, get the item, incase user decides to select it again
            if ((this.defaultItem != null || this.modelValue != null) && this.hasFocus) {
                var _id = this.modelValue != null ? this.modelValue._id : this.defaultItem._id;
                var q = { ...this.basequery, _id }
                var _results = await this.Client.Query({ collectionname: this.collectionname, query: q, top: 1 });
                // console.debug('GetData default gave ' + _results.length, q)
                if (_results.length > 0) {
                    results.push(_results[0]);
                    neq.push(_results[0]._id);
                    top--;
                }
            } else if (this.defaultItem != null) {
                // console.debug("GetData push default item");
                results.push(this.defaultItem);
                neq.push(this.defaultItem._id);
                top--;
            } else if (this.modelValue != null) {
                // console.debug("GetData push modelValue");
                results.push(this.modelValue);
                neq.push(this.modelValue._id);
                top--;
            }
            // console.debug("GetData: " + this.modelValue?.name + " " + this.modelValue?._id, results.length);
            if (this.searchstring != "") {
                var _results = await this.Client.Query({ collectionname: this.collectionname, query: { ...this.basequery, name: new RegExp(["^", this.searchstring, "$"].join(""), "i") }, top });
                if (_results.length > 0) {
                    // console.debug("Added " + _results.length + " direct hits");
                    results = results.concat(_results);
                    neq = neq.concat(_results.map(x => x._id));
                    top = top - _results.length;
                }
                var ors = [];
                ors.push({ "name": { "$regex": this.searchstring, "$options": "i" } });
                if (this.collectionname == "users") {
                    ors.push({ "username": { "$regex": this.searchstring, "$options": "i" } });
                    ors.push({ "email": { "$regex": this.searchstring, "$options": "i" } });
                }
                query["$or"] = ors;
            }
            if (neq.length > 0) {
                query["_id"] = { "$nin": neq };
            }
            if (this.hasFocus) {
                var _results = await this.Client.Query({ collectionname: this.collectionname, query, top });
                if (_results.length > 0) {
                    // console.debug("Added " + _results.length + " search results for " + this.searchstring);
                    results = results.concat(_results)
                }
            }
            this.items = results;
            this.$nextTick(() => {
                try {
                    if (this.$refs.typeahead) this.$refs.typeahead.focus();
                } catch (error) {
                }
            });

        },
        selectItemEventHandler(item) {
            if (item == null || item._id == null || item._id == "") item = null;
            // console.debug("TypeAheadQuery: selected " + item?.name + " (" + item?._id + ")");
            this.$emit('update:modelValue', item)
            this.$emit('selectItem', item)
        },
        onInputEventHandler(item) {
            this.searchstring = item.input;
            this.GetData()
        },
        onFocusEventHandler(item) {
            this.$emit('onFocus', item)
            this.hasFocus = true;
        },
        onBlurEventHandler(item) {
            this.$emit('onBlur', item)
            this.hasFocus = false;
        },
    },
    components: { TypeAhead }
};
</script>
