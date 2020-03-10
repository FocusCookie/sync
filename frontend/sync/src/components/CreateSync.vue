<template>
  <div>
    <span class="headline blue-grey--text darken-1--text">Create a Sync</span>

    <v-divider class="my-5"></v-divider>
    <div class="instructions">
      <span
        v-if="currentStep === 1"
        class="subtitle-1 blue-grey--text darken-1--text"
        >Please select the PLC that you want to link to this sync.</span
      >
      <span
        v-if="currentStep === 2"
        class="subtitle-1 blue-grey--text darken-1--text"
        >Please select the Thing that you want to link to this sync.</span
      >
      <span
        v-if="currentStep === 3"
        class="subtitle-1 blue-grey--text darken-1--text"
        >Please select the interval in which the Thing should be synchronized
        with the PLC.</span
      >
    </div>
    <br />
    <div id="stepperWrapper">
      <v-stepper v-model="currentStep" id="stepper" alt-labels>
        <v-stepper-header id="stepperHeader">
          <v-stepper-step :complete="currentStep > 1" step="1"
            >Select a PLC</v-stepper-step
          >

          <v-divider></v-divider>

          <v-stepper-step :complete="currentStep > 2" step="2"
            >Select a Thing</v-stepper-step
          >
          <v-divider></v-divider>

          <v-stepper-step :complete="currentStep > 3" step="3"
            >Sync Interval</v-stepper-step
          >
        </v-stepper-header>
        <v-stepper-items>
          <v-stepper-content step="1" class="stepper-step-content mt-5 pb-5">
            <v-container>
              <v-row no-gutters class="pa-5">
                <v-col cols="10">
                  <v-form class="ma-0">
                    <v-text-field
                      :disabled="loadingPlcs"
                      v-model="plcSearchTerm"
                      height="43"
                      dense
                      placeholder="Filter for a specific IP, MAC, Articlenumber or name."
                      outlined
                      hide-details
                    ></v-text-field>
                  </v-form>
                </v-col>
                <v-col cols="2">
                  <v-btn
                    @click="getPlcs"
                    outlined
                    large
                    class="float-right"
                    :disabled="loadingPlcs"
                  >
                    PLC's
                    <v-icon right>mdi-refresh</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <v-row no-gutters v-if="loadingPlcs">
                <v-progress-linear
                  :active="loadingPlcs"
                  :indeterminate="loadingPlcs"
                  height="10"
                  bottom
                  color="primary"
                ></v-progress-linear>
              </v-row>
              <v-row no-gutters>
                <v-divider></v-divider>
              </v-row>
              <v-row no-gutters v-if="!loadingPlcs">
                <v-expansion-panels accordion focusable flat mandatory>
                  <v-expansion-panel v-for="(plc, i) in filteredPlcs" :key="i">
                    <v-expansion-panel-header @click="selectPlc(plc)">
                      <v-row no-gutters>
                        <v-col cols="3">{{ plc.name }}</v-col>
                        <v-col cols="3">{{ plc.ip }}</v-col>
                        <v-col cols="3">{{ plc.articleNumber }}</v-col>
                        <v-col cols="3">{{ plc.mac }}</v-col>
                      </v-row>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="pa-2">
                      <v-treeview open-on-click :items="plc.files">
                        <template v-slot:prepend="{ item, open }">
                          <v-icon v-if="!item.datatype">
                            {{ open ? "mdi-folder-open" : "mdi-folder" }}
                          </v-icon>
                          <v-chip
                            v-if="item.datatype"
                            class="ma-2 datatypes"
                            color="primary"
                            outlined
                            label
                            >{{ item.datatype }}
                          </v-chip>
                        </template>
                      </v-treeview>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-row>
            </v-container>
          </v-stepper-content>

          <v-stepper-content step="2" class="stepper-step-content mt-5">
            <v-container>
              <v-row no-gutters class="pa-5">
                <v-col cols="10">
                  <v-form class="ma-0">
                    <v-text-field
                      :disabled="loadingThings"
                      v-model="thingSearchTerm"
                      height="43"
                      dense
                      placeholder="Filter for a thing name or host."
                      outlined
                      hide-details
                    ></v-text-field>
                  </v-form>
                </v-col>
                <v-col cols="2">
                  <v-btn
                    @click="getThings"
                    outlined
                    large
                    class="float-right"
                    :disabled="loadingThings"
                  >
                    Things
                    <v-icon right>mdi-refresh</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <v-row no-gutters v-if="loadingThings">
                <v-progress-linear
                  :active="loadingThings"
                  :indeterminate="loadingThings"
                  height="10"
                  bottom
                  color="primary"
                ></v-progress-linear>
              </v-row>
              <v-row no-gutters>
                <v-divider></v-divider>
              </v-row>
              <v-row no-gutters v-if="!loadingThings">
                <v-expansion-panels accordion focusable flat mandatory>
                  <v-expansion-panel
                    v-for="(thing, i) in filteredThings"
                    :key="i"
                  >
                    <v-expansion-panel-header @click="selectThing(thing)"
                      ><v-row no-gutters>
                        <v-col cols="6">{{ thing.thingName }}</v-col>
                        <v-col cols="6">{{ thing.host }}</v-col>
                      </v-row></v-expansion-panel-header
                    >
                    <v-expansion-panel-content class="pa-5 pl-10 pr-10">
                      <v-container>
                        <v-row>
                          <v-col cols="12">
                            <v-text-field
                              label="Certificate"
                              :value="thing.certificate"
                              prepend-inner-icon="mdi-certificate-outline"
                              outlined
                              disabled
                              dense
                              hide-details
                            >
                            </v-text-field>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12">
                            <v-text-field
                              label="Private Key"
                              :value="thing.privateKey"
                              prepend-inner-icon="mdi-certificate-outline"
                              outlined
                              disabled
                              dense
                              hide-details
                            >
                            </v-text-field>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12">
                            <v-text-field
                              label="CA Chain"
                              :value="thing.caChain"
                              prepend-inner-icon="mdi-certificate-outline"
                              outlined
                              disabled
                              dense
                              hide-details
                            >
                            </v-text-field>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-row>
            </v-container>
          </v-stepper-content>

          <v-stepper-content step="3" class="stepper-step-content mt-5 pa-5">
            <v-container class="mt-1">
              <v-row>
                <v-col col="6" class="pl-5">
                  <v-slider
                    min="1"
                    max="60"
                    class="mt-10"
                    v-model="selectedInterval"
                    thumb-label="always"
                  ></v-slider>
                </v-col>
                <v-col cols="6">
                  <v-select
                    v-model="selectIntervalBase"
                    :items="intervalBase"
                    :rules="[v => !!v || 'Item is required']"
                    required
                    outlined
                  ></v-select>
                </v-col>
              </v-row>
            </v-container>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </div>

    <v-alert v-if="error" type="error" class="mt-5">{{ error }}</v-alert>

    <div class="actionBar mt-5">
      <v-btn @click="cancelCreation" color="default" text large>Cancel</v-btn>
      <v-btn
        outlined
        class="ml-5"
        @click="stepBack"
        large
        v-if="currentStep > 1"
        >Back</v-btn
      >
      <v-btn
        color="primary"
        class="ml-5"
        @click="nextStep"
        large
        v-if="currentStep < maxSteps"
        :disabled="disableContinue"
        >Continue</v-btn
      >
      <v-btn
        @click="createSync"
        color="success"
        class="ml-5"
        large
        v-if="currentStep === maxSteps"
        >Complete</v-btn
      >
    </div>
  </div>
