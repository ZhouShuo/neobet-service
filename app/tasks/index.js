const db = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger.config')('task');
const dataService = require('../services/data.service');
const predictService = require('../services/prediction.service');
const moment = require('moment');
const RateLimiter = require('limiter').RateLimiter;
const limiter = new RateLimiter({
	tokensPerInterval: 1,
	interval: 500,
});

exports.getUpdateDates = (req, res, next) => {
	let recentDates = [];
	recentDates.push(moment().subtract(5, 'days').format('YYYY-MM-DD'));
	recentDates.push(moment().subtract(4, 'days').format('YYYY-MM-DD'));
	recentDates.push(moment().subtract(3, 'days').format('YYYY-MM-DD'));
	recentDates.push(moment().subtract(2, 'days').format('YYYY-MM-DD'));
	recentDates.push(moment().subtract(1, 'days').format('YYYY-MM-DD'));
	recentDates.push(moment().format('YYYY-MM-DD'));
	recentDates.push(moment().add(1, 'days').format('YYYY-MM-DD'));
	recentDates.push(moment().add(2, 'days').format('YYYY-MM-DD'));
	recentDates.push(moment().add(3, 'days').format('YYYY-MM-DD'));
	recentDates.push(moment().add(4, 'days').format('YYYY-MM-DD'));
	recentDates.push(moment().add(5, 'days').format('YYYY-MM-DD'));
	recentDates.push(moment().add(6, 'days').format('YYYY-MM-DD'));
	res.send(recentDates);
};

// db setup
exports.init = (req, res) => {
	const force = req.query.force;
	// if (force) {
	// 	db.sequelize
	// 		.sync({ force: true })
	// 		.then(() => {
	// 			logger.log('info', 'Drop and re-Synced db.');
	// 			res.send({ message: 're-Synced db' });
	// 		})
	// 		.catch((err) => {
	// 			logger.log('info', `Failed to sync db: ${err.message}`);
	// 			res.status(500).send({
	// 				message: err.message || 'Failed to sync db:',
	// 			});
	// 		});
	// } else {
	db.sequelize
		.sync({ alter: true })
		.then(() => {
			logger.log('info', 'Altered db.');
			res.send({ message: 'Altered db' });
		})
		.catch((err) => {
			logger.log('info', `Failed to sync db: ${err.message}`);
			res.status(500).send({
				message: err.message || 'Failed to sync db:',
			});
		});
	//}
};
// setup data fetch task
exports.fetchTimezones = async (req, res, next) => {
	try {
		// timezone
		const timezones = await dataService.getTimezones();
		logger.info(`total timezones is : ${timezones.length}`);
		var newTimezones = [];
		for (const timezone of timezones) {
			logger.info(`Fetched timezone is : ${timezone}`);
			var [newTimezone, created] = await db.timezones.findOrCreate({
				where: { name: timezone },
			});

			logger.info(
				`Created new timezone is : ${newTimezone.id} ${newTimezone.name}`
			);
			newTimezones.push(newTimezone);
		}
		logger.info(`total timezones ${newTimezones.length} is created`);
		res.send(newTimezones);
	} catch (err) {
		logger.error(`Failed to fetch timezons: ${err.message}`);
		res.status(500).send({
			message: err.message || 'Failed to fetch timezons:',
		});
	}
};
// country

exports.fetchCountries = async (req, res, next) => {
	try {
		// country
		const countriesOne = await dataService.getCountries();
		const countriesOthers = await dataService.getCountriesSecond();
		const countries = countriesOne.concat(countriesOthers);
		logger.info(`total countries is : ${countries.length}`);
		var newCountries = [];
		for (const country of countries) {
			logger.info(`Fetched country is : ${country.name}`);
			var [dbCountry, created] = await db.countries.findOrCreate({
				where: { name: country.name },
				defaults: {
					code: country.code,
					flag: country.flag,
				},
			});

			if (!created) {
				dbCountry.code = country.code;
				dbCountry.flag = country.flag;
				await dbCountry.save();

				logger.info(
					`Updated country is : ${dbCountry.id} ${dbCountry.code} ${dbCountry.name}`
				);
			} else {
				logger.info(
					`Created country is : ${dbCountry.id} ${dbCountry.code} ${dbCountry.name}`
				);
			}

			newCountries.push(dbCountry);
		}

		logger.info(`total countries ${newCountries.length} is created`);
		res.send(newCountries);
	} catch (err) {
		logger.error(`Failed to fetch countries: ${err.message}`);
		res.status(500).send({
			message: err.message || 'Failed to fetch countries:',
		});
	}
};

// leagues
exports.fetchLeagues = async (req, res, next) => {
	try {
		// leagues
		const leagues = await dataService.getLeagues();
		logger.info(`total leagues is : ${leagues.length}`);
		var newLeagues = [];
		for (const league of leagues) {
			logger.info(`Fetched league is : ${league.league.name}`);
			var country = await db.countries.findOne({
				where: { name: league.country.name },
			});

			if (country === null) {
				logger.info(
					`the league which named ${league.league.name} is not have country ${league.country.name}`
				);

				continue;
			}
			var [dbLeague, created] = await db.leagues.findOrCreate({
				where: { id: league.league.id },
				defaults: {
					name: league.league.name,
					type: league.league.type,
					logo: league.league.logo,
					countryId: country.id,
				},
			});

			if (!created) {
				dbLeague.name = league.league.name;
				dbLeague.type = league.league.type;
				dbLeague.logo = league.league.logo;
				await dbLeague.save();

				logger.info(
					`Updated league is : ${dbLeague.id} ${dbLeague.name} ${dbLeague.type}`
				);
			} else {
				logger.info(
					`Created new league is : ${dbLeague.id} ${dbLeague.name} ${dbLeague.type}`
				);
			}

			// create seasons
			for (const season of league.seasons) {
				logger.info('Fetched season is :' + season.year);
				var [dbSeason, created] = await db.seasons.findOrCreate({
					where: {
						leagueId: dbLeague.id,
						year: season.year,
					},
					defaults: {
						current: season.current,
						start: season.start,
						end: season.end,
					},
				});

				if (!created) {
					dbSeason.current = season.current;
					dbSeason.start = season.start;
					dbSeason.end = season.end;
					await dbSeason.save();
					logger.info(
						`Updated season is : ${dbSeason.id} ${dbSeason.year} ${dbSeason.start} - ${dbSeason.end}`
					);
				} else {
					logger.info(
						`Created new season is : ${dbSeason.id} ${dbSeason.year} ${dbSeason.start} - ${dbSeason.end}`
					);
				}
			}

			newLeagues.push(dbLeague);
		}

		// response to client
		logger.info(`total leagues ${newLeagues.length} is created`);
		res.send(newLeagues);
	} catch (err) {
		logger.error(`Failed to fetch leagues: ${err.message}`);
		res.status(500).send({
			message: err.message || 'Failed to fetch leagues:',
		});
	}
};

