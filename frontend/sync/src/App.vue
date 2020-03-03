<template>
  <v-app>
    <v-app-bar v-if="userToken" app flat id="appBar">
      <Navbar @logout="destroyUserToken" />
    </v-app-bar>

    <!-- Sizes your content based upon application components -->
    <v-content>
      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <!-- If using vue-router -->
        <div id="content">
          <v-container v-if="!userToken" id="loginWrapper">
            <v-row>
              <v-col></v-col>
              <v-col>
                <v-card width="398" id="roundedLoginCard" class="pa-6" raised>
                  <v-img
                    src="./assets/loginLogo.png"
                    width="218"
                    height="48"
                    class="logo mt-3"
                  ></v-img>
                  <br />
                  <v-card-title class="title"
                    >👋 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Quam consectetur volutpat amet porttitor.
                  </v-card-title>
                  <br />
                  <v-card-text>
                    <v-text-field
                      ref="email"
                      v-model="email"
                      label="email"
                      placeholder="email"
                      required
                      outlined
                      rounded
                      single-line
                    ></v-text-field>
                    <v-text-field
                      v-model="password"
                      :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                      :rules="[rules.required, rules.min]"
                      :type="showPassword ? 'text' : 'password'"
                      name="input-10-1"
                      label="Normal with hint text"
                      hint="At least 8 characters"
                      required
                      outlined
                      rounded
                      single-line
                      @click:append="showPassword = !showPassword"
                    ></v-text-field>
                    <v-btn
                      @click="login"
                      rounded
                      block
                      color="primary"
                      dark
                      x-large
                      >Login</v-btn
                    >
                  </v-card-text>
                </v-card>
                <br />
                <v-alert
                  v-if="loginError"
                  dense
                  type="error"
                  id="roundedAlert"
                  elevation="10"
                >
                  {{ loginError }}
                </v-alert>
              </v-col>
              <v-col></v-col>
            </v-row>
          </v-container>
          <router-view v-if="userToken"></router-view>
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
import axios from "axios";

export default {
  name: "App",
  components: {
    Navbar,
    Footer
  },
  data: () => ({
    userToken: null,
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
  methods: {
    login: function() {
      let self = this;
      axios
        .post("https://localhost:3000/api/auth", {
          email: this.email,
          password: this.password
        })
        .then(function(res) {
          console.log("token before " + self.userToken);
          self.userToken = res.data;
          self.loginError = null;
        })
        .catch(function(err) {
          console.log(err);
          self.loginError = err.response.data;
        });
    },
    destroyUserToken: function() {
      this.userToken = null;
      this.loginError = null;
      this.password = "Password";
    }
  }
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
#loginWrapper {
  width: 926px;
  height: 655px;
  background-image: url("./assets/loginDots.png");
  margin: 4% auto;
  padding: 4%;
}
.logo {
  margin: 0 auto;
}
#roundedLoginCard {
  border-radius: 10px;
}
#roundedAlert {
  border-radius: 10px;
}
</style>
