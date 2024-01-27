module.exports = (sequelize, Sequelize) => {
  const Bet = sequelize.define("bet", {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
    },
    name: {
      type: Sequelize.DataTypes.STRING,
    },
  });

  return Bet;
};
