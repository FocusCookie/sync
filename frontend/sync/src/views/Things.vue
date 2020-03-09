<template>
  <div>
    <div class="actionBar mt-5 mb-5">
      <v-btn outlined @click="enableEditthings" class="ml-5" large v-if="things">
        Edit
        <v-icon right dark>mdi-pencil</v-icon>
      </v-btn>
      <v-btn color="primary" class="ml-5" to="things/create" large v-if="things">
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
                    {{ thing.name }}
                    <v-spacer></v-spacer>

                    <v-chip color="primary" outlined label dark>
                      <v-icon left>mdi-sitemap</v-icon>
                      {{ thingVarCount(thing.files) }}
                    </v-chip>
                  </v-card-title>

                  <v-card-subtitle v-text="thing.ip"></v-card-subtitle>

                  <v-card-actions class="pa-4">
                    <v-spacer></v-spacer>
                    <v-btn text v-if="editthings" @click="deleteThing(thing._id)">
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
    this.getthings();
  },
  components: {
    Message
  },
  methods: {
    getthings() {
      ApiService.get("things")
        .then(res => {
          if (res.data.length > 0) this.things = res.data;
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
      ApiService.delete("things/" + id)
        .then(() => {
          this.getthings();
        })
        .catch(err => alert(err.response.data));
    },
    thingVarCount(files) {
      let total = 0;
      console.log(files);
      files.forEach(file => {
        total += file.variables.length;
      });
      return total;
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
