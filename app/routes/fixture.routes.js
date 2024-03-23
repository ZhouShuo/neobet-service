module.exports = (app) => {
	const fixtureController = require('../controllers/fixture.controller.js');

	var fixtureRouter = require('express').Router();

	// get a single fixture by id
	fixtureRouter.get('/:id', async (req, res) => {
		const fixtureId = req.params.id;

		const result = await fixtureController.getByFixtureId(fixtureId);

		return res.status(200).send(result);
	});

	// get upcoming fixtures by hours
	fixtureRouter.get('/upcoming/:hours', async (req, res) => {
		const hours = req.params.hours;

		const result = await fixtureController.getUpcomingFixturesByHours(hours);

		return res.status(200).send(result);
	});

	// get league from fixture
	fixtureRouter.get('/:id/league', async (req, res) => {
		const fixtureId = req.params.id;

		const result = await fixtureController.getLeagueByFixtureId(fixtureId);

		return res.status(200).send(result);
	});

	fixtureRouter.get('/:id/away', async (req, res) => {
		const fixtureId = req.params.id;

		const result = await fixtureController.getTeamByFixtureId(
			fixtureId,
			'away'
		);

		return res.status(200).send(result);
	});

	fixtureRouter.get('/:id/home', async (req, res) => {
		const fixtureId = req.params.id;

		const result = await fixtureController.getTeamByFixtureId(
			fixtureId,
			'home'
		);

		return res.status(200).send(result);
	});

	app.use('/api/fixtures', fixtureRouter);
};
