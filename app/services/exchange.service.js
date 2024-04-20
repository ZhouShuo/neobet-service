const axios = require('axios');
const logger = require('../config/logger.config')('axios');
const RateLimiter = require('limiter').RateLimiter;
const limiter = new RateLimiter({
	tokensPerInterval: 1,
	interval: 1000,
});

function getOptions(subUrl) {
	options = {
		method: 'GET',
		url: 'https://exchange-rate-api1.p.rapidapi.com/' + subUrl,
		headers: {
			'X-RapidAPI-Key': '86e156c3b7msh26001d6cfc6be0ep1591e7jsnbde1dcf4ad1c',
			'X-RapidAPI-Host': 'exchange-rate-api1.p.rapidapi.com',
		},
	};
	return options;
}

exports.convert = async (baseCurrency, targetCurrency) => {
	try {
		var options = getOptions(
			'convert?base={0}&target={1}',
			baseCurrency,
			targetCurrency
		);
		logger.info('request from ' + options.url);
		var response = await axios.request(options);
		var results = response.data;
		logger.info('response :' + results);

		return results;
	} catch (error) {
		logger.error(error);
		return error;
	}
};

exports.codes = async () => {
	try {
		var options = getOptions('codes');
		logger.info('request from ' + options.url);
		var response = await axios.request(options);
		var results = response.data;
		logger.info('response :' + results);

		return results;
	} catch (error) {
		logger.error(error);
		return error;
	}
};
