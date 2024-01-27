module.exports = (sequelize, Sequelize) => {
  const Season = sequelize.define("season", {
    year: {
      type: Sequelize.DataTypes.INTEGER,
    },
    start: {
      type: Sequelize.DataTypes.DATE,
    },
    end: {
      type: Sequelize.DataTypes.DATE,
    },
    current: {
      type: Sequelize.DataTypes.BOOLEAN,
    },
  });

  
  return Season;
};
