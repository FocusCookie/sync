<template>
  <div>
    <span class="headline blue-grey--text darken-1--text">Add a PLC</span>

    <v-divider class="my-5"></v-divider>
    <div class="instructions">
      <span
        v-if="currentStep === 1"
        class="subtitle-1 blue-grey--text darken-1--text"
        >Please select the PLC that you want to add.</span
      >
      <span
        v-if="currentStep === 2"
        class="subtitle-1 blue-grey--text darken-1--text"
        >Please select the variables that you want to sync later.</span
      >
      <span
        v-if="currentStep === 3"
        class="subtitle-1 blue-grey--text darken-1--text"
        >Please give the PLC a name.</span
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
            >Select Variables</v-stepper-step
          >

          <v-divider></v-divider>

          <v-stepper-step :complete="currentStep > 3" step="3"
            >Define a name</v-stepper-step
          >
        </v-stepper-header>
        <v-stepper-items>
          <v-stepper-content step="1" class="stepper-step-content mt-5">
            <SelectPlcFromNetwork
              @plcSelected="selectedPlcForDetails"
              @error="errorStepOne"
            />
            <v-container>
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
            <v-progress-linear
              :active="loading"
              :indeterminate="loading"
              height="10"
              bottom
              rounded
              color="primary"
            ></v-progress-linear>
          </v-stepper-content>

          <v-stepper-content step="2" class="stepper-step-content mt-5 pa-5">
            <v-data-table
              v-model="selected"
              :headers="headers"
              :items="visuVars"
              item-key="varName"
              show-select
              class="elevation-0"
              :search="search"
            >
              <template v-slot:top>
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
                ></v-text-field>
              </template>
            </v-data-table>
          </v-stepper-content>

          <v-stepper-content step="3" class="stepper-step-content mt-5">
            <v-progress-linear
              v-if="finalLoader"
              :active="finalLoader"
              :indeterminate="finalLoader"
              height="10"
              bottom
              rounded
              color="success"
            ></v-progress-linear>
            <v-container v-if="!finalLoader" class="pa-5">
              <v-row>
                <v-col cols="12">
                  <v-form class="ma-0">
                    <v-text-field
                      v-model="finalName"
                      :rules="[rules.required, rules.min]"
                      name="finalName"
                      label="PLC Name"
                      placeholder="Enter a PLC name."
                      hint="At least 3 characters"
                      required
                      outlined
                    ></v-text-field>
                  </v-form>
                </v-col>
              </v-row>
            </v-container>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </div>

    <v-alert v-if="error" type="error" class="mt-5">
      {{ error }}
    </v-alert>

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
        @click="createPlc"
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
import SelectPlcFromNetwork from "../components/SelectPlcFromNetwork";
import { ApiService } from "../services/api.service";
//import router from "../router/index";

function nextStep(instance) {
  if (instance.currentStep <= instance.maxSteps) instance.currentStep++;
}

