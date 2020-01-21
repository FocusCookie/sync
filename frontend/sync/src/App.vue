<template>
  <v-app>
    <v-app-bar app flat id="appBar">
      <Navbar />
    </v-app-bar>

    <!-- Sizes your content based upon application components -->
    <v-content>
      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <!-- If using vue-router -->
        <div id="content">
          <router-view></router-view>
        </div>
      </v-container>
    </v-content>

    <v-footer app>
      <!-- -->
    </v-footer>
  </v-app>
</template>

<script>
import Navbar from "./components/NavBar";

export default {
  name: "App",
  components: {
    Navbar
  },
  data: () => ({
    //
  })
};
</script>

<style>
#app {
  background: #f0f2f5;
}
#appBar {
  border-bottom: 4px solid #d0d8e0;
}
#content {
  width: 1024px;
  margin: 0 auto;
}
</style>
