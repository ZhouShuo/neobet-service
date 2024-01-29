exports.default = (app) => {
	require('./season.routes')(app);
	require('./country.routes')(app);
	require('./league.routes')(app);
	require('./prediction.routes')(app);
	require('./scheduler-logs.routes')(app);

	require('./task.routes')(app);
};
