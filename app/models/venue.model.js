module.exports = (sequelize, Sequelize) => {
    const Venue = sequelize.define("venue", {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
      },
      address: {
        type: Sequelize.DataTypes.STRING,
      },
      city: {
        type: Sequelize.DataTypes.STRING,
      },
      capacity: {
        type: Sequelize.DataTypes.INTEGER,
      },
      surface: {
        type: Sequelize.DataTypes.STRING,
      },
      image: {
        type: Sequelize.DataTypes.STRING,
      },
    });
  
    return Venue;
  };