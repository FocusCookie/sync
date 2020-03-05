<template>
  <div>
    <v-container id="loginWrapper">
      <v-row>
        <v-col></v-col>
        <v-col>
          <v-card width="398" id="roundedLoginCard" class="pa-6" raised>
            <v-img
              src="../assets/loginLogo.png"
              width="218"
              height="48"
              class="logo mt-3"
            ></v-img>
            <br />
            <v-card-title class="title"
              >👋 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quam
              consectetur volutpat amet porttitor.
            </v-card-title>
            <br />
            <v-card-text>
              <v-text-field
                ref="email"
                v-model="email"
                :rules="emailRules"
                label="email"
                placeholder="Enter your email"
                required
                outlined
                rounded
                single-line
              ></v-text-field>
              <v-text-field
                v-model="password"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="[passwordRules.required, passwordRules.min]"
                :type="showPassword ? 'text' : 'password'"
                name="input-10-1"
                label="password"
                placeholder="Enter your password"
                hint="At least 8 characters"
                required
                outlined
                rounded
                single-line
                @click:append="showPassword = !showPassword"
              ></v-text-field>
              <v-btn
                @click="handleSubmit"
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
  </div>
</template>
<script>
import { UserService } from "../services/user.service.js";

export default {
  name: "login",
  components: {},
  data: () => ({
    password: "",
    showPassword: false,
    email: "",
    loginError: null,
    passwordRules: {
      required: value => !!value || "Required.",
      min: v => v.length >= 8 || "Min 8 characters",
      emailMatch: () => "The email and password you entered don't match"
    },
    emailRules: [
      v => !!v || "E-mail is required",
      v => /.+@.+\..+/.test(v) || "E-mail must be valid"
    ]
  }),
  methods: {
    handleSubmit() {
      // Perform a simple validation that email and password have been typed in
      if (this.email !== "" && this.password !== "") {
        UserService.login(this.email, this.password)
          .then(() => {
            this.password = "";
            this.loginError = "";
            this.$router.push("/");
          })
          .catch(err => {
            console.log("Login Failed: ", err.message);
            this.loginError = err.message;
          });
      } else {
        this.loginError = "Please enter your credentials.";
      }
    }
  }
};
</script>

<style>
#loginWrapper {
  width: 926px;
  height: 600px;
  background-image: url("../assets/loginDots.png");
  margin: 2% auto;
  padding: 2%;
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
