<template>
  <div class="mx-auto wrapperBox mt-5">
    <v-container class="px-3 py-0">
      <!-- Stack the columns on mobile by making one full-width and the other half-width -->
      <v-row>
        <v-col cols="8" class="pa-3">
          <v-form class="pa-0 ma-0">
            <v-text-field
              height="43"
              dense
              placeholder="Search for a specific PLC"
              outlined
              hide-details
            ></v-text-field>
          </v-form>
        </v-col>
        <v-col cols="4" class="pa-3">
          <v-btn outlined large>
            Search
            <v-icon right>mdi-magnify</v-icon>
          </v-btn>
          <v-btn outlined large class="float-right">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <v-divider></v-divider>
    <div class="pa-5">test</div>
  </div>
</template>

<script>
export default {
  name: "Sync_PlcSelect",
  data: () => ({}),
  methods: {}
};
</script>

<style>
.wrapperBox {
  background: #ffffff;
  border: 1px solid #b8c4cd;
  box-sizing: border-box;
  border-radius: 5px;
  width: 100%;
}
.searchHeight {
  height: 56px;
}
</style>
