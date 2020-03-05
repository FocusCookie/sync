<template>
  <v-container id="container">
    <v-row no-gutters class="pa-5">
      <v-col cols="10">
        <v-form class="ma-0">
          <v-text-field
            height="43"
            dense
            placeholder="Filter for a specific PLC property"
            outlined
            hide-details
          ></v-text-field>
        </v-form>
      </v-col>
      <v-col cols="2">
        <v-btn
          @click="refreshPlcs"
          outlined
          large
          class="float-right"
          :disabled="loading"
        >
          Netzwerk
          <v-icon right>mdi-refresh</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row no-gutters v-if="loading">
      <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        height="10"
        bottom
        color="primary"
      ></v-progress-linear>
    </v-row>
    <v-row no-gutters>
      <v-divider></v-divider>
    </v-row>
    <v-row no-gutters>
      <v-expansion-panels accordion flat focusable>
        <v-expansion-panel
          v-for="(item, i) in plcsInNetwork"
          :key="i"
          @click="selectPlc(item)"
        >
          <v-expansion-panel-header>
            <v-row no-gutters>
              <v-col cols="3">{{ item.name }}</v-col>
              <v-col cols="3">{{ item.articleNumber }}</v-col>
              <v-col cols="3">{{ item.ip }}</v-col>
              <v-col cols="3">{{ item.mac }}</v-col>
            </v-row>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-list>
              <v-list-item v-for="(element, x) in item.modules" :key="x">
                <v-list-item-icon>
                  <v-chip color="yellow" label>
                    Digital Input
                  </v-chip>
                </v-list-item-icon>

                <v-list-item-content id="">
                  <v-list-item-title v-text="element"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-expansion-panel-content>
          <v-divider></v-divider>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-row>
    <v-row class="pt-5 pl-5 pr-5">
      <v-col cols="6">
        <v-form class="ma-0">
          <v-text-field
            v-model="user"
            :rules="[rules.required, rules.min]"
            name="user"
            label="PLC User"
            placeholder="Enter a PLC User"
            hint="At least 3 characters"
            required
            outlined
          ></v-text-field>
        </v-form>
      </v-col>
      <v-col cols="6">
        <v-form class="ma-0">
          <v-text-field
            v-model="password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[rules.required, rules.min]"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            label="PLC Password"
            placeholder="Enter the PLC Password"
            hint="At least 3 characters"
            required
            outlined
            @click:append="showPassword = !showPassword"
          ></v-text-field>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// import { ApiService } from "../services/api.service";

export default {
  name: "SelectPlcFromNetwork",
  data: () => ({
    loading: false,
    plcsInNetwork: null,
    user: "",
    password: "",
    plcsMock: [
      {
        name: "first Controller",
        ip: "192.168.1.1",
        mac: "00:30:de:0a:77:1b",
        articleNumber: "750-831",
        modules: [-30719]
      },
      {
        name: "second Controller",
        ip: "192.168.1.2",
        mac: "00:30:de:0a:77:2b",
        articleNumber: "750-880",
        modules: [-30719, -31743]
      },
      {
        name: "third Controller",
        ip: "192.168.1.3",
        mac: "00:30:de:0a:77:3b",
        articleNumber: "750-8202",
        modules: [-30719, -31743, -31743]
      }
    ],
    showPassword: false,
    rules: {
      required: value => !!value || "Required.",
      min: v => v.length >= 3 || "Min 3 characters"
    },
    plc: null
  }),
  created() {
    this.refreshPlcs();
  },
  methods: {
    refreshPlcs() {
      // TODO: Add api call wago search
      this.loading = !this.loading;
      setTimeout(() => {
        this.loading = false;
        this.plcsInNetwork = this.plcsMock;
      }, 2000);
    },
    selectPlc(plc) {
      this.plc = plc;
      this.$emit("plcSelected", this.plc);
    }
  },
  watch: {
    user() {
      this.plc.user = this.user;
      this.$emit("plcSelected", this.plc);
    },
    password() {
      this.plc.password = this.password;
      this.$emit("plcSelected", this.plc);
    }
  }
};
</script>

<style>
.wrapperBox {
  background: #ffffff;
  border: 1px solid #b8c4cd;
  box-sizing: border-box;
  border-radius: 5px;
  width: 100%;
}
.searchHeight {
  height: 56px;
}
.container {
  width: 100%;
  margin: 0;
  padding: 0;
}
.v-expansion-panel-header:before {
  background: red;
}
.v-expansion-panel-content__wrap {
  padding: 0 0 0 0;
}
</style>
