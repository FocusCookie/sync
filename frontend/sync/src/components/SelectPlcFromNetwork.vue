<template>
  <v-container id="container">
    <v-row no-gutters class="pa-5">
      <v-col cols="10">
        <v-form class="ma-0">
          <v-text-field
            :disabled="loading"
            v-model="searchTerm"
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
      <v-list v-if="!loading" class="list">
        <v-list-item-group color="primary">
          <v-list-item v-for="(item, i) in filtered" :key="i">
            <v-list-item-content @click="selectPlc(item)">
              <v-row no-gutters>
                <v-col cols="3">{{ item.ip }}</v-col>
                <v-col cols="3">{{ item.articleNumber }}</v-col>
                <v-col cols="3">{{ item.mac }}</v-col>
                <v-col cols="3">{{ item.name }}</v-col>
              </v-row>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-row>
    <v-row no-gutters>
      <v-divider></v-divider>
    </v-row>
  </v-container>
</template>

<script>
import { ApiService } from "../services/api.service";

export default {
  name: "SelectPlcFromNetwork",
  data: () => ({
    loading: false,
    plcsInNetwork: null,
    plc: null,
    filtered: [],
    searchTerm: ""
  }),
  watch: {
    searchTerm(term) {
      this.filtered = this.plcsInNetwork.filter(plc => {
        if (
          plc.ip.includes(term) ||
          plc.mac.includes(term) ||
          plc.articleNumber.includes(term) ||
          plc.name.includes(term)
        ) {
          return true;
        } else {
          return false;
        }
      });
    }
  },
  created() {
    this.refreshPlcs();
  },
  methods: {
    refreshPlcs() {
      this.loading = true;
      this.plc = null;
      this.$emit("error", null);
      this.$emit("plcSelected", null);
      ApiService.get("wago/search")
        .then(res => {
          this.loading = false;
          this.plcsInNetwork = res.data;
          this.filtered = res.data;
          this.$emit("error", null);
        })
        .catch(err => {
          this.loading = false;
          this.$emit("error", err.response.data);
        });
    },
    selectPlc(plc) {
      this.plc = plc;
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
.list {
  width: 100%;
}
</style>
