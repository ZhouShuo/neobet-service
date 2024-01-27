module.exports = (sequelize, Sequelize) => {
    const FixtureScore = sequelize.define("fixture_score", {      
      type: {
        type: Sequelize.DataTypes.STRING,
      },
      home: {
        type: Sequelize.DataTypes.INTEGER,
      },
      away: {
        type: Sequelize.DataTypes.INTEGER,
      },
    });
  
    return FixtureScore;
  };
  