export default {
  name: "CreatePlc",
  data: () => ({
    currentStep: 1,
    maxSteps: 3,
    selectedPlc: null,
    loading: false,
    disableContinue: false,
    error: null,
    finalPlc: null,
    finalLoader: false,
    user: "",
    finalName: "",
    password: "",
    showPassword: false,
    rules: {
      required: value => !!value || "Required.",
      min: v => v.length >= 3 || "Min 3 characters"
    },
    selected: [],
    search: "",
    headers: [
      {
        text: "Variable",
        algin: "start",
        value: "varName"
      },
      { text: "Programn", value: "prgName" },
      { text: "Datatype", value: "datatype" },
      { text: "Visualization", value: "visu" }
    ],
    visuVars: []
  }),
  components: {
    SelectPlcFromNetwork
  },
  methods: {
    stepBack() {
      if (this.currentStep >= 0) this.currentStep--;
      this.error = null;
    },
    nextStep() {
      switch (this.currentStep) {
        case 1:
          // only go to the next step if the plc is reachable an the credentials are working
          if (this.selectedPlc) {
            if (this.user.length >= 3 && this.password.length >= 3) {
              this.selectedPlc.user = this.user;
              this.selectedPlc.password = this.password;
              this.loading = true;
              this.disableContinue = true;
              this.visuVars = [];
              this.error = null;

              ApiService.post("wago/details", this.selectedPlc)
                .then(res => {
                  this.loading = false;
                  this.disableContinue = false;
                  this.error = null;
                  this.selectedPlc = res.data;

                  res.data.files.forEach(file => {
                    if (file.variables.length > 0) {
                      file.variables.forEach(variable => {
                        if (variable.prgName === "")
                          variable.prgName = "Global";
                        // Datatypes to human readable format
                        let datatype = parseInt(variable.datatype, 10);
                        switch (datatype) {
                          case 0:
                            datatype = "BOOL";
                            break;
                          case 1:
                            datatype = "INT";
                            break;
                          case 2:
                            datatype = "BYTE";
                            break;
                          case 3:
                            datatype = "Word";
                            break;
                          case 5:
                            datatype = "DWORD";
                            break;
                          case 6:
                            datatype = "LREAL";
                            break;
                          case 7:
                            datatype = "TIME";
                            break;
                          case 8:
                            datatype = "STRING";
                            break;
                          case 18:
                            datatype = "DATE";
                            break;
                          default:
                            break;
                        }

                        // only push new variables int othe visuVars if there are not know already
                        const existsAlready = this.visuVars.some(item =>
                          item.varName === variable.varName &&
                          item.prgName === variable.prgName
                            ? true
                            : false
                        );

                        if (!existsAlready) {
                          this.visuVars.push({
                            varName: variable.varName,
                            prgName: variable.prgName,
                            datatype: datatype,
                            arti: variable.arti,
                            visu: file.name
                          });
                        }
                      });
                    }
                  });
                  nextStep(this);
                })
                .catch(err => {
                  this.error = err.response.data;
                  this.loading = false;
                  this.disableContinue = false;
                });
            } else {
              this.error = "Please enter the PLC credentials.";
            }
          } else {
            this.error = "Please select a PLC.";
          }
          break;
        case 2:
          // use only the selected items for the final steps
          if (this.selected.length > 0) {
            // save the file names
            const files = this.selectedPlc.files.map(file => file.name);
            this.finalPlc = Object.assign({}, this.selectedPlc);
            this.finalPlc.files = [];

            // check for each file if there is a var selected and push this into the selected PLC files array
            files.forEach(file => {
              let result = {
                name: file,
                variables: []
              };

              this.selected
                .filter(variable => variable.visu === file)
                .forEach(elem => {
                  result.variables.push({
                    varName: elem.varName,
                    prgName: elem.prgName,
                    datatype: elem.datatype,
                    arti: elem.arti
                  });
                });
              if (result.variables.length > 0) this.finalPlc.files.push(result);
            });
            this.error = null;
            nextStep(this);
          } else {
            this.error = "Please select at least one Variable.";
          }

          break;

        default:
          nextStep(this);
          break;
      }
    },
    cancelCreation() {
      this.$router.push("/plcs");
    },
    selectedPlcForDetails(value) {
      if (this.user) value.user = this.user;
      if (this.password) value.password = this.password;

      this.selectedPlc = value;
    },
    createPlc() {
      if (this.finalName && this.finalName.length >= 3) {
        this.error = null;
        this.finalPlc.name = this.finalName;
        this.finalLoader = true;
        ApiService.post("wago", this.finalPlc)
          .then(() => {
            this.finalLoader = false;
            this.$router.push({ path: "/plcs" });
          })
          .catch(err => {
            this.finalLoader = false;
            this.error = err.response.data;
          });
      } else {
        this.error = "Please enter a PLC name.";
      }
    },
    errorStepOne(value) {
      this.error = value;
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
</style>
