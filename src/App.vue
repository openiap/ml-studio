<template>
  <v-app id="inspire">
    <v-app-bar density="compact" app>
      <v-app-bar-nav-icon @click="drawer = !drawer" class="custom-drawer" ></v-app-bar-nav-icon>
      <v-icon icon="mdi-database-search"></v-icon>
      ML Studio      
    </v-app-bar>
    <v-navigation-drawer expand-on-hover rail permanent v-model="drawer" app> 
      <!-- <v-list>
        <v-list-item prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg" title="Sandra Adams"
          subtitle="sandra_a88@gmailcom"></v-list-item>
      </v-list> -->

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item to="/" prepend-icon="mdi-sitemap" title="Workflows" value="workflows"
          :color="(this.$route.path === '/' || this.$route.path.startsWith('/Flow')) ? 'primary' : 'grey darken-1'"></v-list-item>
        <v-list-item to="/Models" prepend-icon="mdi-folder" title="Models" value="models"
          :color="this.$route.path.startsWith('/Model') ? 'primary' : 'grey darken-1'"></v-list-item>
        <!-- <v-list-item prepend-icon="mdi-star" title="Starred" value="starred"></v-list-item>
        <v-list-item prepend-icon="mdi-robot-happy-outline" title="Starred2" value="starred2"></v-list-item> -->
      </v-list>
      <v-list density="compact" nav class="fixedBottom">
        <v-list-item @click.prevent="$oidc.signOut" prepend-icon="mdi-logout" title="Singout" value="signout"
          :color="(this.$route.path === '/' || this.$route.path.startsWith('/Flow')) ? 'primary' : 'grey darken-1'"></v-list-item>
        <v-list-item @click="toggleTheme" prepend-icon="mdi-theme-light-dark" title="Toogle Darkmode"
          value="toggledarkmode"
          :color="this.$route.path.startsWith('/Model') ? 'primary' : 'grey darken-1'"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>
<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { ref } from 'vue'
import { config } from "@openiap/jsapi";

import { Util } from './Util'
const { err, info } = config


var excq = "";
function onMessage(client, message) {
  info("Received message from server: " + message);
}

import { useTheme } from 'vuetify'
import { Chart } from 'chart.js/auto'


