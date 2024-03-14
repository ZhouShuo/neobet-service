module.exports = (app) => {
	const predictionController = require('../controllers/prediction.controller.js');

	var predictionRouter = require('express').Router();

	predictionRouter.get('/', async (req, res) => {
		const result = await predictionController.getAll();

		return res.status(200).send(result);
	});

	// Retrieve a single fixture prediction with id and all the history
	predictionRouter.get('/:id', async (req, res) => {
		const fixtureId = req.params.id;

		const result = await predictionController.getByFixtureId(fixtureId);

		return res.status(200).send(result);
	});

	// Retrieve upcoming fixture prediction by limit count
	predictionRouter.get('/upcoming/:count', async (req, res) => {
		const count = req.params.count;

		const result = await predictionController.getRecentPredictionFixtures(
			count
		);

		return res.status(200).send(result);
	});

	// retrieve up-coming hours fixtures :3hours for now
	predictionRouter.get('/upcoming-hour/:hours', async (req, res) => {
		const hours = req.params.hours;
		const result = await predictionController.getUpcomingFixtures(hours);

		return res.status(200).send(result);
	});

	predictionRouter.post('/update', async (req, res) => {
		const result = await predictionController.updateLatest();

		if (result > 0) {
			return res.status(200).send({
				message: `total ${result} prediction has been created.`,
			});
		} else {
			return res.status(503).send({
				message: `failed get prediction service!!`,
			});
		}
	});

	app.use('/api/prediction', predictionRouter);
};
