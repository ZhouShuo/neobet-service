const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const logger = require('./app/config/logger.config')('express');

// morgan for all http request logging
const morganlogger = require('morgan')(
	':method :url :status :res[content-length] - :response-time ms',
	{
		stream: {
			write: (text) =>
				require('./app/config/logger.config')('http').info(` ${text}`),
		},
	}
);

app.use(morganlogger);

// parse requests of content-type - application/json
app.use(express.json());

// enable cors for now
app.use(cors());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// setup routes
app.get('/', (req, res) => {
	res.json({ message: 'Welcome to neo bet application.' });
});

require('./app/routes').default(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	logger.info(`Server is running on port ${PORT}.`);
});

const scheduler = require('./app/tasks/scheduler');
scheduler.scheduledHalfHourTask();
scheduler.scheduledQuarterTask();
scheduler.scheduledHourlyTask();
scheduler.scheduledMinuesTask();
scheduler.scheduledDailyTask();
scheduler.scheduledSixMinuesTask();

