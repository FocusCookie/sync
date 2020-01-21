<template>
  <div id="nav">
    <div class="d-flex align-center float-left">
      <v-img
        alt="logoIpsum"
        class="shrink mr-2"
        contain
        src="../assets/logo.png"
        transition="scale-transition"
      />
      <v-btn href="/about" color="blue-grey darken-1" text x-large>
        <span class="ml-2 font-weight-bold">Syncs</span>
      </v-btn>
      <v-btn href="#" color="blue-grey darken-1" text x-large>
        <span class="ml-2 font-weight-bold">Things</span>
      </v-btn>
      <v-btn href="#" color="blue-grey darken-1" text x-large>
        <span class="ml-2 font-weight-bold">PLC's</span>
      </v-btn>
    </div>

    <v-spacer></v-spacer>

    <div class="d-flex align-center float-right">
      <v-btn href="#" color="blue-grey darken-1" text x-large>
        <v-icon>mdi-settings</v-icon>
      </v-btn>
      <v-btn href="#" color="blue-grey darken-1" text x-large>
        <span class="ml-1 font-weight-bold">LOGOUT</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: "NavBar",
  data: () => ({})
};
</script>

<style>
#nav {
  width: 1024px;
  margin: 0 auto;
}
</style>
