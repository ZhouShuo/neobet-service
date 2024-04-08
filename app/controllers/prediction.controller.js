const db = require('../models');
const Op = db.Sequelize.Op;
const predictService = require('../services/prediction.service');
const logger = require('../config/logger.config')('prediction.controller');
const moment = require('moment');

exports.getAll = () => {
	return db.predictions.findAll();
};

exports.getByFixtureId = async (fixtureId) => {
	return await db.predictions.findAll({
		where: { fixtureId: fixtureId },
		order: [['update', 'DESC']],
	});
};

exports.getNewestByFixtureId = async (fixtureId, version) => {
	return await db.predictions.findOne({
		where: { fixtureId: fixtureId, version: version },
		order: [['update', 'DESC']],
	});
};

exports.getRecentPredictionFixtures = async (count) => {
	const fixtures = await db.fixtures.findAll({
		where: {
			statusCode: 'NS',
			date: {
				[Op.gte]: new Date(),
			},
		},
		order: [['date', 'ASC']],
		limit: count,
	});

	let returnPredictions = [];
	for (const fixture of fixtures) {
		logger.info(`fixture: ${fixture.date} - ${fixture.id}`);

		const prediction = await db.predictions.findOne({
			where: { fixtureId: fixture.id },
			order: [['update', 'DESC']],
		});

		returnPredictions.push(prediction);
	}

	return returnPredictions;
};

exports.getUpcomingFixtures = async (hours) => {
	return null;
};

exports.updateLatest = async () => {
	try {
		const defaultVersion = 'v1.0';
		const results = await predictService.getPredictionResult();

		const updateTime = moment();
		var newPredictions = [];
		for (const result of results) {
			logger.info(
				`creating prediction ${updateTime.format('YYYY-MM-DD HH:mm:SS')} - ${
					result.fixtureId
				} - ${result.Country} - ${result.League} - ${result.hname} - ${
					result.aname
				}`
			);

			const newPrediction = await db.predictions.create({
				fixtureId: result.fixtureId,
				version: defaultVersion,
				update: updateTime,
				rateHome: result.rateH,
				scoreHome: result.scoreH,
				rateDraw: result.rateD,
				scoreDraw: result.scoreD,
				rateAway: result.rateA,
				scoreAway: result.scoreA,
				rateToWin: result.RtW,
				rateToLost: result.RtL,
				oddMedianHome: result.odd50Home,
				oddMedianDraw: result.odd50Draw,
				oddMedianAway: result.odd50Away,
				isReverse: !result.isH,
				betHome: result.DoH.length > 0,
				betDraw: result.DoD.length > 0,
				betAway: result.DoA.length > 0,
				betHomeWinGreater: result.DoH_C.length > 0,
			});

			newPredictions.push(newPrediction);
		}

		return newPredictions.length;
	} catch (err) {
		logger.error(
			`failed to get latest prediction result with error ${err}, please check the service!!!`
		);
		return -1;
	}
};
