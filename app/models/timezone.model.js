
module.exports = (sequelize, Sequelize) => {
    const Timezone = sequelize.define("timezone", {
      name: {
        type: Sequelize.DataTypes.STRING,
      },
    });
  
    return Timezone;
  };
  