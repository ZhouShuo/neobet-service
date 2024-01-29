module.exports = (app) => {
	const tasks = require('../tasks');

	var router = require('express').Router();

	// init db
	router.get('/init', tasks.init);

	// recent dates
	router.get('/recent', tasks.getUpdateDates);
	// fetch timezone
	router.get('/timezone', tasks.fetchTimezones);

	// fetch country
	router.get('/country', tasks.fetchCountries);

	// fetch league
	router.get('/league', tasks.fetchLeagues);
	// fetch league by is
	router.get('/league/:id', tasks.fetchLeagueById);

	// fetch team
	router.get('/team', tasks.fetchTeams);

	// fetch round
	router.get('/round', tasks.fetchRounds);

	// fetch fixture
	router.get('/fixture/:year', tasks.fetchFixtures);

	// fetch fixture update
	router.get('/fixture-update/:year', tasks.fetchFixturesUpdate);

	// fetch fixture update by id
	router.get('/fixture-update-single/:id', tasks.fetchFixtureById);

	// fetch fixtures update by date
	router.get('/fixture-update-date/:date', tasks.fetchFixtureByDate);

	// fetch bet
	router.get('/bet', tasks.fetchBets);

	// fetch bookmaker
	router.get('/bookmaker', tasks.fetchBookmakers);

	// fetch odd
	router.get('/odd/:year', tasks.fetchOdds);

	// fetch odd by date
	router.get('/odd-date/:date', tasks.fetchOddsByDate);
	// fetch odd by league
	router.get('/odd-uptodate/:date', tasks.fetchOddsUpToDate);


	app.use('/api/tasks', router);
};
