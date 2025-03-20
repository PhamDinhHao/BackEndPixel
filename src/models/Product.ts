import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface ProductAttributes {
  id: string;
  name: string;
  imageUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product extends Model<ProductAttributes> {
  declare id: string;
  declare name: string;
  declare imageUrl: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'products',
  }
); 