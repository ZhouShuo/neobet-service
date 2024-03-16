module.exports = (app) => {
	const countries = require('../controllers/country.controller.js');

	var router = require('express').Router();

	// Retrieve all Countries
	router.get('/', countries.findAll);

	// Retrieve a single Country with id
	router.get('/byName/:name', countries.findByName);

	// Retrieve a single Country with Id
	router.get('/:id', countries.findById);

	app.use('/api/countries', router);
};
