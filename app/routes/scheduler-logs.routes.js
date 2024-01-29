module.exports = (app) => {
	const schedulerLogsController = require('../controllers/scheduler-logs.controller.js');

	var schedulerLogsRouter = require('express').Router();

	schedulerLogsRouter.get('/recent/:count', async (req, res) => {
		const count = req.params.count;

		const result = await schedulerLogsController.getSchedulerLogsRecent(count);

		return res.status(200).send(result);
	});

	schedulerLogsRouter.get('/by-date/:date', async (req, res) => {
		const date = req.params.date;
		const result = await schedulerLogsController.getSchedulerLogsByDate(date);

		return res.status(200).send(result);
	});

	schedulerLogsRouter.get('/working', async (req, res) => {
		const result = await schedulerLogsController.getWorkingSchedulerLogs();

		return res.status(200).send(result);
	});

	schedulerLogsRouter.get('/failed', async (req, res) => {
		const result = await schedulerLogsController.getFailedSchedulerLogs();

		return res.status(200).send(result);
	});

	app.use('/api/scheduler-logs', schedulerLogsRouter);
};