// league by Id
exports.fetchLeagueById = async (req, res, next) => {
	const id = req.params.id;
	try {
		// leagues
		const leagues = await dataService.getLeagueById(id);
		if (leagues == null || leagues.length == 0) {
			logger.info(`Does not have league with this ${id}`);
			res.status(404).send(`league with id ${id} not found!`);
		} else {
			var newLeagues = [];
			const league = leagues[0];
			logger.info(`Fetched league is : ${league.league.name}`);
			var country = await db.countries.findOne({
				where: { name: league.country.name },
			});

			if (country === null) {
				logger.info(
					`the league which named ${league.league.name} is not have country ${league.country.name}`
				);
			} else {
				var [dbLeague, created] = await db.leagues.findOrCreate({
					where: { id: league.league.id },
					defaults: {
						name: league.league.name,
						type: league.league.type,
						logo: league.league.logo,
						countryId: country.id,
					},
				});

				if (!created) {
					dbLeague.name = league.league.name;
					dbLeague.type = league.league.type;
					dbLeague.logo = league.league.logo;
					await dbLeague.save();

					logger.info(
						`Updated league is : ${dbLeague.id} ${dbLeague.name} ${dbLeague.type}`
					);
				} else {
					logger.info(
						`Created new league is : ${dbLeague.id} ${dbLeague.name} ${dbLeague.type}`
					);
				}

				// create seasons
				for (const season of league.seasons) {
					logger.info('Fetched season is :' + season.year);
					var [dbSeason, created] = await db.seasons.findOrCreate({
						where: {
							leagueId: dbLeague.id,
							year: season.year,
						},
						defaults: {
							current: season.current,
							start: season.start,
							end: season.end,
						},
					});

					if (!created) {
						dbSeason.current = season.current;
						dbSeason.start = season.start;
						dbSeason.end = season.end;
						await dbSeason.save();
						logger.info(
							`Updated season is : ${dbSeason.id} ${dbSeason.year} ${dbSeason.start} - ${dbSeason.end}`
						);
					} else {
						logger.info(
							`Created new season is : ${dbSeason.id} ${dbSeason.year} ${dbSeason.start} - ${dbSeason.end}`
						);
					}
				}

				newLeagues.push(dbLeague);
			}

			// response to client
			logger.info(`total leagues ${newLeagues.length} is created`);
			res.send(newLeagues);
		}
	} catch (err) {
		logger.error(`Failed to fetch leagues: ${err.message}`);
		res.status(500).send({
			message: err.message || 'Failed to fetch leagues:',
		});
	}
};

// teams
exports.fetchTeams = async (req, res, next) => {
	logger.info(`============ Fetch teams started ============`);
	try {
		// get all countries
		const countries = await db.countries.findAll();
		const newTeams = [];
		const newVenues = [];
		for (const country of countries) {
			logger.info(`start fetch teams for: ${country.code} - ${country.name}`);

			// get teams by this season
			const teams = await dataService.getTeams(country);
			for (const team of teams) {
				var [dbTeam, created] = await db.teams.findOrCreate({
					where: { id: team.team.id },
					defaults: {
						name: team.team.name,
						founded: team.team.founded,
						national: team.team.national,
						logo: team.team.logo,
						countryId: country.id,
					},
				});

				if (!created) {
					dbTeam.name = team.team.name;
					dbTeam.founded = team.team.founded;
					dbTeam.national = team.team.national;
					dbTeam.logo = team.team.log;
					await dbTeam.save();

					logger.info(`Updated team is : ${dbTeam.id} ${dbTeam.name}`);
				} else {
					logger.info(`Created new team is : ${dbTeam.id} ${dbTeam.name}`);
				}

				newTeams.push(dbTeam);

				if (team.venue.id != null) {
					var [dbVenue, created] = await db.venues.findOrCreate({
						where: { id: team.venue.id },
						defaults: {
							name: team.venue.name,
							address: team.venue.address,
							city: team.venue.city,
							capacity: team.venue.capacity,
							surface: team.venue.surface,
							image: team.venue.image,
							countryId: country.id,
						},
					});

					if (created) {
						logger.info(
							`Created new venue is : ${dbVenue.id} ${dbVenue.city} ${dbVenue.name}`
						);
					} else {
						dbVenue.name = team.venue.name;
						dbVenue.address = team.venue.address;
						dbVenue.city = team.venue.city;
						dbVenue.capacity = team.venue.capacity;
						dbVenue.surface = team.venue.surface;
						dbVenue.image = team.venue.image;
						await dbVenue.save();

						logger.info(
							`Updated venue is : ${dbVenue.id} ${dbVenue.city} ${dbVenue.name}`
						);
					}

					newVenues.push(dbVenue);
				}
			}
		}

		// response to client
		logger.info(`total teams ${newTeams.length} is created`);
		res.send(newTeams);
	} catch (err) {
		logger.error(`Failed to fetch team: ${err.message}`);
		res.status(500).send({
			message: err.message || 'Failed to fetch team:',
		});
	}
};
exports.fetchRoundsByLeague = async (req, res, next) => {
	const id = req.params.id;
	logger.info(`============ Fetch rounds started ============`);
	try {
		// get all leagues
		const league = await db.leagues.findOne({ where: { id: id } });
		const newRounds = [];
		logger.info(`start fetch round for: ${league.id} - ${league.name}`);

		// get the season by this league for now
		const seasons = await db.seasons.findAll({
			where: { leagueId: league.id },
		});
		for (const season of seasons) {
			logger.info(
				`get rounds from season ${league.id} - ${league.name} - ${season.year}`
			);
			// get round by this season
			await limiter.removeTokens(1);
			const rounds = await dataService.getRounds(league, season);
			for (const round of rounds) {
				var [newRound, created] = await db.rounds.findOrCreate({
					where: { name: round, seasonId: season.id },
				});

				if (created) {
					logger.info(
						`Created new round is : ${newRound.id} ${newRound.name} `
					);
				}
				newRounds.push(newRound);
			}
		}

		// response to client
		logger.info(`total rounds ${newRounds.length} is created`);
		res.send(newRounds);
	} catch (err) {
		logger.error(`Failed to fetch round: ${err.message}`);
		res.status(500).send({
			message: err.message || 'Failed to fetch round:',
		});
	}
};

