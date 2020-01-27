<template>
  <div>
    <Message
      :icon="noSyncsMessage.icon"
      :headline="noSyncsMessage.headline"
      :message="noSyncsMessage.message"
      :button="noSyncsMessage.button"
      @createSyncEvent="con"
    />
  </div>
</template>

<script>
import Message from "../components/Message";

export default {
  name: "syncs",
  data: () => ({
    noSyncsMessage: {
      headline: "No Sync found.",
      message: "Please create your first sync.",
      icon: "mdi-emoticon-confused-outline",
      button: {
        text: "Create Sync",
        event: {
          name: "createSyncEvent",
          data: "createSyncBtnClicked"
        }
      }
    }
  }),
  components: {
    Message
  },
  methods: {
    con(payload) {
      console.log(payload);
    }
  }
};
</script>
