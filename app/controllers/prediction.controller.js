const db = require('../models');
const Prediction = db.predictions;
const predictService = require('../services/prediction.service');
const moment = require('moment');

exports.getAll = () => {
	return Prediction.getAll();
};

exports.getByFixtureId = async (fixtureId) => {
	return await Prediction.findAll({
		where: { fixtureId: fixtureId },
		order: [['update', 'DESC']],
	});
};

exports.getRecentPredictionFixtures = async (count) => {
	return null;
};

exports.getUpcomingFixtures = async (hours) => {
	return null;
};

exports.updateLatest = async () => {
	try {
		const results = await predictService.getPredictionResult();

		const updateTime = moment();
		for (const result in results) {
		}

		return results.length;
	} catch (err) {
		logger.error(
			'failed to get latest prediction result with error ${err}, please check the service!!!'
		);
		return -1;
	}
};
