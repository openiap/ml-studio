<template>
    <button @click="expanded=!expanded" class="button primary">Access Control List</button>
    <button v-if="expanded" @click="AddAce" class="button primary">Add User/Role</button>
    <section v-if="expanded" class="card">
        <section v-for="(ace, index) in modelValue._acl" :key="index">
            <div class="row">
                <div class="col-1">
                    <img src="./images/delete.png" class="operation-icon" @click="DeleteAce(ace)" />
                </div>
                <ACE :modelValue="modelValue._acl[index]" :showcreate="showcreate" :showread="showread"
                    :showupdate="showupdate" :showdelete="showdelete" :showinvoke="showinvoke" :basequery="basequery"
                    :itemProjection="itemProjection" />
            </div>
        </section>
    </section>
</template>
      
<script>
import ACE from '@/components/ACE.vue';
import { Ace } from '../Base';
import { Util } from '../Util'

export default {
    emits: ['update:modelValue'],
    props: {
        modelValue: {
            default: {},
            sync: true
        },
        basequery: {
            default: { '_type': { '$in': ['user', 'role'] } }
        },
        expanded: {
            default: false
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
                if (Util.IsNullEmpty(item._type)) {
                    return item.name;
                }
                if (Util.IsNullEmpty(item.username) || item.name.toLowerCase() == item.username.toLowerCase()) {
                    return '[' + item._type + '] ' + item.name;
                }
                return '[' + item._type + '] ' + item.name + ' (' + item.username + ')';
            },
        },
    },
    components: {
        ACE
    },
    mounted() {
    },
    data() {
        return {
        };
    },
    watch: {
    },
    methods: {
        AddAce() {
            var newace = new Ace();
            Ace.resetfullcontrol(newace);
            newace._id = '';
            newace.name = '';
            this.modelValue._acl.push(newace);
            // this.$emit('update:modelValue', this.modelValue)
        },
        toggleTheme() {
        },
        DeleteAce(ace) {
            this.modelValue._acl = this.modelValue._acl.filter(x => x._id != ace._id);
        }
    },
};
</script>
  
<style scoped>

</style>
  