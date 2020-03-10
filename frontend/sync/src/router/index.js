import Vue from "vue";
import Router from "vue-router";
import Home from "@/views/Home.vue";
import Syncs from "@/views/Syncs.vue";
import Plcs from "@/views/Plcs.vue";
import Things from "@/views/Things.vue";
import Login from "@/views/Login.vue";
import CreatePlc from "@/components/CreatePlc.vue";
import CreateThing from "@/components/CreateThing.vue";
import CreateSync from "@/components/CreateSync.vue";
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
      path: "/syncs/create",
      name: "CreateSync",
      component: CreateSync
    },
    {
      path: "/things",
      name: "things",
      component: Things
    },
    {
      path: "/things/create",
      name: "CreateThing",
      component: CreateThing
    },
    {
      path: "/plcs",
      name: "plcs",
      component: Plcs
    },
    {
      path: "/plcs/create",
      name: "CreatePlc",
      component: CreatePlc
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