// round
exports.fetchRounds = async (req, res, next) => {
	logger.info(`============ Fetch rounds started ============`);
	try {
		// get all leagues
		const leagues = await db.leagues.findAll();
		const newRounds = [];
		for (const league of leagues) {
			logger.info(`start fetch round for: ${league.id} - ${league.name}`);

			// get the season by this league for now
			const seasons = await db.seasons.findAll({
				where: { leagueId: league.id },
			});
			for (const season of seasons) {
				logger.info(
					`get rounds from season ${league.id} - ${league.name} - ${season.year}`
				);
				// get round by this season
				await limiter.removeTokens(1);
				const rounds = await dataService.getRounds(league, season);
				for (const round of rounds) {
					var [newRound, created] = await db.rounds.findOrCreate({
						where: { name: round, seasonId: season.id },
					});

					if (created) {
						logger.info(
							`Created new round is : ${newRound.id} ${newRound.name} `
						);
					}
					newRounds.push(newRound);
				}
			}
		}

		// response to client
		logger.info(`total rounds ${newRounds.length} is created`);
		res.send(newRounds);
	} catch (err) {
		logger.error(`Failed to fetch round: ${err.message}`);
		res.status(500).send({
			message: err.message || 'Failed to fetch round:',
		});
	}
};

// fixture
exports.fetchFixtures = async (req, res, next) => {
	const year = req.params.year == null ? 2023 : req.params.year;

	logger.info(`============ Fetch fixtures started ============`);
	try {
		// get all seasons by each league
		const leagues = await db.leagues.findAll({
			order: ['id'],
		});
		const newFixtures = [];

		for (const league of leagues) {
			logger.info(`start fetch fixture for: ${league.id} - ${league.name}`);

			// only get 2023 for now
			const season = await db.seasons.findOne({
				where: { leagueId: league.id, year: year },
			});
			if (season === null) {
				logger.info(
					`Does not have season for ${year} for: ${league.id} - ${league.name}`
				);
			} else {
				// get round by this season
				const rounds = await db.rounds.findAll({
					where: { seasonId: season.id },
				});
				for (const round of rounds) {
					// get fixture from data service api
					const fixtures = await dataService.getFixtures(league, season, round);
					for (const fixture of fixtures) {
						/*
            var [venue, created] = await db.venues.findOrCreate({
              where: { id: fixture.fixture.venue.id },
              default: {
                name: fixture.fixture.venue.name,
                city: fixture.fixture.venue.city,
                countryId: league.countryId,
              },
            });
            */

						// create new fixture
						var [newFixture, created] = await db.fixtures.findOrCreate({
							where: { id: fixture.fixture.id },
							defaults: {
								referee: fixture.fixture.referee,
								timezone: fixture.fixture.timezone,
								date: fixture.fixture.date,
								//start: fixture.fixture.periods.first,
								//end: fixture.fixture.periods.second,
								status: fixture.fixture.status.long,
								statusCode: fixture.fixture.status.short,
								elapsed: fixture.fixture.status.elapsed,
								roundId: round.id,
								venueId: fixture.fixture.venue.id,
							},
						});

						if (!created) {
							newFixture.reference = fixture.fixture.referee;
							newFixture.timezone = fixture.fixture.timezone;
							newFixture.date = fixture.fixture.date;
							newFixture.status = fixture.fixture.status.long;
							newFixture.statusCode = fixture.fixture.status.short;
							newFixture.elapsed = fixture.fixture.elapsed;
							newFixture.venueId = fixture.fixture.venue.id;
							await newFixture.save();
						}
						const foundTeams = await db.teams.findAll({
							where: { id: [fixture.teams.home.id, fixture.teams.away.id] },
						});
						if (foundTeams.length === 2) {
							logger.info(
								`Created new newFixture is : ${newFixture.id} ${newFixture.name} `
							);
							// create new fixture team home
							var [newHomeTeam, created] = await db.fixtureTeams.findOrCreate({
								where: { fixtureId: fixture.fixture.id, type: 'home' },
								defaults: {
									win: fixture.teams.home.winner,
									goals: fixture.goals.home,
									teamId: fixture.teams.home.id,
								},
							});
							// create new fixture away home
							var [newAwayTeam, created] = await db.fixtureTeams.findOrCreate({
								where: { fixtureId: fixture.fixture.id, type: 'away' },
								defaults: {
									win: fixture.teams.away.winner,
									goals: fixture.goals.away,
									teamId: fixture.teams.away.id,
								},
							});
							// create new scores
							var [newHalftimeScore, created] =
								await db.fixtureScores.findOrCreate({
									where: { fixtureId: fixture.fixture.id, type: 'halftime' },
									defaults: {
										home: fixture.score.halftime.home,
										away: fixture.score.halftime.away,
									},
								});
							var [newFulltimeScore, created] =
								await db.fixtureScores.findOrCreate({
									where: { fixtureId: fixture.fixture.id, type: 'fulltime' },
									defaults: {
										home: fixture.score.fulltime.home,
										away: fixture.score.fulltime.away,
									},
								});
							var [newExtratimeScore, created] =
								await db.fixtureScores.findOrCreate({
									where: { fixtureId: fixture.fixture.id, type: 'extratime' },
									defaults: {
										home: fixture.score.extratime.home,
										away: fixture.score.extratime.away,
									},
								});
							var [newPenaltyScore, created] =
								await db.fixtureScores.findOrCreate({
									where: { fixtureId: fixture.fixture.id, type: 'penalty' },
									defaults: {
										home: fixture.score.penalty.home,
										away: fixture.score.penalty.away,
									},
								});
						}

						// create new fixture score
						newFixtures.push(newFixture);
					}
				}
			}
		}

		// response to client
		logger.info(`total fixtures ${newFixtures.length} is created`);
		res.send(newFixtures);
	} catch (err) {
		logger.error(`Failed to fetch fixtures: ${err.message} sql: ${err.sql}`);
		res.status(500).send({
			message: err.message || 'Failed to fetch fixtures:',
		});
	}
};

