<template>
  <div id="message">
    <div id="msgIconPlaceholder">
      <v-icon size="75">{{ icon }}</v-icon>
    </div>
    <div id="msgContentWrapper">
      <div id="msgContent">
        <p class="headline">{{ headline }}</p>
        <p class="body-1">{{ message }}</p>
      </div>
      <div id="msgContentAction">
        <v-btn
          @click="msgAction(button.event)"
          color="blue"
          class="float-right"
          dark
          large
          >{{ button.text }}</v-btn
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Message",
  data: () => ({}),
  methods: {
    msgAction(event) {
      this.$emit(event.name, event.data);
    }
  },
  props: ["headline", "message", "icon", "button"]
};
</script>

<style>
#message {
  width: 482px;
  min-height: 192px;
  background: #ffffff;
  border: 1px solid #b8c4cd;
  box-sizing: border-box;
  border-radius: 5px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  align-items: stretch;
}
#msgIconPlaceholder {
  align-items: stretch;
  bottom: 0px;
  background: #b8c4cd;
  border-radius: 4px 0px 0px 4px;
  width: 146px;
  padding: 50px 20px 0 20px;
  text-align: center;
}
#msgContentWrapper {
  align-items: stretch;
  padding: 20px;
  border-radius: 4px 0px 0px 4px;
  width: 336px;
}
#msgContent {
  min-height: 105px;
}
</style>
