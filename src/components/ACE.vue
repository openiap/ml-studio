<template>
    <div class="col">
        <TypeAheadQuery v-model="user" :collectionname="'users'" :basequery="basequery"
            @selectItem="selectItemEventHandler" :itemProjection="itemProjection"></TypeAheadQuery>
    </div>
    <div class="col-4">
        <span v-if="showcreate">
            <input id="{{modelValue._id}}create" type="checkbox" /><label>create</label>
        </span>
        <span v-if="showread">
            <input id="{{modelValue._id}}read" type="checkbox" v-model="read" /> <label>read</label>
        </span>
        <span v-if="showupdate">
            <input id="{{modelValue._id}}update" type="checkbox" v-model="update" /> <label>update</label>
        </span>
        <span v-if="showdelete">
            <input id="{{modelValue._id}}delete" type="checkbox" v-model="_delete" /> <label>delete</label>
        </span>
        <span v-if="showinvoke">
            <input id="{{modelValue._id}}invoke" type="checkbox" v-model="invoke" /> <label>invoke</label>
        </span>
    </div>
</template>
      
<script>
import TypeAheadQuery from '@/components/TypeAheadQuery.vue';
import { Ace } from './../Base'
export default {
    components: {
        TypeAheadQuery,
    },
    emits: ['update:modelValue'],
    props: {
        modelValue: {
            default: {},
            sync: true
        },
        basequery: {
            default: { '_type': 'user' }
        },
        showcreate: {
            default: false
        },
        showread: {
            default: true
        },
        showupdate: {
            default: true
        },
        showdelete: {
            default: true
        },
        showinvoke: {
            default: false
        },
        itemProjection: {
            type: Function,
            default(item) {
                return item.name;
            },
        },
    },
    data() {
        return {
            expanded: false,
            newuser: null,
        };
    },
    watch: {
        modelValue(newValue, oldValue) {
            console.debug('ACE: modelValue changed to ' + newValue?._id + ' from ' + oldValue?._id);
        },
    },
    mounted() {
    },
    watch: {
        modelValue: function (val, oldVal) {
        },
    },
    computed: {
        create: {
            get() {
                return this.isBitSet(this.modelValue.rights, 1);
            },
            set(value) {
                this.toogleBit(this.modelValue, 1)
                // this.$emit('update:modelValue', this.modelValue)
            }
        },
        read: {
            get() {
                return this.isBitSet(this.modelValue, 2);
            },
            set(value) {
                this.toogleBit(this.modelValue, 2)
                // this.$emit('update:modelValue', this.modelValue)
            }
        },
        update: {
            get() {
                return this.isBitSet(this.modelValue, 3);
            },
            set(value) {
                this.toogleBit(this.modelValue, 3)
                // this.$emit('update:modelValue', this.modelValue)
            }
        },
        _delete: {
            get() {
                return this.isBitSet(this.modelValue, 4);
            },
            set(value) {
                this.toogleBit(this.modelValue, 4)
                // this.$emit('update:modelValue', this.modelValue)
            }
        },
        invoke: {
            get() {
                return this.isBitSet(this.modelValue, 5);
            },
            set(value) {
                this.toogleBit(this.modelValue, 5)
                // this.$emit('update:modelValue', this.modelValue)
            }
        },
        user: {
            get() {
                return {
                    _id: this.modelValue._id,
                    name: this.modelValue.name,
                };
            },
            set(value) {
                this.modelValue._id = value._id;
                this.modelValue.name = value.name;
                // this.$emit('update:modelValue', this.modelValue)
            }
        }
    },
    methods: {
        selectItemEventHandler(item) {
            // console.debug("ACE: selected", item)
            this.$emit('update:modelValue', this.modelValue)
        },
        isBitSet(item, bit) {
            return Ace.isBitSet(item, bit);
            // bit--;
            // const buf = this._base64ToArrayBuffer(base64);
            // const view = new Uint8Array(buf);
            // const octet = Math.floor(bit / 8);
            // const currentValue = view[octet];
            // const _bit = (bit % 8);
            // const mask = Math.pow(2, _bit);
            // return (currentValue & mask) != 0;
        },
        setBit(base64, bit) {
            return Ace.setBit(base64, bit);
            // bit--;
            // const buf = this._base64ToArrayBuffer(base64);
            // const view = new Uint8Array(buf);
            // const octet = Math.floor(bit / 8);
            // const currentValue = view[octet];
            // const _bit = (bit % 8);
            // const mask = Math.pow(2, _bit);
            // const newValue = currentValue | mask;
            // view[octet] = newValue;
            // return this._arrayBufferToBase64(view);
        },
        unsetBit(base64, bit) {
            return Ace.unsetBit(base64, bit);
            // bit--;
            // const buf = this._base64ToArrayBuffer(base64);
            // const view = new Uint8Array(buf);
            // const octet = Math.floor(bit / 8);
            // let currentValue = view[octet];
            // const _bit = (bit % 8);
            // const mask = Math.pow(2, _bit);
            // const newValue = currentValue &= ~mask;
            // view[octet] = newValue;
            // return this._arrayBufferToBase64(view);
        },
        toogleBit(a, bit) {
            Ace.toogleBit(a, bit);
            // if (this.isBitSet(a.rights, bit)) {
            //     a.rights = this.unsetBit(a.rights, bit);
            // } else {
            //     a.rights = this.setBit(a.rights, bit);
            // }
            // const buf2 = this._base64ToArrayBuffer(a.rights);
            // const view2 = new Uint8Array(buf2);
        },
        _base64ToArrayBuffer(string_base64) {
            return Ace._base64ToArrayBuffer(string_base64);
            // if (string_base64 == null) return null;
            // const binary_string = window.atob(string_base64);
            // const len = binary_string.length;
            // const bytes = new Uint8Array(len);
            // for (let i = 0; i < len; i++) {
            //     //const ascii = string_base64.charCodeAt(i);
            //     const ascii = binary_string.charCodeAt(i);
            //     bytes[i] = ascii;
            // }
            // return bytes.buffer;
        },
        _arrayBufferToBase64(array_buffer) {
            return Ace._arrayBufferToBase64(array_buffer);
            // let binary = '';
            // const bytes = new Uint8Array(array_buffer);
            // const len = bytes.byteLength;
            // for (let i = 0; i < len; i++) {
            //     binary += String.fromCharCode(bytes[i])
            // }
            // return window.btoa(binary);
        },
    },
};
</script>
  
<style scoped>

</style>
  