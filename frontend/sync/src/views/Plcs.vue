<template>
  <div>
    <Message
      :icon="noSyncsMessage.icon"
      :headline="noSyncsMessage.headline"
      :message="noSyncsMessage.message"
      :button="noSyncsMessage.button"
      @createPlcEvent="createPlc"
      v-if="!viewcreatePlc"
    />
    <createPlc v-if="viewcreatePlc" @syncCreationCanceld="createPlc" />
  </div>
</template>

<script>
import Message from "../components/Message";
import CreatePlc from "../components/CreatePlc";

export default {
  name: "plcs",
  data: () => ({
    viewcreatePlc: false,
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
  components: {
    Message,
    CreatePlc
  },
  methods: {
    createPlc() {
      this.viewcreatePlc = !this.viewcreatePlc;
    }
  }
};
</script>
