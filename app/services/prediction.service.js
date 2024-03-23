const axios = require('axios');
const logger = require('../config/logger.config')('axios');

exports.getPredictionResult = async (serviceUrl) => {
	const options = getOptions('get-prediction-json', serviceUrl);
	try {
		logger.info('request from ' + options.url);
		var response = await axios.request(options);
		var predictions = response.data;
		logger.debug('response :' + response);

		return predictions;
	} catch (error) {
		logger.error(
			`failed to get prediction from server ${options.url} with error: ${error}`
		);
		return error;
	}
};

exports.getPredictionVersion = async (serviceUrl) => {
	const options = getOptions('version', serviceUrl);
	try {
		logger.info('request from ' + options.url);
		var response = await axios.request(options);
		var version = response.data;
		logger.debug('response :' + response);

		return version;
	} catch (error) {
		logger.error(
			`failed to get prediction from server ${options.url} with error: ${error}`
		);
		return error;
	}
};

function getOptions(subUrl, baseUrl) {
	options = {
		method: 'GET',
		url: `${baseUrl}/${subUrl}`,
	};
	return options;
}
