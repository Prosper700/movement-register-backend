// models/index.js
import { Sequelize, DataTypes } from "sequelize";
import MemoModel from "./Memo.js";
import MemoImageModel from "./MemoImage.js";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false, // disable SQL logs
  }
);

// Initialize models
const Memo = MemoModel(sequelize, DataTypes);
const MemoImage = MemoImageModel(sequelize, DataTypes);

// Associations
Memo.hasMany(MemoImage, {
  foreignKey: "memo_id",
  as: "images",
  onDelete: "CASCADE", // optional: delete images if memo is deleted
});
MemoImage.belongsTo(Memo, { foreignKey: "memo_id", as: "memo" });

// Export for use in routes/controllers
export { sequelize, Memo, MemoImage };
