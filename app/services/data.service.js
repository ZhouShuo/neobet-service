const axios = require("axios");
const logger = require("../config/logger.config")("axios");
const RateLimiter = require("limiter").RateLimiter;
const limiter = new RateLimiter({
  tokensPerInterval: 1,
  interval: 1000,
});

/*
axios.interceptors.request.use(request => {
  logger.info('Starting Request', JSON.stringify(request, null, 2))
  return request
})

axios.interceptors.response.use(response => {
  logger.info('Response:', JSON.stringify(response, null, 2))
  return response
})
*/
function handleError(error) {
  if (error.response) {
    logger.error(`data: ${error.response.data}`);
    logger.error(`status: ${error.response.status}`);
    logger.error(`headers: ${error.response.headers}`);
  }
  logger.error(`message: ${error.message}`);
}

function getOptions(subUrl) {
  options = {
    method: "GET",
    url: "https://api-football-v1.p.rapidapi.com/v3/" + subUrl,
    headers: {
      "X-RapidAPI-Key": "86e156c3b7msh26001d6cfc6be0ep1591e7jsnbde1dcf4ad1c",
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    },
  };
  return options;
}

exports.getSeasons = async () => {
  try {
    var options = getOptions("leagues/seasons");
    logger.info("request from " + options.url);
    var response = await axios.request(options);
    var seasons = response.data.response;
    logger.info("response :" + seasons);

    return seasons;
  } catch (error) {
    handleError(error);
    return error;
  }
};

exports.getCountries = async () => {
  try {
    var options = getOptions("teams/countries");
    logger.info("request from " + options.url);
    var response = await axios.request(options);
    var countries = response.data.response;
    logger.info("response :" + countries);

    return countries;
  } catch (error) {
    handleError(error);
    return error;
  }
};

exports.getCountriesSecond = async () => {
  try {
    var options = getOptions("countries");
    logger.info("request from " + options.url);
    var response = await axios.request(options);
    var countries = response.data.response;
    logger.info("response :" + countries);

    return countries;
  } catch (error) {
    handleError(error);
    return error;
  }
};

exports.getLeagues = async () => {
  try {
    var options = getOptions("leagues");
    logger.info("request from " + options.url);
    var response = await axios.request(options);
    var leagues = response.data.response;
    logger.info("response :" + leagues);

    return leagues;
  } catch (error) {
    handleError(error);
    return error;
  }
};

exports.getLeagueById = async (id) => {
  try {
    var options = getOptions(`leagues?id=${id}`);
    logger.info("request from " + options.url);
    var response = await axios.request(options);
    var leagues = response.data.response;
    logger.info("response :" + leagues);

    return leagues;
  } catch (error) {
    handleError(error);
    return error;
  }
};

exports.getTimezones = async () => {
  try {
    var options = getOptions("timezone");
    logger.info("request from " + options.url);
    var response = await axios.request(options);
    var timezones = response.data.response;
    logger.info("response :" + response);

    return timezones;
  } catch (error) {
    handleError(error);
    return error;
  }
};

exports.getTeams = async (country) => {
  try {
    var options = getOptions(`teams?country=${country.name}`);
    logger.info("request from " + options.url);
    var response = await axios.request(options);
    var teams = response.data.response;
    logger.info("response :" + response);

    return teams;
  } catch (error) {
    handleError(error);
    return error;
  }
};

exports.getRounds = async (league, season) => {
  try {
    var options = getOptions(
      `fixtures/rounds?league=${league.id}&season=${season.year}`,
    );
    logger.info("request from " + options.url);
    var response = await axios.request(options);
    var rounds = response.data.response;
    logger.info("response :" + response);

    return rounds;
  } catch (error) {
    handleError(error);
    return error;
  }
};

exports.getFixtures = async (league, season, round) => {
  try {
    var options = getOptions(
      `fixtures?league=${league.id}&season=${season.year}&round=${round.name}`,
    );
    logger.info("request from " + options.url);
    var response = await axios.request(options);
    var fixtures = response.data.response;
    logger.info("response :" + response);

    return fixtures;
  } catch (error) {
    handleError(error);
    return error;
  }
};

