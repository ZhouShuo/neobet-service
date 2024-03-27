module.exports = (app) => {
	const players = require('../controllers/player.controller.js');

	var router = require('express').Router();

	// Retrieve a players with Id
	router.get('/:id', players.findById);

	// update players by team Id
	router.get('/update-by-teamId/:teamId', players.UpdateByTeamId);

	app.use('/api/players', router);
};
