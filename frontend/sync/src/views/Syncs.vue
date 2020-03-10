<template>
  <div>
    <div class="actionBar mt-5 mb-5">
      <v-btn outlined @click="enableEditSyncs" class="ml-5" large v-if="syncs">
        Edit
        <v-icon right dark>mdi-pencil</v-icon>
      </v-btn>
      <v-btn color="primary" class="ml-5" to="syncs/create" large v-if="syncs">
        Create a Sync
        <v-icon right dark>mdi-plus-box</v-icon>
      </v-btn>
    </div>
    <Message
      v-if="!syncs"
      :icon="noSyncsMessage.icon"
      :headline="noSyncsMessage.headline"
      :message="noSyncsMessage.message"
      :button="noSyncsMessage.button"
      @createSyncEvent="createSync"
    />

    <v-container v-if="syncs">
      <v-item-group>
        <v-container>
          <v-row>
            <v-col v-for="(sync, i) in syncs" :key="sync._id" cols="6">
              <v-item>
                <v-card
                  active-class="test"
                  flat
                  :loading="sync.status ? 'success' : false"
                >
                  <v-card-text>
                    <v-list-item two-line :key="i">
                      <v-list-item-avatar>
                        <v-icon>mdi-cloud</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title>{{ sync.thing }}</v-list-item-title>
                        <v-list-item-subtitle>{{
                          sync.thingHost
                        }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item two-line>
                      <v-list-item-avatar>
                        <v-icon>mdi-lan</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title>{{ sync.plc }}</v-list-item-title>
                        <v-list-item-subtitle>{{
                          sync.plcIp
                        }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-avatar>
                        <v-icon>mdi-refresh</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title
                          >{{ sync.interval }} ms</v-list-item-title
                        >
                      </v-list-item-content>
                    </v-list-item>
                  </v-card-text>

                  <v-card-actions class="pa-4" v-if="editSyncs">
                    <v-spacer></v-spacer>
                    <v-btn @click="deleteSync(sync._id)" text v-if="editSyncs">
                      <v-icon color="grey">mdi-trash-can-outline</v-icon>
                    </v-btn>
                    <v-btn
                      color="sync.status ? 'success' : 'error'"
                      outlined
                      @click="activateSync(sync)"
                    >
                      <span>{{
                        sync.status ? "Deactivate Sync" : "Activate Sync"
                      }}</span>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-item>
            </v-col>
          </v-row>
        </v-container>
      </v-item-group>
    </v-container>
  </div>
</template>

<script>
import Message from "../components/Message";
import { ApiService } from "../services/api.service";

export default {
  name: "syncs",
  data: () => ({
    viewCreateSync: false,
    noSyncsMessage: {
      headline: "No Sync found.",
      message: "Please create your first sync.",
      icon: "mdi-emoticon-confused-outline",
      button: {
        text: "Create Sync",
        event: {
          name: "createSyncEvent",
          data: "createSyncBtnClicked"
        }
      }
    },
    syncs: null,
    editSyncs: false
  }),
  components: {
    Message
  },
  created() {
    this.getSyncs();
  },
  methods: {
    createSync() {
      this.$router.push({ path: "/syncs/create" });
    },
    getSyncs() {
      this.syncs = null;
      ApiService.get("synchronisations")
        .then(res => {
          let result = [];
          if (res.data.length > 0) {
            //get all the name of the plcs and things
            res.data.forEach(sync => {
              let tempSync = sync;
              ApiService.get("wago/" + tempSync.plcId).then(plc => {
                tempSync.plc = plc.data.name;
                tempSync.plcIp = plc.data.ip;
                ApiService.get("aws/things/" + tempSync.cloudOptionsId).then(
                  thing => {
                    tempSync.thing = thing.data.thingName;
                    tempSync.thingHost = thing.data.host;
                    result.push(tempSync);
                  }
                );
              });
            });

            this.syncs = result;
          }
        })
        .catch(err => console.log(err));
    },
    enableEditSyncs() {
      this.editSyncs = !this.editSyncs;
    },
    deleteSync(id) {
      ApiService.delete("synchronisations/" + id)
        .then(() => {
          this.getSyncs();
        })
        .catch(err => console.log(err.response.data));
    },
    activateSync(sync) {
      ApiService.post(`synchronisations/${sync._id}/status`, {
        status: !sync.status
      })
        .then(() => (sync.status = !sync.status))
        .catch(err => console.log(err.response.data));
    }
  }
};
</script>
<style>
.test {
  border: 1px solid green;
  background: red;
}
</style>
