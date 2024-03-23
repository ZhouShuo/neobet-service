const db = require('../models');
const Op = db.Sequelize.Op;
const logger = require('../config/logger.config')('fixture.controller');

exports.getByFixtureId = async (fixtureId) => {
	return await db.fixtures.findByPk(fixtureId);
};

exports.getUpcomingFixturesByHours = async (hours) => {
	let endTime = new Date();
	endTime.setTime(endTime.getTime() + hours * 60 * 60 * 1000);
	return await db.fixtures.findAll({
		where: {
			statusCode: 'NS',
			date: {
				[Op.between]: [new Date(), endTime],
			},
		},
		order: [['date', 'ASC']],
	});
};

exports.getLeagueByFixtureId = async (fixtureId) => {
	const fixture = await db.fixtures.findByPk(fixtureId);
	const round = await db.rounds.findByPk(fixture.roundId);
	const season = await db.seasons.findByPk(round.seasonId);
	const league = await db.leagues.findByPk(season.leagueId);

	return league;
};

exports.getTeamByFixtureId = async (fixtureId, type) => {
	return await db.fixtureTeams.findOne({
		where: { fixtureId: fixtureId, type: type },
	});
};
