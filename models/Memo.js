// models/Memo.js
export default (sequelize, DataTypes) => {
  const MemoModel = sequelize.define(
    "Memo",
    {
      sender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      recipient_office: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date_signed: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      received_by: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
    },
    {
      freezeTableName: true,
      tableName: "memo_movements",
    }
  );

  return MemoModel;
};
