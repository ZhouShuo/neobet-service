const db = require('../models');
const logger = require('../config/logger.config')('scheduler');
const tasks = require('../tasks');
const moment = require('moment');
const schedule = require('node-schedule');

const QUARTERLY_UPDATE_FIXTURE_YESTERDAY = 'Quarterly update fixture yesterday';
const QUARTERLY_UPDATE_FIXTURE_TODAY = 'Quarterly update fixture tody';
const QUARTERLY_UPDATE_FIXTURE_TOMORROW = 'Quarterly update fixture tomorrow';
const QUARTERLY_UPDATE_ODD_YESTERDAY = 'Quarterly update odd yesterday';
const QUARTERLY_UPDATE_ODD_TODAY = 'Quarterly update odd today';
const QUARTERLY_UPDATE_ODD_TOMORROW = 'Quarterly update odd tomorrow';
const HOURLY_UPDATE_FIXTURE_TOMORROW = 'Hourly update fixture tomorrow';
const HOURLY_UPDATE_ODD_TOMORROW = 'Hourly update odd tomorrow';
const TENMINUES_UPDATE_ODD_NEXT_HOUR = '10 minues update odd for next hour';
const DAILY_UPDATE_LEAGUES = 'daily update leagues';
const DAILY_UPDATE_TEAMS = 'daily update teams';
const FIVEMINUES_UPDATE_PREDICTION = '5 minues update predictions';
const SIXMINUES_UPDATE_PREDICTION = '6 minues update predictions';
// setup a 15 min schedule job to update recent odds and fixtures
exports.scheduledHalfHourTask = () =>
	schedule.scheduleJob('*/30 * * * *', async () => {
		const today = moment().format('YYYY-MM-DD');
		updateFixtureQuarterly(QUARTERLY_UPDATE_FIXTURE_TODAY, today);
		updateOddsQuarterly(QUARTERLY_UPDATE_ODD_TODAY, today);
	});

exports.scheduledMinuesTask = () =>
	schedule.scheduleJob('*/10 * * * *', async () => {
		const hours = 1;

		updateOddsUpcoming(TENMINUES_UPDATE_ODD_NEXT_HOUR, hours);
	});

exports.scheduledHourlyTask = () => {
	schedule.scheduleJob('15 */2 * * *', async () => {
		const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');

		updateFixtureQuarterly(HOURLY_UPDATE_FIXTURE_TOMORROW, tomorrow);
		updateOddsQuarterly(HOURLY_UPDATE_ODD_TOMORROW, tomorrow);
	});

	schedule.scheduleJob('45 */2 * * *', async () => {
		const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');

		updateFixtureQuarterly(QUARTERLY_UPDATE_FIXTURE_YESTERDAY, yesterday);
		updateOddsQuarterly(QUARTERLY_UPDATE_ODD_YESTERDAY, yesterday);
	});
};

exports.scheduledDailyTask = () =>
	schedule.scheduleJob('45 4 * * *', async () => {
		updateLeagues(DAILY_UPDATE_LEAGUES);
		updateTeams(DAILY_UPDATE_TEAMS);
	});

exports.scheduledSixMinuesTask = () =>
	schedule.scheduleJob('*/6 * * * *', async () => {
		const predictionsServices = await enabledPredictionServices();
		for (const predictionService of predictionsServices) {
			updatePrediction(SIXMINUES_UPDATE_PREDICTION, predictionService);
		}
	});

const updateFixtureQuarterly = async (type, date) => {
	logger.info(`======= ${type} - ${date} =======`);
	const scheduleRunning = await existingSchedule(type);
	if (!scheduleRunning) {
		const schedulerLog = await db.schedulerLogs.create({
			type: type,
			start: moment(),
		});
		try {
			const updatedFixtures = await tasks.taskFixturesUpToDate(date);
			logger.info(`${updatedFixtures.length} fixtures updated`);
			schedulerLog.message = `${type} - ${date} - ${updatedFixtures.length} fixtures updated`;
			schedulerLog.success = true;
		} catch (err) {
			logger.error(
				`failed update the fixture on ${type} - ${date} - error: ${err}`
			);
			schedulerLog.message = `failed update the fixture on ${type} - ${date} - error: ${err}`;
			schedulerLog.success = false;
		}

		schedulerLog.end = moment();
		await schedulerLog.save();
	}
};

