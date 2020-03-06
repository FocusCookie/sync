<template>
  <div>
    <div class="actionBar mt-5 mb-5">
      <v-btn color="primary" class="ml-5" to="plcs/create" large v-if="plcs"
        >Create a new PLC</v-btn
      >
    </div>
    <Message
      :icon="noSyncsMessage.icon"
      :headline="noSyncsMessage.headline"
      :message="noSyncsMessage.message"
      :button="noSyncsMessage.button"
      @createPlcEvent="createPlc"
      v-if="!plcs"
    />
    <v-container v-if="plcs">
      <v-row dense>
        <v-col v-for="(plc, i) in plcs" :key="i" cols="12">
          <v-card color="#26c6da" dark>
            <div class="d-flex flex-no-wrap justify-space-between">
              <div>
                <v-card-title class="headline" v-text="plc.name"></v-card-title>

                <v-card-subtitle v-text="plc.ip"></v-card-subtitle>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Message from "../components/Message";
import { ApiService } from "../services/api.service";

export default {
  name: "plcs",
  data: () => ({
    plcs: false,
    noSyncsMessage: {
      headline: "No PLC found.",
      message: "Please add a PLC.",
      icon: "mdi-emoticon-confused-outline",
      button: {
        text: "Add a PLC",
        event: {
          name: "createPlcEvent",
          data: "createPlcBtnClicked"
        }
      }
    }
  }),
  created() {
    ApiService.get("wago")
      .then(res => {
        if (res.data.length > 1) this.plcs = res.data;
      })
      .catch(err => console.log(err));
  },
  components: {
    Message
  },
  methods: {
    createPlc() {
      this.$router.push("plcs/create");
    }
  }
};
</script>
