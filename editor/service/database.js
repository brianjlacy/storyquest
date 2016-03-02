
exports = module.exports = Database;

function Database(config) {
    logger.info("Setting up database..");
    var cradle = require("cradle");
    this.dbConnection = new cradle.Connection(
        config.dbHost || "http://localhost",
        config.dbPort || 5984, {
            cache: false,
            raw: false,
            forceSave: true
        });
    this.db = this.dbConnection.database("storyquest");
}

Database.prototype.db = null;




