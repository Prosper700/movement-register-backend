// models/MemoImage.js
export default (sequelize, DataTypes) => {
  const MemoImageModel = sequelize.define(
    "MemoImage",
    {
      image_url: { type: DataTypes.STRING, allowNull: false },
      memo_id: { type: DataTypes.INTEGER, allowNull: false }, // 👈 explicit FK
    },
    {
      tableName: "memo_images",
      timestamps: false,
    }
  );

  return MemoImageModel;
};