exports.getFixturesBySeason = async (league, season) => {
  try {
    var options = getOptions(
      `fixtures?league=${league.id}&season=${season.year}`,
    );
    logger.info("request from " + options.url);
    var response = await axios.request(options);
    var fixtures = response.data.response;
    logger.info("response :" + response);

    return fixtures;
  } catch (error) {
    handleError(error);
    return error;
  }
};

exports.getFixturesById = async (id) => {
  try {
    var options = getOptions(`fixtures?id=${id}`);
    logger.info("request from " + options.url);
    var response = await axios.request(options);
    var fixtures = response.data.response;
    logger.info("response :" + response);

    return fixtures;
  } catch (error) {
    handleError(error);
    return error;
  }
};

exports.getFixturesByDate = async (date) => {
  try {
    var options = getOptions(`fixtures?date=${date}`);
    logger.info("request from " + options.url);
    var response = await axios.request(options);
    var fixtures = response.data.response;
    logger.info("response :" + response);

    return fixtures;
  } catch (error) {
    handleError(error);
    return error;
  }
};

exports.getBets = async () => {
  try {
    var options = getOptions("odds/bets");
    logger.info("request from " + options.url);
    var response = await axios.request(options);
    var bets = response.data.response;
    logger.info("response :" + response);

    return bets;
  } catch (error) {
    handleError(error);
    return error;
  }
};

exports.getBookmakers = async () => {
  try {
    var options = getOptions("odds/bookmakers");
    logger.info("request from " + options.url);
    var response = await axios.request(options);
    var bookmakers = response.data.response;
    logger.info("response :" + response);

    return bookmakers;
  } catch (error) {
    handleError(error);
    return error;
  }
};

exports.getOdds = async (league, season) => {
  try {
    var returnOdds = [];
    let currentPage = 1;
    let totalPage = 1;
    while (currentPage <= totalPage) {
      // odds
      var options = getOptions(
        `odds?league=${league.id}&season=${season}&page=${currentPage}`,
      );
      await limiter.removeTokens(1);
      logger.info("request from " + options.url);
      var response = await axios.request(options);
      var odds = response.data.response;
      var paging = response.data.paging;

      if (paging != null) {
        totalPage = paging.total;
      }
      logger.info(`${currentPage} total odds is : ${odds.length}`);

      currentPage = currentPage + 1;
      returnOdds = returnOdds.concat(odds);
    }

    return returnOdds;
  } catch (error) {
    handleError(error);
    return error;
  }
};

exports.getOddsByFixtureId = async (fixtureId) => {
  try {
    var returnOdds = [];
    let currentPage = 1;
    let totalPage = 1;
    while (currentPage <= totalPage) {
      // odds
      var options = getOptions(`odds?fixture=${fixtureId}&page=${currentPage}`);

      await limiter.removeTokens(1);
      logger.info("request from " + options.url);
      var response = await axios.request(options);
      var odds = response.data.response;
      var paging = response.data.paging;

      if (paging != null) {
        totalPage = paging.total;
      }
      logger.info(`${currentPage} total odds is : ${odds.length}`);

      currentPage = currentPage + 1;
      returnOdds = returnOdds.concat(odds);
    }

    return returnOdds;
  } catch (error) {
    handleError(error);
    return error;
  }
};

exports.getOddsByDate = async (date) => {
  try {
    var returnOdds = [];
    let currentPage = 1;
    let totalPage = 1;
    while (currentPage <= totalPage) {
      // odds
      var options = getOptions(`odds?date=${date}&page=${currentPage}`);
      await limiter.removeTokens(1);
      logger.info("request from " + options.url);
      var response = await axios.request(options);
      var odds = response.data.response;
      var paging = response.data.paging;

      if (paging != null) {
        totalPage = paging.total;
      }
      logger.info(`${currentPage} total odds is : ${odds.length}`);

      currentPage = currentPage + 1;
      returnOdds = returnOdds.concat(odds);
    }

    return returnOdds;
  } catch (error) {
    handleError(error);
    return error;
  }
};
