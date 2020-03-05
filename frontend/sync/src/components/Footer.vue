<template>
  <div id="footer">
    <div class="d-flex align-center float-left">
      <v-btn href="#" color="blue-grey darken-1" text x-large>
        <v-icon>mdi-copyright</v-icon>
        <span class="ml-2 font-weight-bold">Copyright 2020</span>
      </v-btn>
    </div>

    <v-spacer></v-spacer>

    <div class="d-flex align-center float-right">
      <v-btn href="#" color="blue-grey darken-1" text x-large>
        <span class="ml-1 font-weight-bold">Impressum</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: "Footer",
  data: () => ({})
};
</script>

<style>
#footer {
  width: 1024px;
  height: 56px;
  margin: 0 auto;
}
</style>
