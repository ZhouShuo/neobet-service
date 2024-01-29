const db = require('../models');

const Op = db.Sequelize.Op;
const moment = require('moment');

exports.getSchedulerLogsByDate = async (dateString) => {
	const date = moment(dateString);
	const nextDate = moment(dateString).add(1, 'days');

	const schedulerLogs = await db.schedulerLogs.findAll({
		where: {
			start: {
				[Op.between]: [date, nextDate],
			},
		},
		order: [['start', 'DESC']],
	});

	return schedulerLogs;
};

exports.getSchedulerLogsRecent = async (count) => {
	const schedulerLogs = await db.schedulerLogs.findAll({
		order: [['start', 'DESC']],
		limit: count,
	});

	return schedulerLogs;
};

exports.getWorkingSchedulerLogs = async () => {
	const schedulerLogs = await db.schedulerLogs.findAll({
		where: { end: null },
		order: [['start', 'DESC']],
	});

	return schedulerLogs;
};
exports.getFailedSchedulerLogs = async () => {
	const schedulerLogs = await db.schedulerLogs.findAll({
		where: { success: false },
		order: [['start', 'DESC']],
	});

	return schedulerLogs;
};
