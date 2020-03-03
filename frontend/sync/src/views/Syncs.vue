<template>
  <div>
    <Message
      :icon="noSyncsMessage.icon"
      :headline="noSyncsMessage.headline"
      :message="noSyncsMessage.message"
      :button="noSyncsMessage.button"
      @createSyncEvent="createSync"
      v-if="!viewCreateSync"
    />
    <CreateSync v-if="viewCreateSync" @syncCreationCanceld="createSync" />
  </div>
</template>

<script>
import Message from "../components/Message";
import CreateSync from "../components/CreateSync";

export default {
  name: "syncs",
  data: () => ({
    viewCreateSync: false,
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
    Message,
    CreateSync
  },
  methods: {
    createSync() {
      this.viewCreateSync = !this.viewCreateSync;
    }
  }
};
</script>
