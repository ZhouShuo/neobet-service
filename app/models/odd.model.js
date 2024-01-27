module.exports = (sequelize, Sequelize) => {
  const Odd = sequelize.define("odd", {
    update: {
      type: Sequelize.DataTypes.DATE,
    },
    value: {
      type: Sequelize.DataTypes.STRING,
    },
    odd: {
        type: Sequelize.DataTypes.DECIMAL,
    },

  });

  return Odd;
};
