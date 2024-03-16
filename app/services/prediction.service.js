const axios = require('axios');
const logger = require('../config/logger.config')('axios');

exports.getPredictionResult = async (useOldVersion) => {
	const options = getOptions('get-prediction-json',useOldVersion);
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

exports.getPredictionVersion = async (useOldVersion) => {
	const options = getOptions('version', useOldVersion);
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

function getOptions(subUrl, useOldVersion) {
	options = {
		method: 'GET',
		url: `https://neobet-prediction-service.azurewebsites.net/${subUrl}`,
	};
	if (useOldVersion) {
		options.url = `https://neobet-compare-prediction-service.azurewebsites.net/${subUrl}`;
	} 
	return options;
}
