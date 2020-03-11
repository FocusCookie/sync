<template>
  <div>
    <div class="actionBar mt-5 mb-5">
      <v-btn outlined @click="enableEditPlcs" class="ml-5" large v-if="plcs">
        Edit
        <v-icon right dark>mdi-pencil</v-icon>
      </v-btn>
      <v-btn color="primary" class="ml-5" to="plcs/create" large v-if="plcs">
        Add a PLC
        <v-icon right dark>mdi-plus-box</v-icon>
      </v-btn>
    </div>
    <Message
      :icon="noSyncsMessage.icon"
      :headline="noSyncsMessage.headline"
      :message="noSyncsMessage.message"
      :button="noSyncsMessage.button"
      @createPlcEvent="createPlc"
      v-if="!plcs"
    />
    <v-container v-if="plcs">
      <v-item-group>
        <v-container>
          <v-row>
            <v-col v-for="(plc, i) in plcs" :key="i" cols="12">
              <v-item>
                <v-card elevation="0">
                  <v-card-title class="headline">
                    {{ plc.name }}
                    <v-spacer></v-spacer>

                    <v-chip
                      color="primary"
                      outlined
                      label
                      dark
                      @click="plc.showVisuVars = !plc.showVisuVars"
                    >
                      <v-icon left>mdi-sitemap</v-icon>
                      {{ plcVarCount(plc.files) }} Variables
                    </v-chip>
                  </v-card-title>

                  <v-card-subtitle v-text="plc.ip"></v-card-subtitle>

                  <v-card-text v-if="plc.showVisuVars">
                    <v-treeview open-on-click :items="plc.files">
                      <template v-slot:prepend="{ item, open }">
                        <v-icon v-if="!item.datatype">
                          {{ open ? "mdi-folder-open" : "mdi-folder" }}
                        </v-icon>
                        <v-chip
                          v-if="item.datatype"
                          class="ma-2 datatypes"
                          color="primary"
                          outlined
                          label
                          >{{ item.datatype }}
                        </v-chip>
                      </template>
                    </v-treeview>
                  </v-card-text>

                  <v-card-actions v-if="editPlcs" class="pa-4">
                    <v-spacer></v-spacer>
                    <v-btn text @click="deletePlc(plc._id)">
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
// TODO: Add error handling for deleting a plc
import Message from "../components/Message";
import { ApiService } from "../services/api.service";

export default {
  name: "plcs",
  data: () => ({
    plcs: false,
    editPlcs: false,
    noSyncsMessage: {
      headline: "No PLC found.",
      message: "Please add a PLC.",
      icon: "mdi-emoticon-confused-outline",
      button: {
        text: "Add a PLC",
        event: {
          name: "createPlcEvent",
          data: "createPlcBtnClicked"
        }
      }
    }
  }),
  created() {
    this.getPlcs();
  },
  components: {
    Message
  },
  methods: {
    getPlcs() {
      ApiService.get("wago")
        .then(res => {
          if (res.data.length > 0) {
            this.plcs = res.data.map(plc => {
              return {
                name: plc.name,
                showVisuVars: false,
                _id: plc._id,
                ip: plc.ip,
                mac: plc.mac,
                articleNumber: plc.articleNumber,
                files: plc.files.map((file, index) => {
                  return {
                    id: index,
                    name: file.name,
                    children: file.variables.map((variable, varIndex) => {
                      return {
                        id: varIndex,
                        name: variable.prgName + "." + variable.varName,
                        datatype: variable.datatype
                      };
                    })
                  };
                })
              };
            });
          }
        })
        .catch(err => console.log(err));
    },
    createPlc() {
      this.$router.push("plcs/create");
    },
    enableEditPlcs() {
      this.editPlcs = !this.editPlcs;
    },
    deletePlc(id) {
      ApiService.delete("wago/" + id)
        .then(() => {
          this.plcs = false;
          this.getPlcs();
        })
        .catch(err => alert(err.response.data));
    },
    plcVarCount(files) {
      let total = 0;
      files.forEach(file => {
        total += file.children.length;
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
