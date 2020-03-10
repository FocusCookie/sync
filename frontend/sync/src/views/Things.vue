<template>
  <div>
    <div class="actionBar mt-5 mb-5">
      <v-btn
        outlined
        @click="enableEditthings"
        class="ml-5"
        large
        v-if="things"
      >
        Edit
        <v-icon right dark>mdi-pencil</v-icon>
      </v-btn>
      <v-btn
        color="primary"
        class="ml-5"
        to="things/create"
        large
        v-if="things"
      >
        Create a Thing
        <v-icon right dark>mdi-plus-box</v-icon>
      </v-btn>
    </div>
    <Message
      :icon="noSyncsMessage.icon"
      :headline="noSyncsMessage.headline"
      :message="noSyncsMessage.message"
      :button="noSyncsMessage.button"
      @createThingEvent="createThing"
      v-if="!things"
    />
    <v-container v-if="things">
      <v-item-group>
        <v-container>
          <v-row>
            <v-col v-for="(thing, i) in things" :key="i" cols="6">
              <v-item>
                <v-card elevation="0">
                  <v-card-title class="headline">
                    {{ thing.thingName }}
                    <v-spacer></v-spacer>
                  </v-card-title>

                  <v-card-subtitle
                    v-text="thing.host"
                    class="pb-1"
                  ></v-card-subtitle>
                  <v-card-text class="pb-2">
                    <v-container>
                      <v-row>
                        <v-col cols="12">
                          <v-text-field
                            label="Certificate"
                            :value="thing.certificate"
                            prepend-inner-icon="mdi-certificate-outline"
                            outlined
                            disabled
                            dense
                            hide-details
                          >
                          </v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">
                          <v-text-field
                            label="Private Key"
                            :value="thing.privateKey"
                            prepend-inner-icon="mdi-certificate-outline"
                            outlined
                            disabled
                            dense
                            hide-details
                          >
                          </v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">
                          <v-text-field
                            label="CA Chain"
                            :value="thing.caChain"
                            prepend-inner-icon="mdi-certificate-outline"
                            outlined
                            disabled
                            dense
                            hide-details
                          >
                          </v-text-field>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>

                  <v-card-actions class="pa-4" v-if="editthings">
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      v-if="editthings"
                      @click="deleteThing(thing._id)"
                    >
                      <v-icon color="grey">mdi-trash-can-outline</v-icon>
                    </v-btn>
                    <v-btn outlined v-if="false">
                      more
                      <v-icon right dark>mdi-dots-horizontal</v-icon>
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
// TODO: Add error handling for deleting a thing
import Message from "../components/Message";
import { ApiService } from "../services/api.service";

export default {
  name: "things",
  data: () => ({
    things: false,
    editthings: false,
    noSyncsMessage: {
      headline: "No Thing found.",
      message: "Please create your first Thing.",
      icon: "mdi-emoticon-confused-outline",
      button: {
        text: "Create a Thing",
        event: {
          name: "createThingEvent",
          data: "createThingBtnClicked"
        }
      }
    }
  }),
  created() {
    this.getThings();
  },
  components: {
    Message
  },
  methods: {
    getThings() {
      ApiService.get("aws/things")
        .then(res => {
          if (res.data.length > 0) {
            res.data.forEach(thing => {
              thing.caChain = thing.caChain.split("_")[2];
              thing.certificate = thing.certificate.split("_")[2];
              thing.privateKey = thing.privateKey.split("_")[2];
            });

            this.things = res.data;
            console.log(this.things);
          }
        })
        .catch(err => console.log(err));
    },
    createThing() {
      this.$router.push("things/create");
    },
    enableEditthings() {
      this.editthings = !this.editthings;
    },
    deleteThing(id) {
      ApiService.delete("aws/things/" + id)
        .then(() => {
          this.things = null;
          this.getThings();
        })
        .catch(err => alert(err.response.data));
    }
  }
};
</script>
<style>
.v-card.v-sheet.theme--light {
  background: #ffffff;
  border: 1px solid #b8c4cd;
  box-sizing: border-box;
  border-radius: 5px;
}
</style>