// update fixture
exports.fetchFixturesUpdate = async (req, res, next) => {
	const year = req.params.year == null ? 2023 : req.params.year;

	logger.info(`============ Fetch fixtures updated started ============`);
	try {
		// get all seasons by each league
		const leagues = await db.leagues.findAll({ order: ['id'] });
		const newFixtures = [];

		for (const league of leagues) {
			logger.info(`start fetch fixture for: ${league.id} - ${league.name}`);

			// only get 2023 for now
			const season = await db.seasons.findOne({
				where: { leagueId: league.id, year: year },
			});

			if (season === null) {
				logger.info(
					`Does not have season for ${year} for: ${league.id} - ${league.name}`
				);
			} else {
				// get fixture from data service api
				const fixtures = await dataService.getFixturesBySeason(league, season);
				for (const fixture of fixtures) {
					await limiter.removeTokens(1);
					const dbFixture = await createFixtureFromJSON(fixture, season.id);
					logger.info(
						`Finished ${dbFixture.id} season for ${year} for: ${league.id} - ${league.name}`
					);
					// create new fixture score
					newFixtures.push(dbFixture);
				}
			}
		}

		// response to client
		logger.info(`total fixtures ${newFixtures.length} is created`);
		res.send(newFixtures);
	} catch (err) {
		logger.error(`Failed to fetch fixtures: ${err.message} sql: ${err.sql}`);
		res.status(500).send({
			message: err.message || 'Failed to fetch fixtures:',
		});
	}
};

exports.fetchBets = async (req, res, next) => {
	try {
		// bets
		const bets = await dataService.getBets();
		logger.info(`total bets is : ${bets.length}`);
		var newBets = [];
		for (const bet of bets) {
			logger.info(`Fetched bet is : ${bet}`);
			var [newBet, created] = await db.bets.findOrCreate({
				where: { id: bet.id },
				defaults: {
					name: bet.name,
				},
			});

			logger.info(`Created new bet is : ${newBet.id} ${newBet.name}`);
			newBets.push(newBet);
		}
		logger.info(`total bets ${newBets.length} is created`);
		res.send(newBets);
	} catch (err) {
		logger.error(`Failed to fetch bets: ${err.message}`);
		res.status(500).send({
			message: err.message || 'Failed to fetch bets:',
		});
	}
};

// update fixture by id
exports.fetchFixtureById = async (req, res, next) => {
	const id = req.params.id;

	logger.info(`============ Single fixtures updated started ============`);
	try {
		// get all seasons by each league
		const fixtures = await dataService.getFixturesById(id);

		if (fixtures == null || fixtures.length == 0) {
			logger.info(`fixture with id ${id} not found!`);
			res.status(404).send(`fixture with id ${id} not found!`);
		} else {
			const fixture = fixtures[0];
			const season = await db.seasons.findOne({
				where: { leagueId: fixture.league.id, year: fixture.league.season },
			});

			const newFixtures = [];

			const dbFixture = await createFixtureFromJSON(fixture, season.id);
			logger.info(
				`Finished ${dbFixture.id} season for ${fixture.league.season} for: ${fixture.league.id} - ${fixture.league.name}`
			);
			// create new fixture score
			newFixtures.push(dbFixture);

			// response to client
			logger.info(`total fixtures ${newFixtures.length} is created`);
			res.send(newFixtures);
		}
	} catch (err) {
		logger.error(
			`Failed to fetch single fixture: ${err.message} sql: ${err.sql}`
		);
		res.status(500).send({
			message: err.message || 'Failed to fetch fixtures:',
		});
	}
};

// update fixture by date
exports.fetchFixtureByDate = async (req, res, next) => {
	const date = req.params.date;

	logger.info(
		`============ Fetch fixtures by date ${date} updated started ============`
	);
	try {
		// get all seasons by each league
		const fixtures = await dataService.getFixturesByDate(date);

		if (fixtures == null || fixtures.length == 0) {
			logger.info(`fixtures with date ${date} not found!`);
			res.status(404).send(`fixtures with date ${date} not found!`);
		} else {
			const newFixtures = [];

			let step = 0;
			for (const fixture of fixtures) {
				step = step + 1;
				logger.info(`=== ${step} in total ${fixtures.length} ===`);
				const season = await db.seasons.findOne({
					where: { leagueId: fixture.league.id, year: fixture.league.season },
				});

				if (season === null) {
					logger.error(
						`Does not have season for ${fixture.league.season} for: ${fixture.league.id} - ${fixture.league.name}`
					);
				} else {
					await limiter.removeTokens(1);
					const dbFixture = await createFixtureFromJSON(fixture, season.id);
					logger.info(
						`Finished ${dbFixture.id} season for ${fixture.league.season} for: ${fixture.league.id} - ${fixture.league.name}`
					);
					// create new fixture score
					newFixtures.push(dbFixture);
				}
			}

			// response to client
			logger.info(`total fixtures ${newFixtures.length} is created`);
			res.send(newFixtures);
		}
	} catch (err) {
		logger.error(
			`Failed to fetch fixture by date: ${err.message} sql: ${err.sql}`
		);
		res.status(500).send({
			message: err.message || 'Failed to fetch fixtures:',
		});
	}
};

