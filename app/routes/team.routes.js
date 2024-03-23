module.exports = (app) => {
	const teams = require('../controllers/team.controller.js');

	var router = require('express').Router();

	// Retrieve a single Team with Id
	router.get('/:id', teams.findById);

	app.use('/api/teams', router);
};
