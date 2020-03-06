<template>
  <div>
    <span class="headline blue-grey--text darken-1--text">Add a PLC</span>

    <v-divider class="my-5"></v-divider>
    <div class="instructions">
      <span class="subtitle-1 blue-grey--text darken-1--text"
        >Please select the PLC that you want to add.</span
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

          <v-divider></v-divider>

          <v-stepper-step step="4">Completion</v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
          <v-stepper-content step="1" class="stepper-step-content mt-5">
            <SelectPlcFromNetwork @plcSelected="selectedPlcForDetails" />
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
              :active="loadingPlcDetails"
              :indeterminate="loadingPlcDetails"
              height="10"
              bottom
              rounded
              color="primary"
            ></v-progress-linear>
          </v-stepper-content>

          <v-stepper-content step="2" class="stepper-step-content mt-5 pa-5">
            {{ selectedPlc }}
          </v-stepper-content>

          <v-stepper-content step="3" class="stepper-step-content mt-5 pa-5">
            step3!
          </v-stepper-content>

          <v-stepper-content step="4" class="stepper-step-content mt-5 pa-5">
            step!4
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
      <v-btn color="success" class="ml-5" large v-if="currentStep === maxSteps"
        >Complete</v-btn
      >
    </div>
  </div>
</template>

<script>
import SelectPlcFromNetwork from "../components/SelectPlcFromNetwork";
import { ApiService } from "../services/api.service";

function nextStep(instance) {
  if (instance.currentStep <= instance.maxSteps) instance.currentStep++;
}

export default {
  name: "CreateSync",
  data: () => ({
    currentStep: 1,
    maxSteps: 4,
    selectedPlc: null,
    loadingPlcDetails: false,
    disableContinue: false,
    error: null,
    user: "",
    password: "",
    showPassword: false,
    rules: {
      required: value => !!value || "Required.",
      min: v => v.length >= 3 || "Min 3 characters"
    }
  }),
  components: {
    SelectPlcFromNetwork
  },
  methods: {
    stepBack() {
      if (this.currentStep >= 0) this.currentStep--;
    },
    nextStep() {
      switch (this.currentStep) {
        case 1:
          if (this.selectedPlc) {
            if (this.user.length >= 3 && this.password.length >= 3) {
              this.selectedPlc.user = this.user;
              this.selectedPlc.password = this.password;
              this.loadingPlcDetails = true;
              this.disableContinue = true;

              ApiService.post("wago/details", this.selectedPlc)
                .then(res => {
                  this.loadingPlcDetails = false;
                  this.disableContinue = false;
                  this.error = null;
                  this.selectedPlc = res.data;
                  nextStep(this);
                })
                .catch(err => {
                  this.error = err.response.data;
                  this.loadingPlcDetails = false;
                  this.disableContinue = false;
                });
            }
          }
          break;
        default:
          nextStep(this);
          break;
      }
    },
    cancelCreation() {
      console.log("Sync Creation Canceled");
      this.$emit("syncCreationCanceld");
    },
    selectedPlcForDetails(value) {
      console.log("SELECTED ", value);
      value.user = this.user;
      value.password = this.password;
      this.selectedPlc = value;
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
