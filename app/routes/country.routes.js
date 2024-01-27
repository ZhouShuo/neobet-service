module.exports = (app) => {
	const countries = require('../controllers/country.controller.js');

	var router = require('express').Router();

	// Retrieve all Countries
	router.get('/', countries.findAll);

	// Retrieve a single Country with id
	router.get('/:name', countries.findByName);

	app.use('/api/countries', router);
};