exports.fetchBets = async (req, res, next) => {
	try {
		// bets
		const bets = await dataService.getBets();
		logger.info(`total bets is : ${bets.length}`);
		var newBets = [];
		for (const bet of bets) {
			logger.info(`Fetched bet is : ${bet}`);
			var [newBet, created] = await db.bets.findOrCreate({
				where: { id: bet.id },
				defaults: {
					name: bet.name,
				},
			});

			logger.info(`Created new bet is : ${newBet.id} ${newBet.name}`);
			newBets.push(newBet);
		}
		logger.info(`total bets ${newBets.length} is created`);
		res.send(newBets);
	} catch (err) {
		logger.error(`Failed to fetch bets: ${err.message}`);
		res.status(500).send({
			message: err.message || 'Failed to fetch bets:',
		});
	}
};

exports.fetchBookmakers = async (req, res, next) => {
	try {
		// bookmakers
		const bookmakers = await dataService.getBookmakers();
		logger.info(`total bookmakers is : ${bookmakers.length}`);
		var newBookmakers = [];
		for (const bookmaker of bookmakers) {
			logger.info(`Fetched bookmaker is : ${bookmaker}`);
			var [newBookmaker, created] = await db.bookmakers.findOrCreate({
				where: { id: bookmaker.id },
				defaults: {
					name: bookmaker.name,
				},
			});

			logger.info(
				`Created new bookmaker is : ${newBookmaker.id} ${newBookmaker.name}`
			);
			newBookmakers.push(newBookmaker);
		}
		logger.info(`total bookmakers ${newBookmakers.length} is created`);
		res.send(newBookmakers);
	} catch (err) {
		logger.error(`Failed to fetch bookmakers: ${err.message}`);
		res.status(500).send({
			message: err.message || 'Failed to fetch bookmakers:',
		});
	}
};

exports.fetchOdds = async (req, res, next) => {
	const year = req.params.year == null ? 2023 : req.params.year;
	try {
		// get all leagues
		const leagues = await db.leagues.findAll({
			order: ['id'],
		});
		var newOdds = [];
		// loop all the leagues
		for (const league of leagues) {
			// odds
			const odds = await dataService.getOdds(league, year);

			for (const odd of odds) {
				logger.info(
					`Fetched odds ${odds.length} for fixture ${odd.fixture.id}`
				);

				const fixture = await db.fixtures.findOne({
					where: { id: odd.fixture.id },
				});
				if (fixture === null) {
					logger.info(`the fixture ${odd.fixture.id} does not exist`);
				} else {
					// the update time from api
					const update = odd.update;
					// loop every bookmaker
					for (const bookmaker of odd.bookmakers) {
						for (const bet of bookmaker.bets) {
							if (bet.id === 1 || bet.id === 12) {
								for (const value of bet.values) {
									var newOdd = await db.odds.create({
										fixtureId: fixture.id,
										bookmakerId: bookmaker.id,
										betId: bet.id,
										update: update,
										value: value.value.toString(),
										odd: value.odd,
									});

									logger.info(
										`Created new odd is : ${newOdd.id} - ${newOdd.fixtureId} - ${newOdd.bookmakerId} - ${newOdd.betId} - ${newOdd.value} - ${newOdd.odd}`
									);

									newOdds.push(newOdd);
								}
							}
						}
					}
				}
			}
		}

		logger.info(`total odds ${newOdds.length} is created`);
		res.send(newOdds);
	} catch (err) {
		logger.error(`Failed to fetch odds: ${err.message}`);
		res.status(500).send({
			message: err.message || 'Failed to fetch odds:',
		});
	}
};

exports.fetchOddsByDate = async (req, res, next) => {
	const date = req.params.date == null ? formatDate(now()) : req.params.date;
	try {
		var newOdds = [];
		// odds
		const odds = await dataService.getOddsByDate(date);

		let step = 0;
		for (const odd of odds) {
			step = step + 1;
			logger.info(
				`=== Fetched odds ${step} - ${odds.length} for fixture ${odd.fixture.id} ===`
			);
			await limiter.removeTokens(1);
			const fixture = await db.fixtures.findOne({
				where: { id: odd.fixture.id },
			});
			if (fixture === null) {
				logger.info(`the fixture ${odd.fixture.id} does not exist`);
			} else {
				// the update time from api
				const update = odd.update;

				const updateCount = await db.odds.count({
					where: { update: update, fixtureId: fixture.id },
				});

				if (updateCount > 0) {
					logger.info(`the fixture ${odd.fixture.id} is up to date!`);
					continue;
				}
				// loop every bookmaker
				for (const bookmaker of odd.bookmakers) {
					for (const bet of bookmaker.bets) {
						//if (bet.id === 1 || bet.id === 12) {
						if (bet.id === 1) {
							for (const value of bet.values) {
								// if this updated
								var newOdd = await db.odds.create({
									fixtureId: fixture.id,
									bookmakerId: bookmaker.id,
									betId: bet.id,
									update: update,
									value: value.value.toString(),
									odd: value.odd,
								});

								logger.info(
									`Created new odd is : ${newOdd.id} - ${newOdd.fixtureId} - ${newOdd.bookmakerId} - ${newOdd.betId} - ${newOdd.value} - ${newOdd.odd}`
								);

								newOdds.push(newOdd);
							}
						}
					}
				}
			}
		}

		logger.info(`total odds ${newOdds.length} is created`);
		res.send(newOdds);
	} catch (err) {
		logger.error(`Failed to fetch odds: ${err.message}`);
		res.status(500).send({
			message: err.message || 'Failed to fetch odds:',
		});
	}
};

