const dbConfig = require('../config/db.config.js');
const logger = require('../config/logger.config')('sequelize');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
	host: dbConfig.HOST,
	dialect: dbConfig.dialect,
	operatorsAliases: false,
	user: dbConfig.USER,
	password: dbConfig.PASSWORD,
	pool: {
		max: dbConfig.pool.max,
		min: dbConfig.pool.min,
		acquire: dbConfig.pool.acquire,
		idle: dbConfig.pool.idle,
	},
	logQueryParameters: true,
	//logging: e => logger.info(e),
	logging: false,

	dialectOptions: {
		ssl: {
			require: true,
			rejectUnauthorized: false, // <-- Add this line
		},
		useUTC: true, // for reading from database
	},
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// timezone table
db.timezones = require('./timezone.model.js')(sequelize, Sequelize);
// country table
db.countries = require('./country.model.js')(sequelize, Sequelize);
// league table
db.leagues = require('./league.model.js')(sequelize, Sequelize);
db.countries.hasMany(db.leagues);
db.leagues.belongsTo(db.countries);
// season table
db.seasons = require('./season.model.js')(sequelize, Sequelize);
db.leagues.hasMany(db.seasons);
db.seasons.belongsTo(db.leagues);
// team table
db.teams = require('./team.model.js')(sequelize, Sequelize);
db.countries.hasMany(db.teams);
db.teams.belongsTo(db.countries);
//db.seasons.hasMany(db.teams);
//db.teams.belongsTo(db.seasons);
// venues table
db.venues = require('./venue.model.js')(sequelize, Sequelize);
db.countries.hasMany(db.venues);
db.venues.belongsTo(db.countries);
// rounds table
db.rounds = require('./round.model.js')(sequelize, Sequelize);
db.seasons.hasMany(db.rounds);
db.rounds.belongsTo(db.seasons);
// fixtures table
db.fixtures = require('./fixture.model.js')(sequelize, Sequelize);
//db.venues.hasMany(db.fixtures);
//db.fixtures.belongsTo(db.venues);
db.rounds.hasMany(db.fixtures);
db.fixtures.belongsTo(db.rounds);
// fixture_teams table
db.fixtureTeams = require('./fixture_team.model.js')(sequelize, Sequelize);
db.teams.hasMany(db.fixtureTeams);
db.fixtureTeams.belongsTo(db.teams);
db.fixtures.hasMany(db.fixtureTeams);
db.fixtureTeams.belongsTo(db.fixtures);
// fixture_score table
db.fixtureScores = require('./fixture_score.model.js')(sequelize, Sequelize);
db.fixtures.hasMany(db.fixtureScores);
db.fixtureScores.belongsTo(db.fixtures);
// bet table
db.bets = require('./bet.model.js')(sequelize, Sequelize);
// bookmaker table
db.bookmakers = require('./bookmaker.model.js')(sequelize, Sequelize);
// odd table
db.odds = require('./odd.model.js')(sequelize, Sequelize);
db.bets.hasMany(db.odds);
db.odds.belongsTo(db.bets);
db.bookmakers.hasMany(db.bookmakers);
db.odds.belongsTo(db.bookmakers);
db.fixtures.hasMany(db.odds);
db.odds.belongsTo(db.fixtures);
// scheduler table
db.schedulerLogs = require('./scheduler_logs.model.js')(sequelize, Sequelize);
// prediction table
db.predictions = require('./prediction.model.js')(sequelize, Sequelize);
db.fixtures.hasMany(db.predictions);
db.predictions.belongsTo(db.fixtures);

module.exports = db;
