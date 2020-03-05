import Vue from "vue";
import Router from "vue-router";
import Home from "@/views/Home.vue";
import Syncs from "@/views/Syncs.vue";
import Plcs from "@/views/Plcs.vue";
import Login from "@/views/Login.vue";
import { TokenService } from "../services/storage.service";

Vue.use(Router);

const router = new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: {
        public: true, // Allow access to even if not logged in
        onlyWhenLoggedOut: true
      }
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
      component: Plcs
    }
  ]
});

router.beforeEach((to, from, next) => {
  const isPublic = to.matched.some(record => record.meta.public);
  const onlyWhenLoggedOut = to.matched.some(
    record => record.meta.onlyWhenLoggedOut
  );
  const loggedIn = !!TokenService.getToken();

  if (!isPublic && !loggedIn) {
    return next({
      path: "/login",
      query: { redirect: to.fullPath } // Store the full path to redirect the user to after login
    });
  }

  // Do not allow user to visit login page or register page if they are logged in
  if (loggedIn && onlyWhenLoggedOut) {
    return next("/");
  }

  next();
});

export default router;