export default {
  name: 'App',
  data() {
    return {
    }
  },
  methods: {
    ...mapActions(['Signin']),
    ...mapMutations(['setAccessToken']),
    setTheme(theme) {
      this.theme.global.name.value = theme;
      this.theme.global.dark = theme == "dark";
      console.log(theme, this.theme.global.dark)
      if (theme == "dark") {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
      localStorage.setItem("user-theme", theme);

      const rootStyle = getComputedStyle(document.body);
      const fontColor = rootStyle.getPropertyValue('--ml-studio-chart-node-grid-font-color').trim();
      const gridLineColor = rootStyle.getPropertyValue('--ml-studio-chart-node-grid-line-color').trim();

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
    toggleTheme() {
      if (this.theme.global.name.value == "dark") {
        this.setTheme("light");
      } else {
        this.setTheme("dark")
      }
    },
    getTheme() {
      return localStorage.getItem("user-theme");
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
  mounted() {
    const initUserTheme = this.getTheme() || this.getMediaPreference();
    this.setTheme(initUserTheme);
  },
  setup() {
    const theme = useTheme()
    const drawer = ref(true)
    // is mobile, set drawer to false
    if (window.innerWidth < 1000) {
      drawer.value = false
    }
    return {
      theme,
      drawer
    }
  },
  computed: {
    ...mapGetters(['User', 'AccessToken', 'Signedin', 'Client', 'jwt', 'Config']),
    token() {
      return this.$oidc.accessToken
    },
    username() {
      if (!this.User.name) return "";
      return this.User.name;
    },
  },
  watch: {
    Signedin: function (val, oldVal) {
      if (val == true && oldVal != val) {
      }
    },
    token: async function (val, oldVal) {
      if (!Util.IsNullEmpty(val) && oldVal != val) {
        this.setAccessToken(this.token);
        await this.Signin()
      }
    },
    User: async function (val, oldVal) {
      if (!Util.IsNullEmpty(val) && oldVal != val) {
      }
    },
  },
  async created() {
    if (!Util.IsNullEmpty(this.token)) {
      this.setAccessToken(this.token);
      await this.Signin()
    }
  },
  components: {
  },
}
</script>

<style>
.hidden {
  display: none;
}

body {
  margin-left: 10px;
  margin-right: 10px;
}

.nav {
  margin-bottom: 10px;
}

body {
  --ml-studio-amqp_consume-node-background-color: #3aa945;
  --ml-studio-amqp_consume-node-font-color: #fffffb;

  --ml-studio-plotly-node-background-color: rgb(240, 247, 218);
  --ml-studio-plotly-node-font-color: #222;
  --ml-studio-plotly-node-grid-font-color: var(--font-color);
  --ml-studio-plotly-node-grid-line-color: #444;

  --ml-studio-chart-node-background-color: rgb(240, 247, 218);
  --ml-studio-chart-node-font-color: #222;

  --ml-studio-csv-node-background-color: #af2084;
  --ml-studio-csv-node-font-color: #fffffb;

  --ml-studio-findone-node-background-color: #dd1fca;
  --ml-studio-findone-node-font-color: #fffffb;

  --ml-studio-function-node-background-color: #c94d21;
  --ml-studio-function-node-font-color: #fffffb;

  --ml-studio-inject-node-background-color: #80a3ec;
  --ml-studio-inject-node-font-color: #fffffb;
  --ml-studio-inject-node-button-background-color: #1e0998;
  --ml-studio-inject-node-button-font-color: #1e0998;

  --ml-studio-json-node-background-color: #af2033;
  --ml-studio-json-node-font-color: #fffffb;

  --ml-studio-map-node-background-color: #c2922a;
  --ml-studio-map-node-font-color: #fffffb;

  --ml-studio-debug-node-background-color: #whitesmoke;
  --ml-studio-debug-node-font-color: #000;
  --ml-studio-chart-node-grid-font-color: var(--ml-studio-chart-node-font-color);
  --ml-studio-chart-node-grid-line-color: rgba(0, 0, 0, 0.1);
  /* Chart.defaults.borderColor*/

  --ml-studio-tf_model_train-node-background-color: #d7dbfa;
  --ml-studio-tf_model_train-node-font-color: #444;

  --ml-studio-tf_model_execute-node-background-color: #d7dbfa;
  --ml-studio-tf_model_execute-node-font-color: #444;

  --ml-studio-tf_model-node-background-color: var(--bg-color-color);
  --ml-studio-tf_model-node-font-color: var(--font-color);

}

body.dark {
  --ml-studio-amqp_consume-node-background-color: #3aa94569;
  --ml-studio-amqp_consume-node-font-color: #fffffb;

  --ml-studio-csv-node-background-color: #af2084;
  --ml-studio-csv-node-font-color: #fffffb;

  --ml-studio-findone-node-background-color: #dd1fca9c;
  --ml-studio-findone-node-font-color: #fffffb;

  --ml-studio-function-node-background-color: #c94e218b;
  --ml-studio-function-node-font-color: #fffffb;

  --ml-studio-inject-node-background-color: #2867ef80;
  --ml-studio-inject-node-font-color: #fffffb;

  --ml-studio-json-node-background-color: #af20338c;
  --ml-studio-json-node-font-color: #fffffb;

  --ml-studio-map-node-background-color: #c2922a93;
  --ml-studio-map-node-font-color: #fffffb;

  --ml-studio-debug-node-background-color: #777;
  --ml-studio-debug-node-font-color: #fffffb;

  --ml-studio-plotly-node-background-color: #0d255838;
  --ml-studio-plotly-node-font-color: #fffffb;
  --ml-studio-plotly-node-grid-font-color: var(--font-color);
  --ml-studio-plotly-node-grid-line-color: #444;

  --ml-studio-chart-node-background-color: #0d255838;
  --ml-studio-chart-node-font-color: #fffffb;
  --ml-studio-chart-node-grid-font-color: var(--ml-studio-chart-node-font-color);
  --ml-studio-chart-node-grid-line-color: #444;

  --ml-studio-tf_model_train-node-background-color: #12d82c8d;
  --ml-studio-tf_model_train-node-font-color: #fffffb;

  --ml-studio-tf_model_execute-node-background-color: #d7dbfa;
  --ml-studio-tf_model_execute-node-font-color: #444;

  --ml-studio-tf_model-node-background-color: var(--bg-color-color);
  --ml-studio-tf_model-node-font-color: var(--font-color);

  --bg-color: #000;
  --bg-secondary-color: #131316;
  --bg-hoover-color: #777;
  --font-color: #f5f5f5d7;
  --color-grey: #ccc;
  --easy-table-message-font-color: #f5f5f5d7;
  --color-darkGrey: #777;
  --easy-table-border: 1px solid #445269;
  --easy-table-row-border: 1px solid #445269;
  --easy-table-scrollbar-track-color: #4c5d7a;
  --easy-table-scrollbar-color: #4c5d7a;
  --easy-table-scrollbar-corner-color: #4c5d7a;
  --easy-table-scrollbar-thumb-color: #2d3a4f;
  --easy-table-header-font-color: var(--font--color);
  --easy-table-body-even-row-font-color: var(--font-color);
  --easy-table-body-row-font-color: var(--color-grey);
  --easy-table-body-row-hover-font-color: var(--font-color);
  --easy-table-footer-font-color: var(--font-color);
  --easy-table-body-even-row-background-color: var(--bg-secondary-color);
  --easy-table-body-row-hover-background-color: var(--bg-hoover-color);
  --easy-table-footer-background-color: var(--bg-color-color);
  --easy-table-loading-mask-background-color: var(--bg-color);
  --easy-table-header-background-color: var(--bg-color);
  --easy-table-body-row-background-color: var(--bg-color);
}

.arrow {
  border-top-color: var(--color-grey) !important;
  border-left-color: var(--color-grey) !important;
}

body.dark input {
  background-color: var(--bg-secondary-color);
  color: var(--font-color);
}

body.dark textarea {
  background-color: var(--bg-secondary-color);
  color: var(--font-color);
}

body.dark select {
  background-color: var(--bg-secondary-color);
  color: var(--font-color);
}

.fixedBottom {
  position: fixed !important;
  bottom: 0 !important;
  width: 100%;
}
.custom-drawer {
  color: rgb(var(--v-theme-surface));
  background-color: rgb(var(--v-theme-surface));
}
</style>
