<template>
  <div id="nav">
    <div class="d-flex align-center float-left">
      <router-link to="/">
        <v-img src="../assets/logo.svg" class="mr-2 mt-1"></v-img>
      </router-link>

      <v-btn to="/syncs" color="blue-grey darken-1 ml-2 " text x-large>
        <span class="font-weight-bold">Syncs</span>
      </v-btn>
      <v-btn to="/things" color="blue-grey darken-1 ml-2" text x-large>
        <span class="font-weight-bold">Things</span>
      </v-btn>
      <v-btn to="/plcs" color="blue-grey darken-1 ml-2" text x-large>
        <span class="font-weight-bold">PLC's</span>
      </v-btn>
    </div>

    <v-spacer></v-spacer>

    <div class="d-flex align-center float-right">
      <!-- <v-btn href="#" color="blue-grey darken-1" text x-large>
        <v-icon>mdi-settings</v-icon>
      </v-btn> -->
      <v-btn @click="logout" href="/" color="blue-grey darken-1" text x-large>
        <span class="ml-1 font-weight-bold">LOGOUT</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { UserService } from "../services/user.service";

export default {
  name: "NavBar",
  data: () => ({}),
  methods: {
    logout() {
      UserService.logout();
    }
  }
};
</script>

<style>
#nav {
  width: 1024px;
  margin: 0 auto;
}
</style>
