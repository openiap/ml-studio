<template>
  <span class="editable-field">
    <input v-if="isboolean" type="checkbox" id="checkbox" :checked="modelValue" ref="checkfield"
      @input="$emit('update:modelValue', $event.target.checked)" />

    
    <span v-if="!isboolean" @click="isEditing=true" v-show="!isEditing" class="label">
      <img src="./images/edit.png" class="operation-icon" v-if="modelValue==null || modelValue==''" />
      {{clip(modelValue, 30)}}
    </span>
    <span v-show="isEditing">
      <input v-if="!isobject" type="text" :value="modelValue" ref="editfield"
        @keydown.enter="$emit('update:modelValue', $event.target.value); isEditing=false"
        @keydown.esc="isEditing=false; $emit('escaped')"
        @blur="$emit('update:modelValue',  $event.target.value); isEditing=false" />

      <textarea v-if="isobject" class="textarea" placeholder="Write something for mixin" :value="json" rows="10"
        ref="edittextarea" @keydown.esc="isEditing=false; $emit('escaped')"
        @blur="$emit('update:modelValue', JSON.parse($event.target.value)); isEditing=false"
        @input="mixin_autoResize_resize"></textarea>

    </span>
  </span>
</template>
<script>
export default {
  name: 'editableTextField',
  emits: ['update:modelValue', 'escaped', 'accepted'],
  props: {
    name: {
      type: String,
      default: ''
    },
    modelValue: {
      default: '',
      sync: true
    },
    Editing: {
      default: false
    },
    emitevents: {
      default: true,
      sync: true
    }
  },
  data: function () {
    return {
      isEditing: false,
      json: ""
    };
  },
  computed: {
    isboolean() {
      return this.modelValue === true || this.modelValue === false
        || toString.call(this.modelValue) === '[object Boolean]'
        || this.modelValue === 'true' || this.modelValue === 'false';
    },
    isobject() {
      return typeof this.modelValue == 'object';
    }
  },
  methods: {
    SendStringValue() {
      if (!this.isboolean) {
        this.$emit('update:modelValue', this.modelValue);
      }
    },
    clip(value, size) {
      if (!value) return '';
      if (typeof value == 'object') {
        value = JSON.stringify(value);
      } else {
        value = value.toString();
      }

      if (value.length <= size) {
        return value;
      }
      return value.substr(0, size) + '...';
    }
  },
  watch: {
    modelValue: function (val) {
      if (this.isobject) {
        this.json = JSON.stringify(val, null, 2);
      }
    },
    isEditing: function (val, oldVal) {
      if (val == true) {
        this.$nextTick(() => {
          if (this.$refs.editfield) this.$refs.editfield.focus();
          if (this.$refs.checkfield) this.$refs.checkfield.focus();
          if (this.$refs.edittextarea) this.$refs.edittextarea.focus();
        });
      } else {
        if (this.emitevents) {
          this.$emit('accepted');
        }
      }
    }
  },
  mounted() {
    this.isEditing = this.Editing;
    if (this.isobject) {
      this.json = JSON.stringify(this.modelValue, null, 2);
    }
    if (this.isEditing) {
      this.$nextTick(() => {
        try {
          if (this.$refs.editfield) this.$refs.editfield.focus();
          if (this.$refs.checkfield) this.$refs.checkfield.focus();
          if (this.$refs.edittextarea) this.$refs.edittextarea.focus();
        } catch (error) {
        }
      });
    }
  }
}
</script>

<style >
.editable-field {
  margin: 10px 0;
}

.editable-field input,
.editable-field button {
  border: 1px solid #4c4c4c;
  background-color: #fff;
  padding: 4px 6px;
  font-size: 18px;
}

.label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.operation-icon {
  margin-bottom: -5px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

body.dark .operation-icon {
  filter: invert(100%);
}
</style>
