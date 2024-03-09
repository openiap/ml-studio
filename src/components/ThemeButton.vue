<template>
    <!-- <a @click="toggleTheme" aria-label="Toggle dark mode">
        🌚 {{userTheme}}
    </a> -->

    <button :style="{ backgroundColor: userTheme == 'dark' ? '#BBBBBA' : '#898584', color: userTheme == 'dark' ? '#898584' : '#BBBBBA' }"
            @click="toggleTheme">
            <Icon v-if="userTheme == 'dark'" name="sun" />
            <Icon v-else name="moon" />
          </button>

</template>
      
<script>
import Icon from './Icon.vue'
import { Chart } from 'chart.js/auto'
export default {
    mounted() {
        const initUserTheme = this.getTheme() || this.getMediaPreference();
        this.setTheme(initUserTheme);
    },
    data() {
        return {
            userTheme: "light",
        };
    },
    components: {
        Icon
    },
    methods: {
        toggleTheme() {
            const activeTheme = localStorage.getItem("user-theme");
            if (activeTheme === "light") {
                this.setTheme("dark");
            } else {
                this.setTheme("light");
            }
        },

        getTheme() {
            return localStorage.getItem("user-theme");
        },
        setTheme(theme) {
            localStorage.setItem("user-theme", theme);
            this.userTheme = theme;

            if (theme === "dark") {
                document.body.classList.add("dark");
                // Chart.helpers.each(Chart.instances, function(instance){
                //     const rootStyle = getComputedStyle(document.documentElement);
                //     const fontColor = rootStyle.getPropertyValue('--font-color').trim();
                //     Chart.defaults.color = fontColor;
                //     instance.chart.update();
                // });

            } else {
                document.body.classList.remove("dark");
            }

            const rootStyle = getComputedStyle(document.body);
            const fontColor = rootStyle.getPropertyValue('--ml-studio-chart-node-grid-font-color').trim();
            const gridLineColor = rootStyle.getPropertyValue('--ml-studio-chart-node-grid-line-color').trim() ;

            Chart.defaults.color = fontColor;
            for (let key in Chart.instances) {
                const instance = Chart.instances[key];
                instance.options.scales = {
                    x: {
                        grid: {
                            color: gridLineColor,  
                        },
                        ticks: {
                            color: fontColor,  // X-axis labels
                        }
                    },
                    y: {
                        grid: {
                            color: gridLineColor,  
                        },
                        ticks: {
                            color: fontColor,  // Y-axis labels
                        }
                    }
                };
                instance.update();
            }
        },
        getMediaPreference() {
            const hasDarkPreference = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;
            if (hasDarkPreference) {
                return "dark";
            } else {
                return "light";
            }
        },
    },
};
</script>