const updateOddsQuarterly = async (type, date) => {
	logger.info(`======= ${type} - ${date} =======`);
	const scheduleRunning = await existingSchedule(type);
	if (!scheduleRunning) {
		const schedulerLog = await db.schedulerLogs.create({
			type: type,
			start: moment(),
		});
		try {
			const updatedOdds = await tasks.taskOddsUpToDate(date);
			logger.info(`${updatedOdds.length} odds updated`);
			schedulerLog.message = `${type} - ${date} - ${updatedOdds.length} odds updated`;
			schedulerLog.success = true;
		} catch (err) {
			logger.error(
				`failed update the odds on ${type} - ${date} - error: ${err}`
			);
			schedulerLog.message = `failed update the odds on ${type} - ${date} - error: ${err}`;
			schedulerLog.success = false;
		}
		schedulerLog.end = moment();
		await schedulerLog.save();
	}
};

const updateOddsUpcoming = async (type, hours) => {
	logger.info(`======= ${type} - ${hours} =======`);
	const scheduleRunning = await existingSchedule(type);
	if (!scheduleRunning) {
		const schedulerLog = await db.schedulerLogs.create({
			type: type,
			start: moment(),
		});
		try {
			const updatedOdds = await tasks.taskOddsUpdateRecentHourly(hours);
			logger.info(`${updatedOdds.length} odds updated`);
			schedulerLog.message = `${type} - ${hours} - ${updatedOdds.length} odds updated`;
			schedulerLog.success = true;
		} catch (err) {
			logger.error(
				`failed update the odds on ${type} - ${hours} - error: ${err}`
			);
			schedulerLog.message = `failed update the odds on ${type} - ${hours} - error: ${err}`;
			schedulerLog.success = false;
		}
		schedulerLog.end = moment();
		await schedulerLog.save();
	}
};

const updateLeagues = async (type) => {
	logger.info(`======= ${type} =======`);
	const scheduleRunning = await existingSchedule(type);
	if (!scheduleRunning) {
		const schedulerLog = await db.schedulerLogs.create({
			type: type,
			start: moment(),
		});
		try {
			const updateRounds = await tasks.taskLeaguesUpdate();
			logger.info(`${updateRounds.length} rounds updated`);
			schedulerLog.message = `${type} - ${updateRounds.length} rounds updated`;
			schedulerLog.success = true;
		} catch (err) {
			logger.error(`failed update the leagues on ${type} - error: ${err}`);
			schedulerLog.message = `failed update the leagues on ${type} - error: ${err}`;
			schedulerLog.success = false;
		}
		schedulerLog.end = moment();
		await schedulerLog.save();
	}
};

const updateTeams = async (type) => {
	logger.info(`======= ${type} =======`);
	const scheduleRunning = await existingSchedule(type);
	if (!scheduleRunning) {
		const schedulerLog = await db.schedulerLogs.create({
			type: type,
			start: moment(),
		});
		try {
			const updateTeams = await tasks.taskTeamsUpdate();
			logger.info(`${updateTeams.length} teams updated`);
			schedulerLog.message = `${type} - ${updateTeams.length} teams updated`;
			schedulerLog.success = true;
		} catch (err) {
			logger.error(`failed update the teams on ${type} - error: ${err}`);
			schedulerLog.message = `failed update the teams on ${type} - error: ${err}`;
			schedulerLog.success = false;
		}
		schedulerLog.end = moment();
		await schedulerLog.save();
	}
};

const updatePrediction = async (type, predictionService) => {
	const fullType = `${type}-${predictionService.version}`;
	logger.info(`======= ${fullType} =======`);
	const scheduleRunning = await existingSchedule(fullType);
	if (!scheduleRunning) {
		const schedulerLog = await db.schedulerLogs.create({
			type: fullType,
			start: new Date(),
		});
		try {
			const updatePredictions = await tasks.taskPredictionUpdate(
				predictionService.serviceUrl
			);
			logger.info(`${updatePredictions.length} fixtures updated`);
			schedulerLog.message = `${fullType} - ${updatePredictions.length} fixtures updated`;
			schedulerLog.success = true;
		} catch (err) {
			logger.error(
				`failed update the predictions on ${fullType} - error: ${err}`
			);
			schedulerLog.message = `failed update the predictions on ${fullType} - error: ${err}`;
			schedulerLog.success = false;
		}
		schedulerLog.end = new Date();
		await schedulerLog.save();
	}
};

const existingSchedule = async (type) => {
	const existingSchedulerLogs = await db.schedulerLogs.findAll({
		where: {
			type: type,
			end: null,
		},
	});
	if (existingSchedulerLogs != null && existingSchedulerLogs.length > 0) {
		logger.info(`==== ${type} already has scheduler running`);
		return true;
	} else {
		logger.info(`==== ${type} scheduler is not running`);
		return false;
	}
};

const enabledPredictionServices = async () => {
	return await db.predictionsService.findAll({ where: { enabled: true } });
};
