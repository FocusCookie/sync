<template>
  <div>
    <span class="headline blue-grey--text darken-1--text">Creating a new Sync</span>

    <v-divider class="my-5"></v-divider>

    <div id="stepperWrapper">
      <div id="stepper">
        <span class="subtitle-2 font-weight-bold blue-grey--text darken-1--text">Step 1 of 4</span>
        <v-stepper v-model="currentStep" vertical id="v-stepper" class="elevation-0">
          <v-stepper-step :complete="currentStep > 1" step="1" class="step">PLC</v-stepper-step>

          <v-stepper-step :complete="currentStep > 2" step="2" class="step">Thing</v-stepper-step>

          <v-stepper-step :complete="currentStep > 3" step="3" class="step">Sync Interval</v-stepper-step>

          <v-stepper-step step="4">Completion</v-stepper-step>
        </v-stepper>
      </div>
      <div id="stepperContent">
        <div class="instructions">
          <span
            class="subtitle-1 blue-grey--text darken-1--text"
          >Please select the PLC that you want to link to this sync.</span>
        </div>

        <!-- <div class="creationBox mt-5">
          heroihesoirh
          <br />oejwpos
          <br />
        </div>-->

        <Sync_PlcSelect />

        <div class="actionBar mt-5">
          <v-btn color="default" text large>Cancel</v-btn>
          <v-btn outlined class="ml-5" @click="stepBack" large v-if="currentStep > 1">Back</v-btn>
          <v-btn
            color="primary"
            class="ml-5"
            @click="nextStep"
            large
            v-if="currentStep < maxSteps"
          >Continue</v-btn>
          <v-btn color="success" class="ml-5" large v-if="currentStep === maxSteps">Complete</v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sync_PlcSelect from "./Sync_PlcSelect";

export default {
  name: "CreateSync",
  data: () => ({
    currentStep: 1,
    maxSteps: 4
  }),
  components: {
    Sync_PlcSelect
  },
  methods: {
    stepBack() {
      if (this.currentStep >= 0) this.currentStep--;
    },
    nextStep() {
      if (this.currentStep <= this.maxSteps) this.currentStep++;
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

#stepperContent {
  width: 74%;
}

.instructions {
  background: #e1e7ec;
  border-radius: 5px;
  padding: 10px 20px;
}

.actionBar {
  display: flex;
  flex-flow: row wrap;
  /* This aligns items to the end line on main-axis */
  justify-content: flex-end;
}

.creationBox {
  background: #ffffff;
  border: 1px solid #b8c4cd;
  box-sizing: border-box;
  border-radius: 5px;
  padding: 10px 20px;
}
</style>
