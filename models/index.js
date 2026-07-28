const { sequelize } = require('../config/database');
const User = require('./User');
const District = require('./District');
const Office = require('./Office');
const Attendance = require('./Attendance');
const Device = require('./Device');
const AppealAttendance = require('./AppealAttendance');
const QrCode = require('./QrCode');
const UserOffice = require('./UserOffice');

const Role = require('./Role');
const ModelHasRole = require('./ModelHasRole');
const Attachment = require('./Attachment');
const FcmToken = require('./FcmToken');
const LateList = require('./LateList');
const NotificationMessage = require('./NotificationMessage');
const Otp = require('./Otp');
const Page = require('./Page');
const PostingRequest = require('./PostingRequest');
const Report = require('./Report');
const Vsk = require('./Vsk');

// User Relationships
User.belongsToMany(Office, { through: UserOffice, foreignKey: 'user_id', as: 'Offices' });
User.belongsToMany(Role, { 
  through: {
    model: ModelHasRole,
    scope: { model_type: 'App\\Models\\User' }
  }, 
  foreignKey: 'model_id', 
  otherKey: 'role_id', 
  as: 'Roles',
  constraints: false
});
User.hasMany(Attendance, { foreignKey: 'user_id' });
User.hasMany(Device, { foreignKey: 'user_id' });
User.hasMany(AppealAttendance, { foreignKey: 'user_id' });
User.hasMany(FcmToken, { foreignKey: 'user_id' });
User.hasMany(LateList, { foreignKey: 'user_id' });
User.hasMany(PostingRequest, { foreignKey: 'user_id' });
User.hasMany(Report, { foreignKey: 'user_id' });
User.hasMany(Vsk, { foreignKey: 'user_id' });

// Office Relationships
Office.belongsTo(District, { foreignKey: 'district_id' });
Office.belongsToMany(User, { through: UserOffice, foreignKey: 'office_id', as: 'Users' });
Office.hasMany(Attendance, { foreignKey: 'office_id' });
Office.hasMany(AppealAttendance, { foreignKey: 'office_id' });
Office.hasOne(QrCode, { foreignKey: 'office_id' });
Office.hasMany(LateList, { foreignKey: 'office_id' });
Office.hasMany(NotificationMessage, { foreignKey: 'office_id' });
Office.hasMany(PostingRequest, { foreignKey: 'office_id' });
Office.hasMany(Vsk, { foreignKey: 'office_id' });

// District Relationships
District.hasMany(Office, { foreignKey: 'district_id' });

// Attendance Relationships
Attendance.belongsTo(User, { foreignKey: 'user_id' });
Attendance.belongsTo(Office, { foreignKey: 'office_id' });
Attendance.belongsTo(Device, { foreignKey: 'device_id' });
Attendance.hasMany(AppealAttendance, { foreignKey: 'attendance_id', as: 'Appeals' });

// Device Relationships
Device.belongsTo(User, { foreignKey: 'user_id' });

// AppealAttendance Relationships
AppealAttendance.belongsTo(User, { foreignKey: 'user_id' });
AppealAttendance.belongsTo(Office, { foreignKey: 'office_id' });
AppealAttendance.belongsTo(Attendance, { foreignKey: 'attendance_id', as: 'Attendance' });

// QrCode Relationships
QrCode.belongsTo(Office, { foreignKey: 'office_id' });

// Role Relationships
Role.belongsToMany(User, {
  through: {
    model: ModelHasRole,
    scope: { model_type: 'App\\Models\\User' }
  },
  foreignKey: 'role_id',
  otherKey: 'model_id',
  as: 'Users',
  constraints: false
});

// Attachment Relationships
Attachment.belongsTo(NotificationMessage, { foreignKey: 'notification_message_id' });

// FcmToken Relationships
FcmToken.belongsTo(User, { foreignKey: 'user_id' });

// LateList Relationships
LateList.belongsTo(User, { foreignKey: 'user_id' });
LateList.belongsTo(Office, { foreignKey: 'office_id' });

// NotificationMessage Relationships
NotificationMessage.belongsTo(Office, { foreignKey: 'office_id' });
NotificationMessage.hasMany(Attachment, { foreignKey: 'notification_message_id' });

// PostingRequest Relationships
PostingRequest.belongsTo(User,   { foreignKey: 'user_id',   as: 'User' });
PostingRequest.belongsTo(Office, { foreignKey: 'office_id', as: 'Office' });

// Report Relationships
Report.belongsTo(User, { foreignKey: 'user_id' });

// Vsk Relationships
Vsk.belongsTo(User, { foreignKey: 'user_id' });
Vsk.belongsTo(Office, { foreignKey: 'office_id' });

module.exports = {
  sequelize,
  User,
  District,
  Office,
  Attendance,
  Device,
  AppealAttendance,
  QrCode,
  UserOffice,
  Role,
  ModelHasRole,
  Attachment,
  FcmToken,
  LateList,
  NotificationMessage,
  Otp,
  Page,
  PostingRequest,
  Report,
  Vsk
};

