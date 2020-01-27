<template>
  <div id="nav">
    <div class="d-flex align-center float-left">
      <v-img src="../assets/logo.png" class="mr-2"></v-img>
      <v-btn href="/syncs" color="blue-grey darken-1 ml-2 " text x-large>
        <span class="font-weight-bold">Syncs</span>
      </v-btn>
      <v-btn href="/things" color="blue-grey darken-1 ml-2" text x-large>
        <span class="font-weight-bold">Things</span>
      </v-btn>
      <v-btn href="/plcs" color="blue-grey darken-1 ml-2" text x-large>
        <span class="font-weight-bold">PLC's</span>
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