exports.fetchOddsUpToDate = async (req, res, next) => {
	const date = req.params.date;

	logger.info(
		`============ Fetch odds by date ${date} updated started ============`
	);
	let count = 0;
	try {
		// get all leagues
		const fixtures = await db.fixtures.findAll({
			where: { date: { [Op.gte]: date } },
		});

		count = fixtures.length;
		var newOdds = [];
		// loop all the leagues
		for (const fixture of fixtures) {
			logger.info(`fixtures total ${fixtures.length} -=- ${count} to go`);
			// odds
			const odds = await dataService.getOddsByFixtureId(fixture.id);
			logger.info(`fixture ${fixture.id} total odds is : ${odds}`);

			for (const odd of odds) {
				// the update time from api
				const update = odd.update;
				// loop every bookmaker
				for (const bookmaker of odd.bookmakers) {
					for (const bet of bookmaker.bets) {
						if (bet.id === 1) {
							for (const value of bet.values) {
								// if this updated
								var newOdd = await db.odds.create({
									fixtureId: fixture.id,
									bookmakerId: bookmaker.id,
									betId: bet.id,
									update: update,
									value: value.value.toString(),
									odd: value.odd,
								});

								logger.info(
									`Created new odd is : ${newOdd.id} - ${newOdd.fixtureId} - ${newOdd.bookmakerId} - ${newOdd.betId} - ${newOdd.value} - ${newOdd.odd}`
								);
								newOdds.push(newOdd);
							}
						}
					}
				}
			}

			count = count - 1;
		}

		logger.info(`total odds ${newOdds.length} is created`);
		res.send(newOdds);
	} catch (err) {
		logger.error(`Failed to fetch odds: ${err.message}`);
		res.status(500).send({
			message: err.message || 'Failed to fetch odds:',
		});
	}
};

async function createFixtureFromJSON(fixture, seasonId) {
	if (fixture.fixture === null) {
		logger.error(`the fixture is null ${fixture}`);
		return;
	}

	var [dbRound, created] = await db.rounds.findOrCreate({
		where: { name: fixture.league.round, seasonId: seasonId },
	});

	// create or get new fixture
	var [dbFixture, created] = await db.fixtures.findOrCreate({
		where: { id: fixture.fixture.id },
		defaults: {
			reference: fixture.fixture.referee,
			timezone: fixture.fixture.timezone,
			date: fixture.fixture.date,
			//start: fixture.fixture.periods.first,
			//end: fixture.fixture.periods.second,
			status: fixture.fixture.status.long,
			statusCode: fixture.fixture.status.short,
			elapsed: fixture.fixture.status.elapsed,
			roundId: dbRound.id,
			venueId: fixture.fixture.venue.id,
		},
	});

	// update fixture when it exits
	if (!created) {
		dbFixture.reference = fixture.fixture.referee;
		dbFixture.timezone = fixture.fixture.timezone;
		dbFixture.date = fixture.fixture.date;
		dbFixture.status = fixture.fixture.status.long;
		dbFixture.statusCode = fixture.fixture.status.short;
		dbFixture.elapsed = fixture.fixture.status.elapsed;
		dbFixture.venueId = fixture.fixture.venue.id;
		await dbFixture.save();

		logger.info(`fixtures ${dbFixture.id} is updated`);
	} else {
		logger.info(`fixtures ${dbFixture.id} is created`);
	}

	var homeTeam = await createFixtureTeamFromJSON(fixture, dbFixture.id, 'home');
	var awayTeam = await createFixtureTeamFromJSON(fixture, dbFixture.id, 'away');

	var halfTimeScore = await createFixtureScoreFromJSON(
		fixture,
		dbFixture.id,
		'halftime'
	);
	var fullTimeScore = await createFixtureScoreFromJSON(
		fixture,
		dbFixture.id,
		'fulltime'
	);
	var extraTimeScore = await createFixtureScoreFromJSON(
		fixture,
		dbFixture.id,
		'extratime'
	);
	var penaltyScore = await createFixtureScoreFromJSON(
		fixture,
		dbFixture.id,
		'penalty'
	);

	return dbFixture;
}

async function createFixtureTeamFromJSON(fixture, fixtureId, type) {
	let team = null;
	let goals = 0;

	if (type === 'home') {
		team = fixture.teams.home;
		goals = fixture.goals.home;
	} else {
		team = fixture.teams.away;
		goals = fixture.goals.away;
	}

	if (team === null) {
		logger.info(`fixtures ${fixtureId} has not ${type} team yet!`);
	}

	const dbTeam = await db.teams.findOne({
		where: { id: [team.id] },
	});

	if (dbTeam == null) {
		logger.info(
			`!!!===fixtures ${fixtureId} with team id ${team.id} type ${type} team does not exists yet!`
		);

		return;
	}

	// create new fixture away home
	var [dbFixtureTeam, created] = await db.fixtureTeams.findOrCreate({
		where: { fixtureId: fixtureId, type: type },
		defaults: {
			win: team.winner,
			goals: goals,
			teamId: team.id,
		},
	});

	if (!created) {
		dbFixtureTeam.win = team.winner;
		dbFixtureTeam.goals = goals;
		await dbFixtureTeam.save();
		// logger.info(
		// 	`fixtures ${fixtureId} has ${type} team ${team.id} with id ${dbFixtureTeam.id} updated!`
		// );
	} else {
		logger.info(
			`fixtures ${fixtureId} has ${type} team ${team.id} with id ${dbFixtureTeam.id} created!`
		);
	}

	return dbFixtureTeam;
}

async function createFixtureScoreFromJSON(fixture, fixtureId, type) {
	let home = 0;
	let away = 0;
	switch (type) {
		case 'halftime':
			home = fixture.score.halftime.home;
			away = fixture.score.halftime.away;
			break;
		case 'fulltime':
			home = fixture.score.fulltime.home;
			away = fixture.score.fulltime.away;
			break;
		case 'extratime':
			home = fixture.score.extratime.home;
			away = fixture.score.extratime.away;
			break;
		case 'penalty':
			home = fixture.score.penalty.home;
			away = fixture.score.penalty.away;
			break;
		default:
			return;
			break;
	}

	if (home == null || away == null) {
		return null;
	}
	// create new scores
	var [dbScore, created] = await db.fixtureScores.findOrCreate({
		where: { fixtureId: fixture.fixture.id, type: type },
		defaults: {
			home: home,
			away: away,
		},
	});

	if (!created) {
		dbScore.home = home;
		dbScore.away = away;
		await dbScore.save();
		// logger.info(
		// 	`fixtures ${fixtureId} has ${type} scroe ${home} : ${away} updated!`
		// );
	} else {
		logger.info(
			`fixtures ${fixtureId} has ${type} scroe ${home} : ${away} created!`
		);
	}

	return dbScore;
}

