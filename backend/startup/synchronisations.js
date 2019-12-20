const debug = require("debug")("app:startupSynchronisations");
const SyncModel = require("../models/synchronisations");

module.exports = async function() {
  SyncModel.Synchronisation.find({})
    .then(syncs => {
      syncs.forEach(sync => {
        if (sync.status) {
          sync.status = false; // need to be set to false because in the creation is a check of truethiness
          SyncModel.createIntervalInstance(sync);
          debug("Created Sync Intervall instance for syncID: " + sync._id);
        }
      });
    })
    .catch(err => debug(err));
};
