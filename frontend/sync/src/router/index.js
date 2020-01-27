import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Syncs from "../views/Syncs.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: Home
  },
  {
    path: "/syncs",
    name: "syncs",
    component: Syncs
  },
  {
    path: "/things",
    name: "things",
    component: Home
  },
  {
    path: "/plcs",
    name: "plcs",
    component: Home
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