async function createOddsFromJSON(odd) {
	var newOdds = [];
	const fixture = await db.fixtures.findOne({
		where: { id: odd.fixture.id },
	});
	if (fixture === null) {
		logger.error(`the fixture ${odd.fixture.id} does not exist`);
		return newOdds;
	}
	// the update time from api
	const update = odd.update;

	const updateCount = await db.odds.count({
		where: { update: update, fixtureId: fixture.id },
	});

	if (updateCount > 0) {
		logger.info(`the fixture ${odd.fixture.id} is up to date!`);
		return newOdds;
	}
	// loop every bookmaker
	for (const bookmaker of odd.bookmakers) {
		for (const bet of bookmaker.bets) {
			//if (bet.id === 1 || bet.id === 12) {
			if (bet.id === 1) {
				for (const value of bet.values) {
					// if this updated
					var newOdd = await db.odds.create({
						fixtureId: fixture.id,
						bookmakerId: bookmaker.id,
						betId: bet.id,
						update: update,
						value: value.value.toString(),
						odd: value.odd,
					});

					logger.info(
						`Created new odd is : ${newOdd.id} - ${newOdd.fixtureId} - ${newOdd.bookmakerId} - ${newOdd.betId} - ${newOdd.value} - ${newOdd.odd}`
					);

					newOdds.push(newOdd);
				}
			}
		}
	}

	return newOdds;
}
function formatDate(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [year, month, day].join('-');
}

exports.taskOddsUpToDate = async (date) => {
	logger.info(
		`============ Fetch odds by date ${date} updated started ============`
	);
	try {
		var newOdds = [];
		// odds
		const odds = await dataService.getOddsByDate(date);

		let step = 0;
		for (const odd of odds) {
			step = step + 1;
			logger.info(
				`=== Fetched odds ${step} - ${odds.length} for fixture ${odd.fixture.id} ===`
			);
			await limiter.removeTokens(1);
			newOdds = newOdds.concat(await createOddsFromJSON(odd));
		}

		logger.info(`total odds ${newOdds.length} is created`);
		return newOdds;
	} catch (err) {
		logger.error(`Failed to fetch odds: ${err.message}`);
	}
};

exports.taskOddsUpdateRecentHourly = async (hours) => {
	const currentTime = moment();
	const upToTime = moment().add(hours, 'hours');
	logger.info(
		`============ Fetch odds in recent ${hours} hours ${currentTime} - ${upToTime} updated started ============`
	);
	try {
		// get all leagues
		const fixtures = await db.fixtures.findAll({
			where: {
				date: { [Op.between]: [currentTime, upToTime] },
				statusCode: 'NS',
			},
			order: ['date'],
		});

		let count = 0;
		var newOdds = [];
		// loop all the leagues
		for (const fixture of fixtures) {
			count = count + 1;
			logger.info(
				`[${fixture.id}] odds - fixtures total ${count} - ${fixtures.length} to go`
			);

			// odds
			const odds = await dataService.getOddsByFixtureId(fixture.id);

			if (odds === undefined || odds.length === 0) {
				logger.info(
					`[${fixture.id}] fixture ${fixture.id} has no odds for update!`
				);
				continue;
			}

			logger.info(
				`[${fixture.id}] fixture ${fixture.id} total odds is : ${odds.length}`
			);
			for (const odd of odds) {
				newOdds = newOdds.concat(await createOddsFromJSON(odd));
			}
		}

		logger.info(`total odds ${newOdds.length} is created`);
		return newOdds;
	} catch (err) {
		logger.error(`Failed to fetch odds: ${err.message}`);
	}
};

exports.taskFixturesUpToDate = async (date) => {
	logger.info(
		`============ Fetch fixtures by date ${date} updated started ============`
	);
	try {
		// get all seasons by each league
		const fixtures = await dataService.getFixturesByDate(date);

		if (fixtures == null || fixtures.length == 0) {
			logger.error(`fixtures with date ${date} not found!`);
		} else {
			const newFixtures = [];

			let step = 0;
			for (const fixture of fixtures) {
				step = step + 1;
				logger.info(`=== ${step} in total ${fixtures.length} ===`);
				const season = await db.seasons.findOne({
					where: { leagueId: fixture.league.id, year: fixture.league.season },
				});

				if (season === null) {
					logger.error(
						`Does not have season for ${fixture.league.season} for: ${fixture.league.id} - ${fixture.league.name}`
					);
				} else {
					await limiter.removeTokens(1);
					const dbFixture = await createFixtureFromJSON(fixture, season.id);
					logger.info(
						`Finished ${dbFixture.id} season for ${fixture.league.season} for: ${fixture.league.id} - ${fixture.league.name}`
					);
					// create new fixture score
					newFixtures.push(dbFixture);
				}
			}

			// response to client
			logger.info(`total fixtures ${newFixtures.length} is created`);
			return newFixtures;
		}
	} catch (err) {
		logger.error(
			`Failed to fetch fixture by date: ${err.message} sql: ${err.sql}`
		);
	}
};

exports.taskLeaguesUpdate = async () => {
	logger.info(`============ Fetch rounds started ============`);
	try {
		// get all leagues
		const leagues = await updateLeagues();
		const newRounds = [];
		for (const league of leagues) {
			logger.info(`start fetch round for: ${league.id} - ${league.name}`);

			// get the season by this league for now
			const seasons = await db.seasons.findAll({
				where: { leagueId: league.id },
			});
			for (const season of seasons) {
				logger.info(
					`get rounds from season ${league.id} - ${league.name} - ${season.year}`
				);
				// get round by this season
				await limiter.removeTokens(1);
				const rounds = await dataService.getRounds(league, season);
				for (const round of rounds) {
					var [newRound, created] = await db.rounds.findOrCreate({
						where: { name: round, seasonId: season.id },
					});

					if (created) {
						logger.info(
							`Created new round is : ${newRound.id} ${newRound.name} `
						);
					}
					newRounds.push(newRound);
				}
			}
		}

		logger.info(`total rounds ${newRounds.length} is created`);
		return newRounds;
	} catch (err) {
		logger.error(`Failed to fetch round: ${err.message}`);
	}
};

