// models/index.js
import { Sequelize, DataTypes } from "sequelize";
import MemoModel from "./Memo.js";
import MemoImageModel from "./MemoImage.js";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: isProduction
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {}, // no SSL locally
  }
);

// Initialize models
const Memo = MemoModel(sequelize, DataTypes);
const MemoImage = MemoImageModel(sequelize, DataTypes);

// Associations
Memo.hasMany(MemoImage, {
  foreignKey: "memo_id",
  as: "images",
  onDelete: "CASCADE",
});
MemoImage.belongsTo(Memo, { foreignKey: "memo_id", as: "memo" });

export { sequelize, Memo, MemoImage };