</template>

<script>
import { ApiService } from "../services/api.service";

export default {
  name: "CreateThing",
  data: () => ({
    currentStep: 1,
    disableContinue: false,
    plcs: null,
    filteredPlcs: [],
    selectedPlc: null,
    things: null,
    filteredThings: [],
    selectedThing: null,
    maxSteps: 3,
    error: null,
    loadingPlcs: false,
    loadingThings: false,
    plcSearchTerm: "",
    thingSearchTerm: "",
    intervalBase: ["Second", "Minute", "Hour"],
    selectIntervalBase: "Minute",
    selectedInterval: 5
  }),
  components: {},
  created() {
    this.getPlcs();
    this.getThings();
  },
  watch: {
    plcSearchTerm(term) {
      this.filteredPlcs = this.plcs.filter(plc => {
        let regEx = new RegExp(term, "i");
        if (
          regEx.test(plc.ip) ||
          regEx.test(plc.mac) ||
          regEx.test(plc.articleNumber) ||
          regEx.test(plc.name)
        ) {
          return true;
        } else {
          return false;
        }
      });
    },
    thingSearchTerm(term) {
      this.filteredThings = this.things.filter(things => {
        let regEx = new RegExp(term, "i");
        if (
          regEx.test(things.ip) ||
          regEx.test(things.mac) ||
          regEx.test(things.articleNumber) ||
          regEx.test(things.name)
        ) {
          return true;
        } else {
          return false;
        }
      });
    }
  },
  methods: {
    stepBack() {
      if (this.currentStep >= 0) this.currentStep--;
      this.error = null;
    },
    cancelCreation() {
      this.$router.push("/syncs");
    },
    errorStepOne(value) {
      this.error = value;
    },
    nextStep() {
      if (this.currentStep <= this.maxSteps) this.currentStep++;
    },
    getPlcs() {
      this.loadingPlcs = true;
      this.plcs = null;
      ApiService.get("wago")
        .then(res => {
          if (res.data.length > 0) {
            this.plcs = res.data.map(plc => {
              return {
                name: plc.name,
                _id: plc._id,
                ip: plc.ip,
                mac: plc.mac,
                articleNumber: plc.articleNumber,
                files: plc.files.map((file, index) => {
                  return {
                    id: index,
                    name: file.name,
                    children: file.variables.map((variable, varIndex) => {
                      return {
                        id: varIndex,
                        name: variable.prgName + "." + variable.varName,
                        datatype: variable.datatype
                      };
                    })
                  };
                })
              };
            });
          }
          this.selectedPlc = this.plcs[0];
          this.filteredPlcs = this.plcs;
          this.loadingPlcs = false;
          this.error = null;
        })
        .catch(err => {
          this.error = err.response.data;
        });
    },
    selectPlc(plc) {
      this.selectedPlc = plc;
    },
    getThings() {
      this.loadingThings = true;
      this.things = null;
      ApiService.get("aws/things")
        .then(res => {
          if (res.data.length > 0) {
            this.things = res.data.map(thing => {
              return {
                _id: thing._id,
                thingName: thing.thingName,
                caChain: thing.caChain.split("_")[2],
                certificate: thing.certificate.split("_")[2],
                privateKey: thing.privateKey.split("_")[2]
              };
            });
          }
          this.selectedThing = this.things[0];
          this.filteredThings = this.things;
          this.loadingThings = false;
          this.error = null;
        })
        .catch(err => {
          this.error = err.response.data;
        });
    },
    selectThing(thing) {
      this.selectedThing = thing;
    },
    createSync() {
      let interval = null;
      switch (this.selectIntervalBase) {
        case "Second":
          interval = parseInt(this.selectedInterval) * 1000;
          break;
        case "Minute":
          interval = parseInt(this.selectedInterval) * 1000 * 60;
          break;
        case "Hour":
          interval = parseInt(this.selectedInterval) * 1000 * 60 * 60 * 24;
          break;
        default:
          break;
      }
      ApiService.post("synchronisations", {
        plcId: this.selectedPlc._id,
        cloudProvider: "aws",
        cloudOptionsId: this.selectedThing._id,
        interval: interval
      })
        .then(() => {
          this.$router.push({ path: "/syncs" });
        })
        .catch(err => {
          this.error = err.response.data;
        });
    }
  }
};
</script>

<style>
#stepperWrapper {
  width: 100%;
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
}
#stepper {
  background: none;
  width: 24%;
  padding: 0;
}
#v-stepper {
  background: none;
  padding: 0;
}

.instructions {
  background: #e1e7ec;
  border-radius: 5px;
  padding: 10px 20px;
  width: 100%;
}

.actionBar {
  display: flex;
  flex-flow: row wrap;
  /* This aligns items to the end line on main-axis */
  justify-content: flex-end;
}

#stepper {
  border-radius: 0;
  width: 100%;
  box-shadow: none;
  background: none;
}
#stepperHeader {
  background: #ffffff;
  box-shadow: none;
  border: 1px solid #b8c4cd;
  box-sizing: border-box;
  border-radius: 5px;
}

.stepper-step-content {
  background: #ffffff;
  box-shadow: none;
  border: 1px solid #b8c4cd;
  box-sizing: border-box;
  border-radius: 5px;

  padding: 0;
}
.datatypes {
  width: 75px;
}
.v-chip__content {
  margin: 0 auto;
}
.v-expansion-panel--active > .v-expansion-panel-header {
  color: #1976d2 !important;
  background: ##b3d4fc;
}
</style>
