module.exports = (sequelize, Sequelize) => {
  const FixtureTeam = sequelize.define("fixture_team", {
    type: {
      type: Sequelize.DataTypes.STRING,
    },
    win: {
      type: Sequelize.DataTypes.BOOLEAN,
    },
    goals: {
      type: Sequelize.DataTypes.INTEGER,
    },
  });

  return FixtureTeam;
};
