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
// setup a 15 min schedule job to update recent odds and fixtures
exports.scheduledQuarterTask = () =>
	schedule.scheduleJob('*/15 * * * *', async () => {
		let recentDates = [];
		const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
		const today = moment().format('YYYY-MM-DD');
		const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');

		updateFixtureQuarterly(QUARTERLY_UPDATE_FIXTURE_YESTERDAY, yesterday);
		updateFixtureQuarterly(QUARTERLY_UPDATE_FIXTURE_TODAY, today);
		//updateFixtureQuarterly(QUARTERLY_UPDATE_FIXTURE_TOMORROW, tomorrow);
		updateOddsQuarterly(QUARTERLY_UPDATE_ODD_YESTERDAY, yesterday);
		updateOddsQuarterly(QUARTERLY_UPDATE_ODD_TODAY, today);
		//updateOddsQuarterly(QUARTERLY_UPDATE_ODD_TOMORROW, tomorrow);
	});

exports.scheduledMinuesTask = () =>
	schedule.scheduleJob('*/10 * * * *', async () => {
		const hours = 1;

		updateOddsUpcoming(TENMINUES_UPDATE_ODD_NEXT_HOUR, hours);
	});

exports.scheduledHourlyTask = () =>
	schedule.scheduleJob('0 */2 * * *', async () => {
		let recentDates = [];
		const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');

		updateFixtureQuarterly(HOURLY_UPDATE_FIXTURE_TOMORROW, tomorrow);
		updateOddsQuarterly(HOURLY_UPDATE_ODD_TOMORROW, tomorrow);
	});

const updateFixtureQuarterly = async (type, date) => {
	logger.info(`======= ${type} - ${date} =======`);
	const schedulerLog = await db.schedulerLogs.create({
		type: type,
		start: moment(),
	});
	await schedulerLog.save();
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
};

const updateOddsQuarterly = async (type, date) => {
	logger.info(`======= ${type} - ${date} =======`);
	const schedulerLog = await db.schedulerLogs.create({
		type: type,
		start: moment(),
	});
	await schedulerLog.save();
	try {
		const updatedOdds = await tasks.taskOddsUpToDate(date);
		logger.info(`${updatedOdds.length} odds updated`);
		schedulerLog.message = `${type} - ${date} - ${updatedOdds.length} odds updated`;
		schedulerLog.success = true;
	} catch (err) {
		logger.error(`failed update the odds on ${type} - ${date} - error: ${err}`);
		schedulerLog.message = `failed update the odds on ${type} - ${date} - error: ${err}`;
		schedulerLog.success = false;
	}
	schedulerLog.end = moment();
	await schedulerLog.save();
};

const updateOddsUpcoming = async (type, hours) => {
	logger.info(`======= ${type} - ${hours} =======`);
	const schedulerLog = await db.schedulerLogs.create({
		type: type,
		start: moment(),
	});
	await schedulerLog.save();
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
};
