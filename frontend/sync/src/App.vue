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
        <div id="content" class="mt-5 mb-5">
          <router-view></router-view>
        </div>
      </v-container>
    </v-content>

    <v-footer app fixed id="appFooter" padless>
      <Footer />
    </v-footer>
  </v-app>
</template>

<script>
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";

export default {
  name: "App",
  components: {
    Navbar,
    Footer
  },
  data: () => ({
    password: "Password",
    showPassword: false,
    email: "email",
    loginError: null,
    rules: {
      required: value => !!value || "Required.",
      min: v => v.length >= 8 || "Min 8 characters",
      emailMatch: () => "The email and password you entered don't match"
    }
  }),
  methods: {}
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
#appFooter {
  background: #cfd6de;
}
</style>
