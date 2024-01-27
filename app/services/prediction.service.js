const axios = require('axios');
const logger = require('../config/logger.config')('axios');

exports.getPredictionResult = async () => {
	const options = getOptions();
	try {
		logger.info('request from ' + options.url);
		var response = await axios.request(options);
		var predictions = response.data.response;
		logger.info('response :' + response);

		return predictions;
	} catch (error) {
		logger.error(
			`failed to get prediction from server ${options.url} with error: ${error}`
		);
		return error;
	}
};

function getOptions(subUrl) {
	options = {
		method: 'POST',
		url: 'http://localhost:8080/get-prediction-json',
	};
	return options;
}