exports.taskTeamsUpdate = async () => {
	logger.info(`============ Fetch teams started ============`);
	try {
		// get all countries
		const countries = await db.countries.findAll();
		const newTeams = [];
		const newVenues = [];
		for (const country of countries) {
			logger.info(`start fetch teams for: ${country.code} - ${country.name}`);

			// get teams by this season
			const teams = await dataService.getTeams(country);
			for (const team of teams) {
				var [dbTeam, created] = await db.teams.findOrCreate({
					where: { id: team.team.id },
					defaults: {
						name: team.team.name,
						founded: team.team.founded,
						national: team.team.national,
						logo: team.team.logo,
						countryId: country.id,
					},
				});

				if (!created) {
					dbTeam.name = team.team.name;
					dbTeam.founded = team.team.founded;
					dbTeam.national = team.team.national;
					dbTeam.logo = team.team.log;
					await dbTeam.save();

					logger.info(`Updated team is : ${dbTeam.id} ${dbTeam.name}`);
				} else {
					logger.info(`Created new team is : ${dbTeam.id} ${dbTeam.name}`);
				}

				newTeams.push(dbTeam);

				if (team.venue.id != null) {
					var [dbVenue, created] = await db.venues.findOrCreate({
						where: { id: team.venue.id },
						defaults: {
							name: team.venue.name,
							address: team.venue.address,
							city: team.venue.city,
							capacity: team.venue.capacity,
							surface: team.venue.surface,
							image: team.venue.image,
							countryId: country.id,
						},
					});

					if (created) {
						logger.info(
							`Created new venue is : ${dbVenue.id} ${dbVenue.city} ${dbVenue.name}`
						);
					} else {
						dbVenue.name = team.venue.name;
						dbVenue.address = team.venue.address;
						dbVenue.city = team.venue.city;
						dbVenue.capacity = team.venue.capacity;
						dbVenue.surface = team.venue.surface;
						dbVenue.image = team.venue.image;
						await dbVenue.save();

						logger.info(
							`Updated venue is : ${dbVenue.id} ${dbVenue.city} ${dbVenue.name}`
						);
					}

					newVenues.push(dbVenue);
				}
			}
		}

		logger.info(`total teams ${newTeams.length} is created`);
		return newTeams;
	} catch (err) {
		logger.error(`Failed to fetch team: ${err.message}`);
	}
};

exports.taskPredictionUpdate = async (version) => {
	try {
		let defaultVersion = 'v1.0';
		const results = await predictService.getPredictionResult();

		const updateTime = moment();
		var newPredictions = [];
		for (const result of results) {
			logger.info(
				`creating prediction ${updateTime.format('YYYY-MM-DD HH:mm:SS')} - ${
					result.fixtureId
				} - ${result.Country} - ${result.League} - ${result.hname} - ${
					result.aname
				}`
			);

			const newPrediction = await db.predictions.create({
				fixtureId: result.fixtureId,
				version: version.length === 0 ? defaultVersion : version,
				update: updateTime,
				rateHome: result.rateH,
				scoreHome: result.scoreH,
				rateDraw: result.rateD,
				scoreDraw: result.scoreD,
				rateAway: result.rateA,
				scoreAway: result.scoreA,
				rateToWin: result.RtW,
				rateToLost: result.RtL,
				oddMedianHome: result.odd50Home,
				oddMedianDraw: result.odd50Draw,
				oddMedianAway: result.odd50Away,
				isReverse: !result.isH,
				betHome: result.DoH.length > 0,
				betDraw: result.DoD.length > 0,
				betAway: result.DoA.length > 0,
				betHomeWinGreater: result.DoH_C.length > 0,
			});

			newPredictions.push(newPrediction);
		}

		return newPredictions;
	} catch (err) {
		logger.error(
			`failed to get latest prediction result with error ${err}, please check the service!!!`
		);
	}
};

async function updateLeagues() {
	try {
		// leagues
		const leagues = await dataService.getLeagues();
		logger.info(`total leagues is : ${leagues.length}`);
		var newLeagues = [];
		for (const league of leagues) {
			logger.info(`Fetched league is : ${league.league.name}`);
			var country = await db.countries.findOne({
				where: { name: league.country.name },
			});

			if (country === null) {
				logger.info(
					`the league which named ${league.league.name} is not have country ${league.country.name}`
				);

				continue;
			}
			var [dbLeague, created] = await db.leagues.findOrCreate({
				where: { id: league.league.id },
				defaults: {
					name: league.league.name,
					type: league.league.type,
					logo: league.league.logo,
					countryId: country.id,
				},
			});

			if (!created) {
				dbLeague.name = league.league.name;
				dbLeague.type = league.league.type;
				dbLeague.logo = league.league.logo;
				await dbLeague.save();

				logger.info(
					`Updated league is : ${dbLeague.id} ${dbLeague.name} ${dbLeague.type}`
				);
			} else {
				logger.info(
					`Created new league is : ${dbLeague.id} ${dbLeague.name} ${dbLeague.type}`
				);
			}

			// create seasons
			for (const season of league.seasons) {
				logger.info('Fetched season is :' + season.year);
				var [dbSeason, created] = await db.seasons.findOrCreate({
					where: {
						leagueId: dbLeague.id,
						year: season.year,
					},
					defaults: {
						current: season.current,
						start: season.start,
						end: season.end,
					},
				});

				if (!created) {
					dbSeason.current = season.current;
					dbSeason.start = season.start;
					dbSeason.end = season.end;
					await dbSeason.save();
					logger.info(
						`Updated season is : ${dbSeason.id} ${dbSeason.year} ${dbSeason.start} - ${dbSeason.end}`
					);
				} else {
					logger.info(
						`Created new season is : ${dbSeason.id} ${dbSeason.year} ${dbSeason.start} - ${dbSeason.end}`
					);
				}
			}

			newLeagues.push(dbLeague);
		}

		logger.info(`total leagues ${newLeagues.length} is created`);

		return newLeagues;
	} catch (err) {
		logger.error(`Failed to fetch leagues: ${err.message}`);
	}
}
