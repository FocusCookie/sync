<template>
  <div>
    <span class="headline blue-grey--text darken-1--text">Create a Thing</span>

    <v-divider class="my-5"></v-divider>
    <div class="instructions">
      <span
        v-if="currentStep === 1"
        class="subtitle-1 blue-grey--text darken-1--text"
        >Please enter the name and the host address of your Thing.</span
      >
      <span
        v-if="currentStep === 2"
        class="subtitle-1 blue-grey--text darken-1--text"
        >Please upload your thing certificate, private key and CA chain.</span
      >
    </div>
    <br />
    <div id="stepperWrapper">
      <v-stepper v-model="currentStep" id="stepper" alt-labels>
        <v-stepper-header id="stepperHeader">
          <v-stepper-step :complete="currentStep > 1" step="1"
            >Name and Host</v-stepper-step
          >

          <v-divider></v-divider>

          <v-stepper-step :complete="currentStep > 2" step="2"
            >Certificates</v-stepper-step
          >
        </v-stepper-header>
        <v-stepper-items>
          <v-stepper-content step="1" class="stepper-step-content mt-5">
            <v-container>
              <v-row class="pt-5 pl-5 pr-5">
                <v-col cols="12">
                  <v-form class="ma-0">
                    <v-text-field
                      v-model="thingName"
                      :rules="[rules.required, rules.minName]"
                      name="Name"
                      label="Name"
                      placeholder="Enter a name for your Thing"
                      hint="At least 3 characters"
                      required
                      outlined
                    ></v-text-field>
                  </v-form>
                </v-col>
              </v-row>
              <v-row class="pt-5 pl-5 pr-5">
                <v-col cols="12">
                  <v-form class="ma-0">
                    <v-text-field
                      v-model="thingHost"
                      :rules="[rules.required, rules.minHost]"
                      name="Host"
                      label="Host"
                      placeholder="Enter the Host address of the AWS Thing."
                      hint="At least 10 characters"
                      required
                      outlined
                    ></v-text-field>
                  </v-form>
                </v-col>
              </v-row>
            </v-container>
          </v-stepper-content>

          <v-stepper-content step="2" class="stepper-step-content mt-5 pa-5">
            <v-container>
              <v-row class="pt-5 pl-5 pr-5">
                <v-col cols="12">
                  <v-file-input
                    v-model="thingCertificate"
                    accept=".crt"
                    color="primary"
                    label="Certificate"
                    placeholder="Select your Certificate"
                    prepend-icon="mdi-certificate-outline"
                    outlined
                  >
                    <template v-slot:selection="{ index, text }">
                      <v-chip
                        v-if="index < 2"
                        color="primary"
                        dark
                        label
                        small
                        >{{ text }}</v-chip
                      >

                      <span
                        v-else-if="index === 2"
                        class="overline grey--text text--darken-3 mx-2"
                        >+{{ files.length - 2 }} File(s)</span
                      >
                    </template>
                  </v-file-input>
                </v-col>
              </v-row>
              <v-row class="pt-5 pl-5 pr-5">
                <v-col cols="12">
                  <v-file-input
                    v-model="thingPrivateKey"
                    accept=".key"
                    color="primary"
                    label="Private Key"
                    placeholder="Select your Private Key"
                    prepend-icon="mdi-key"
                    outlined
                  >
                    <template v-slot:selection="{ index, text }">
                      <v-chip
                        v-if="index < 2"
                        color="primary"
                        dark
                        label
                        small
                        >{{ text }}</v-chip
                      >

                      <span
                        v-else-if="index === 2"
                        class="overline grey--text text--darken-3 mx-2"
                        >+{{ files.length - 2 }} File(s)</span
                      >
                    </template>
                  </v-file-input>
                </v-col>
              </v-row>
              <v-row class="pt-5 pl-5 pr-5">
                <v-col cols="12">
                  <v-file-input
                    v-model="thingCa"
                    accept=".pem"
                    color="primary"
                    label="CA"
                    placeholder="Select your CA"
                    prepend-icon="mdi-link-lock"
                    outlined
                  >
                    <template v-slot:selection="{ index, text }">
                      <v-chip
                        v-if="index < 2"
                        color="primary"
                        dark
                        label
                        small
                        >{{ text }}</v-chip
                      >

                      <span
                        v-else-if="index === 2"
                        class="overline grey--text text--darken-3 mx-2"
                        >+{{ files.length - 2 }} File(s)</span
                      >
                    </template>
                  </v-file-input>
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
        @click="createThing"
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
//import { ApiService } from "../services/api.service";
//import router from "../router/index";

function nextStep(instance) {
  if (instance.currentStep <= instance.maxSteps) instance.currentStep++;
}

export default {
  name: "CreateThing",
  data: () => ({
    currentStep: 1,
    maxSteps: 2,
    thingCertificate: null,
    thingPrivateKey: null,
    thingCa: null,
    thingName: "",
    thingHost: "",
    disableContinue: false,
    error: null,
    rules: {
      required: value => !!value || "Required.",
      minName: v => v.length >= 3 || "Min 3 characters",
      minHost: v => v.length >= 10 || "Min 10 characters"
    }
  }),
  components: {},
  methods: {
    stepBack() {
      if (this.currentStep >= 0) this.currentStep--;
      this.error = null;
    },
    nextStep() {
      switch (this.currentStep) {
        case 1:
          if (this.thingName.length >= 3 && this.thingHost.length >= 3) {
            nextStep(this);
            this.error = null;
          } else {
            this.error = "Please enter a name and a host.";
          }
          break;
        default:
          nextStep(this);
          break;
      }
    },
    cancelCreation() {
      this.$router.push("/things");
    },
    errorStepOne(value) {
      this.error = value;
    },
    createThing() {
      ApiService.post("aws/things", {
        thingName: this.thingName,
        host: this.thingHost
      })
        .then(thingRes => {
          // add certs and kes to the formdata
          let certsFormData = new FormData();
          certsFormData.append("certs", this.thingCertificate);
          certsFormData.append("certs", this.thingPrivateKey);
          certsFormData.append("certs", this.thingCa);

          ApiService.post(
            `aws/things/${thingRes.data._id}/certs`,
            certsFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data"
              }
            }
          )
            .then(() => this.$router.push("/things"))
            .catch(certErr => (this.error = certErr.response.data));
        })
        .catch(thingErr => (this.error = thingErr.response.data));
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
