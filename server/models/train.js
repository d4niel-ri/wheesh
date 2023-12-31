'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Train extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Train.hasMany(models.Schedule, {
        foreignKey: {
          name: 'trainId'
        },
      });
      Train.hasMany(models.Carriage, {
        foreignKey: {
          name: 'trainId',
        },
      });
    }
  }
  Train.init({
    name: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    modelName: 'Train',
  });
  return Train;
};