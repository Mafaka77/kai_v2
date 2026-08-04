/**
 * Centralized Repository of Official & Restricted Holidays
 */

const DEFAULT_HOLIDAYS = [
  // --- 2024 HOLIDAYS ---
  { id: 'h-2024-01-01', title: "New Year's Day", date: '2024-01-01', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2024-01-02', title: "New Year Holiday", date: '2024-01-02', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2024-01-11', title: "Missionary Day", date: '2024-01-11', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2024-01-26', title: "Republic Day", date: '2024-01-26', type: 'holiday', notes: 'National Holiday' },
  { id: 'h-2024-02-20', title: "Statehood Day", date: '2024-02-20', type: 'holiday', notes: 'State Holiday' },
  { id: 'h-2024-03-01', title: "Chapchar Kut", date: '2024-03-01', type: 'holiday', notes: 'State Festival' },
  { id: 'h-2024-03-25', title: "Holi", date: '2024-03-25', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2024-03-29', title: "Good Friday", date: '2024-03-29', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2024-04-11', title: "Id-ul-Fitr", date: '2024-04-11', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2024-04-21', title: "Mahavir Jayanti", date: '2024-04-21', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2024-05-23', title: "Buddha Purnima", date: '2024-05-23', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2024-06-15', title: "YMA Day", date: '2024-06-15', type: 'holiday', notes: 'State Holiday' },
  { id: 'h-2024-06-17', title: "Id-ul-Zuha", date: '2024-06-17', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2024-06-30', title: "Remna Ni", date: '2024-06-30', type: 'holiday', notes: 'Peace Day' },
  { id: 'h-2024-07-06', title: "MHIP Day", date: '2024-07-06', type: 'holiday', notes: 'State Holiday' },
  { id: 'h-2024-07-17', title: "Muharram", date: '2024-07-17', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2024-08-15', title: "Independence Day", date: '2024-08-15', type: 'holiday', notes: 'National Holiday' },
  { id: 'h-2024-09-16', title: "Milad-un-Nabi", date: '2024-09-16', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2024-10-02', title: "Mahatma Gandhi Birthday", date: '2024-10-02', type: 'holiday', notes: 'National Holiday' },
  { id: 'h-2024-10-12', title: "Dussehra", date: '2024-10-12', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2024-10-31', title: "Diwali", date: '2024-10-31', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2024-11-15', title: "Guru Nanak Birthday", date: '2024-11-15', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2024-12-24', title: "Christmas Eve", date: '2024-12-24', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2024-12-25', title: "Christmas Day", date: '2024-12-25', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2024-12-26', title: "Boxing Day", date: '2024-12-26', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2024-12-31', title: "New Year's Eve", date: '2024-12-31', type: 'holiday', notes: 'Public Holiday' },

  // --- 2025 HOLIDAYS ---
  { id: 'h-2025-01-01', title: "New Year's Day", date: '2025-01-01', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2025-01-02', title: "New Year Holiday", date: '2025-01-02', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2025-01-11', title: "Missionary Day", date: '2025-01-11', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2025-01-26', title: "Republic Day", date: '2025-01-26', type: 'holiday', notes: 'National Holiday' },
  { id: 'h-2025-02-20', title: "Statehood Day", date: '2025-02-20', type: 'holiday', notes: 'State Holiday' },
  { id: 'h-2025-02-26', title: "Maha Shivratri", date: '2025-02-26', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2025-03-07', title: "Chapchar Kut", date: '2025-03-07', type: 'holiday', notes: 'State Festival' },
  { id: 'h-2025-03-14', title: "Holi", date: '2025-03-14', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2025-03-31', title: "Id-ul-Fitr", date: '2025-03-31', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2025-04-10', title: "Mahavir Jayanti", date: '2025-04-10', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2025-04-18', title: "Good Friday", date: '2025-04-18', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2025-05-12', title: "Buddha Purnima", date: '2025-05-12', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2025-06-07', title: "Id-ul-Zuha", date: '2025-06-07', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2025-06-15', title: "YMA Day", date: '2025-06-15', type: 'holiday', notes: 'State Holiday' },
  { id: 'h-2025-06-30', title: "Remna Ni", date: '2025-06-30', type: 'holiday', notes: 'Peace Day' },
  { id: 'h-2025-07-06', title: "MHIP Day", date: '2025-07-06', type: 'holiday', notes: 'State Holiday' },
  { id: 'h-2025-07-17', title: "Muharram", date: '2025-07-17', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2025-08-15', title: "Independence Day", date: '2025-08-15', type: 'holiday', notes: 'National Holiday' },
  { id: 'h-2025-08-16', title: "Janmashtami", date: '2025-08-16', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2025-09-05', title: "Milad-un-Nabi", date: '2025-09-05', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2025-10-02', title: "Mahatma Gandhi Birthday", date: '2025-10-02', type: 'holiday', notes: 'National Holiday' },
  { id: 'h-2025-10-20', title: "Dussehra", date: '2025-10-20', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2025-11-05', title: "Guru Nanak Birthday", date: '2025-11-05', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2025-12-24', title: "Christmas Eve", date: '2025-12-24', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2025-12-25', title: "Christmas Day", date: '2025-12-25', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2025-12-26', title: "Boxing Day", date: '2025-12-26', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2025-12-31', title: "New Year's Eve", date: '2025-12-31', type: 'holiday', notes: 'Public Holiday' },

  // --- 2026 HOLIDAYS ---
  { id: 'h-2026-01-01', title: "New Year's Day", date: '2026-01-01', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2026-01-02', title: "New Year Holiday", date: '2026-01-02', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2026-01-11', title: "Missionary Day", date: '2026-01-11', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2026-01-26', title: "Republic Day", date: '2026-01-26', type: 'holiday', notes: 'National Holiday' },
  { id: 'h-2026-02-20', title: "Statehood Day", date: '2026-02-20', type: 'holiday', notes: 'State Holiday' },
  { id: 'h-2026-03-04', title: "Chapchar Kut", date: '2026-03-04', type: 'holiday', notes: 'State Festival' },
  { id: 'h-2026-03-13', title: "Holi", date: '2026-03-13', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2026-03-21', title: "Id-ul-Fitr", date: '2026-03-21', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2026-03-26', title: "Rama Navami", date: '2026-03-26', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2026-03-31', title: "Mahavir Jayanti", date: '2026-03-31', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2026-04-03', title: "Good Friday", date: '2026-04-03', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2026-04-14', title: "Ambedkar Jayanti", date: '2026-04-14', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2026-05-01', title: "May Day / Labour Day", date: '2026-05-01', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2026-05-27', title: "Buddha Purnima", date: '2026-05-27', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2026-06-15', title: "YMA Day", date: '2026-06-15', type: 'holiday', notes: 'State Holiday' },
  { id: 'h-2026-06-26', title: "Id-ul-Zuha", date: '2026-06-26', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2026-06-30', title: "Remna Ni", date: '2026-06-30', type: 'holiday', notes: 'Peace Day' },
  { id: 'h-2026-07-06', title: "MHIP Day", date: '2026-07-06', type: 'holiday', notes: 'State Holiday' },
  { id: 'h-2026-08-15', title: "Independence Day", date: '2026-08-15', type: 'holiday', notes: 'National Holiday' },
  { id: 'h-2026-08-26', title: "Milad-un-Nabi", date: '2026-08-26', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2026-09-04', title: "Teachers' Day", date: '2026-09-04', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2026-10-02', title: "Mahatma Gandhi Birthday", date: '2026-10-02', type: 'holiday', notes: 'National Holiday' },
  { id: 'h-2026-10-20', title: "Dussehra", date: '2026-10-20', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2026-11-08', title: "Diwali", date: '2026-11-08', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2026-11-24', title: "Guru Nanak Birthday", date: '2026-11-24', type: 'restricted', notes: 'Restricted Holiday' },
  { id: 'h-2026-12-24', title: "Christmas Eve", date: '2026-12-24', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2026-12-25', title: "Christmas Day", date: '2026-12-25', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2026-12-26', title: "Boxing Day", date: '2026-12-26', type: 'holiday', notes: 'Public Holiday' },
  { id: 'h-2026-12-31', title: "New Year's Eve", date: '2026-12-31', type: 'holiday', notes: 'Public Holiday' }
];

/**
 * Array of date strings in 'DD-MM-YYYY' format for quick lookup
 */
const HOLIDAY_DATES_DD_MM_YYYY = DEFAULT_HOLIDAYS.map(h => {
  const [y, m, d] = h.date.split('-');
  return `${d}-${m}-${y}`;
});

/**
 * Array of date strings in 'YYYY-MM-DD' format
 */
const HOLIDAY_DATES_YYYY_MM_DD = DEFAULT_HOLIDAYS.map(h => h.date);

/**
 * Public / General Holiday dates only (DD-MM-YYYY)
 */
const PUBLIC_HOLIDAY_DATES_DD_MM_YYYY = DEFAULT_HOLIDAYS
  .filter(h => h.type === 'holiday')
  .map(h => {
    const [y, m, d] = h.date.split('-');
    return `${d}-${m}-${y}`;
  });

/**
 * Restricted Holiday dates only (DD-MM-YYYY)
 */
const RESTRICTED_HOLIDAY_DATES_DD_MM_YYYY = DEFAULT_HOLIDAYS
  .filter(h => h.type === 'restricted')
  .map(h => {
    const [y, m, d] = h.date.split('-');
    return `${d}-${m}-${y}`;
  });

module.exports = {
  DEFAULT_HOLIDAYS,
  HOLIDAY_DATES_DD_MM_YYYY,
  HOLIDAY_DATES_YYYY_MM_DD,
  PUBLIC_HOLIDAY_DATES_DD_MM_YYYY,
  RESTRICTED_HOLIDAY_DATES_DD_MM_YYYY
};
