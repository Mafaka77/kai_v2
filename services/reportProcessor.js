const { Report, Office, User, Attendance, Device } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Monthly holidays (MM-DD) — skip weekends too
const HOLIDAYS = new Set([
  '01-01', '01-02', '01-11', '01-26', '02-20', '02-26', '03-07', '03-14', '03-31',
  '04-10', '04-18', '05-12', '06-07', '06-15', '06-30', '07-06', '07-17',
  '08-15', '08-16', '09-05', '10-02', '10-20', '11-05', '12-24', '12-25',
  '12-26', '12-31'
]);

const isOffDay = (m) => {
  const day = m.day();
  if (day === 0 || day === 6) return true;
  return HOLIDAYS.has(m.format('MM-DD'));
};

const COL_HEADERS = [
  { header: 'Employment Code', key: 'emp_no',    width: 18 },
  { header: 'Full Name',        key: 'full_name', width: 26 },
  { header: 'Designation',      key: 'desig',     width: 22 },
  { header: 'Mobile',           key: 'mobile',    width: 16 },
  { header: 'Office',           key: 'office',    width: 24 },
  { header: 'Signin Time',      key: 'signin',    width: 20 },
  { header: 'Signout Time',     key: 'signout',   width: 20 },
  { header: 'Device',           key: 'device',    width: 18 },
  { header: 'Present/Status',   key: 'status',    width: 16 },
  { header: 'Remarks',          key: 'remarks',   width: 28 },
];

const STATUS_FILLS = {
  Present:         { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9F2E6' } },
  Late:            { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } },
  ABSENT:          { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE8E8' } },
  'HOLIDAY/WEEKEND': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEF7' } },
};

const processReportGeneration = async ({ reportId, officeId, fromDate, toDate }) => {
  const reportRecord = await Report.findByPk(reportId);
  if (!reportRecord) throw new Error(`Report record ${reportId} not found`);

  try {
    await reportRecord.update({ status: 'Processing' });

    const office = await Office.findByPk(officeId);
    if (!office) throw new Error(`Office ${officeId} not found`);

    const start = moment(fromDate, 'YYYY-MM-DD');
    const end   = moment(toDate,   'YYYY-MM-DD');

    // Ensure uploads output directory exists
    const reportsDir = path.join(__dirname, '../uploads/reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    const fileName   = `report_${Date.now()}.xlsx`;
    const filePath   = path.join(reportsDir, fileName);
    const publicPath = `/uploads/reports/${fileName}`;

    // Fetch all users in this office
    const users = await User.findAll({
      include: [{ model: Office, as: 'Offices', required: true, where: { id: office.id } }],
      order: [['employee_no', 'ASC'], ['id', 'ASC']]
    });

    // Fetch all attendance rows in range — explicit attributes so Sequelize
    // never auto-includes FK columns (e.g. appeal_attendance_id) that don't
    // exist in the live database.
    const attendances = await Attendance.findAll({
      attributes: ['id', 'user_id', 'office_id', 'device_id', 'signin_at', 'signout_at', 'type', 'in_remark'],
      where: {
        office_id: office.id,
        signin_at: {
          [Op.between]: [
            start.clone().startOf('day').toDate(),
            end.clone().endOf('day').toDate()
          ]
        }
      },
      include: [{ model: Device, attributes: ['id', 'name'] }]
    });

    // Build lookup map: { 'YYYY-MM-DD': { userId: Attendance } }
    const attMap = {};
    attendances.forEach(att => {
      const d = moment(att.signin_at).format('YYYY-MM-DD');
      if (!attMap[d]) attMap[d] = {};
      attMap[d][att.user_id] = att;
    });

    // Build Excel workbook — one sheet per calendar day in range
    const workbook = new ExcelJS.Workbook();
    workbook.creator  = 'EHMS';
    workbook.created  = new Date();

    let curr = start.clone();
    while (curr.isSameOrBefore(end, 'day')) {
      const dStr  = curr.format('YYYY-MM-DD');
      const label = curr.format('DD-MM-YYYY');

      const sheet = workbook.addWorksheet(label);

      // Header row styling
      sheet.columns = COL_HEADERS;
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3949AB' } };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      headerRow.height = 22;
      headerRow.commit();

      const dayOff = isOffDay(curr);

      users.forEach(u => {
        const att = attMap[dStr]?.[u.id] || null;

        let statusText = 'ABSENT';
        let signin  = '';
        let signout = '';
        let device  = '';
        let remarks = '';

        if (dayOff) {
          statusText = 'HOLIDAY/WEEKEND';
        } else if (att) {
          statusText = att.type === 'present' ? 'Present' : (att.type ? att.type.charAt(0).toUpperCase() + att.type.slice(1) : 'Present');
          signin  = att.signin_at  ? moment(att.signin_at).format('DD-MM-YYYY hh:mm A')  : '';
          signout = att.signout_at ? moment(att.signout_at).format('DD-MM-YYYY hh:mm A') : '';
          device  = att.Device     ? att.Device.name : '';
          remarks = att.in_remark  || '';
        }

        const row = sheet.addRow({
          emp_no:    u.employee_no  || '',
          full_name: u.full_name,
          desig:     u.designation  || 'Staff',
          mobile:    u.mobile       || '',
          office:    office.name,
          signin,
          signout,
          device,
          status:    statusText,
          remarks
        });

        // Apply row fill based on status
        const fill = STATUS_FILLS[statusText];
        if (fill) {
          row.eachCell(cell => {
            cell.fill = fill;
          });
        }

        row.alignment  = { vertical: 'middle' };
        row.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
        row.commit();
      });

      // Auto-freeze top header row
      sheet.views = [{ state: 'frozen', ySplit: 1 }];

      curr.add(1, 'day');
    }

    await workbook.xlsx.writeFile(filePath);

    await reportRecord.update({ path: publicPath, status: 'Completed' });
    console.log(`[ReportProcessor] Report ${reportId} written to ${filePath}`);

    return reportRecord;
  } catch (err) {
    await reportRecord.update({ status: 'Failed' });
    console.error(`[ReportProcessor] Failed report ${reportId}:`, err.message);
    throw err;
  }
};

module.exports = { processReportGeneration };
