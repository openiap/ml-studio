<template>
    <div class="wrapper">
        <textarea class="textarea" placeholder="Write something for mixin" :value="modelValue" rows="20"
            @blur="$emit('update:modelValue', $event.target.value)" @input="mixin_autoResize_resize"></textarea>
    </div>
</template>
  
<script>
import mixinAutoResize from "./autoResize.js";

export default {
    name: "ResizeByMixin",
    mixins: [mixinAutoResize],
    emits: ['update:modelValue'],
    props: {
        modelValue: {
            default: '',
            sync: true
        },
    },
};
</script>
  