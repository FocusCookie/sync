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
          </v-stepper-content>

          <v-stepper-content step="2" class="stepper-step-content mt-5 pa-5">
            step2!
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

export default {
  name: "CreateSync",
  data: () => ({
    currentStep: 1,
    maxSteps: 4
  }),
  components: {
    SelectPlcFromNetwork
  },
  methods: {
    stepBack() {
      if (this.currentStep >= 0) this.currentStep--;
    },
    nextStep() {
      if (this.currentStep <= this.maxSteps) this.currentStep++;
    },
    cancelCreation() {
      console.log("Sync Creation Canceled");
      this.$emit("syncCreationCanceld");
    },
    selectedPlcForDetails(value) {
      console.log("in creation stepper component");
      console.log(value);
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
  min-height: 100px;
  padding: 0;
}
</style>
