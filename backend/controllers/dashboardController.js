const db = require('../db');

exports.getDepartments = async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT DISTINCT department FROM employees WHERE department IS NOT NULL AND department != ''");
        res.json(rows.map(r => r.department));
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getStats = async (req, res) => {
  try {
    const stats = {};

    // 1. Total Employees
    const [empCount] = await db.promise().query("SELECT COUNT(*) as count FROM employees");
    stats.totalEmployees = empCount[0].count;

    // 2. Attendance Today
    const [attendance] = await db.promise().query(
      "SELECT status, COUNT(*) as count FROM attendance WHERE date = CURDATE() GROUP BY status"
    );
    stats.presentToday = attendance.find(a => a.status === 'Present')?.count || 0;
    stats.absentToday = attendance.find(a => a.status === 'Absent')?.count || 0;

    // 2b. Employees on Leave Today (Approved requests where today is within range)
    const [onLeave] = await db.promise().query(`
      SELECT e.name, e.department, r.request_type as type 
      FROM requests r
      JOIN employees e ON r.employee_id = e.id
      WHERE r.status = 'Approved' 
      AND CURDATE() BETWEEN r.from_date AND r.to_date
    `);
    stats.onLeaveToday = onLeave.length;
    stats.employeesOnLeave = onLeave;

    // 3. Total Departments
    const [deptCount] = await db.promise().query("SELECT COUNT(DISTINCT department) as count FROM employees");
    stats.totalDepartments = deptCount[0].count;

    // 4. Monthly Salary Expense / Budget (Sum of basic salary for active employees)
    const currentMonthNum = (new Date().getMonth() + 1).toString().padStart(2, '0'); // "04"
    const currentYear = new Date().getFullYear().toString();

    const [salaryExpense] = await db.promise().query(
      "SELECT SUM(basic_salary) as total FROM employees WHERE status = 'Active'"
    );
    stats.monthlySalaryExpense = salaryExpense[0].total || 0;

    // 5. Pending Salaries (Records with 'Pending' status)
    const [pendingSalaries] = await db.promise().query(
      "SELECT COUNT(*) as count FROM salary WHERE month = ? AND year = ? AND status != 'Paid'",
      [currentMonthNum, currentYear]
    );
    stats.pendingSalaries = pendingSalaries[0].count;

    // 6. Monthly Salary Expense Bar Chart (Last 6 months from SALARY table)
    const [monthlyTrend] = await db.promise().query(
      "SELECT month, SUM(net_salary) as amount FROM salary WHERE status = 'Paid' GROUP BY month, year ORDER BY year DESC, CAST(month AS UNSIGNED) DESC LIMIT 6"
    );
    
    // Format numeric months to names for the chart
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    stats.monthlySalaryTrend = monthlyTrend.reverse().map(item => ({
        month: monthNames[parseInt(item.month) - 1],
        amount: item.amount
    }));

    // 7. Department Wise Employee Count
    const [deptWise] = await db.promise().query(
      "SELECT department as name, COUNT(*) as value FROM employees GROUP BY department"
    );
    stats.departmentWise = deptWise;

    // 8. Recent Notifications (Keep fallback if table empty)
    const [notifications] = await db.promise().query(
      "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5"
    );
    stats.notifications = notifications.length > 0 ? notifications : [
        { message: "New payroll generated for April", created_at: new Date() },
        { message: "Employee attendance marked today", created_at: new Date() }
    ];

    // 9. Latest Announcements
    const [announcements] = await db.promise().query(
      "SELECT * FROM announcements ORDER BY created_at DESC LIMIT 5"
    );
    stats.announcements = announcements;

    res.json(stats);
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

exports.getSystemHealth = async (req, res) => {
  try {
    // Query REAL MySQL table sizes from information_schema (in MB)
    const [tableSizes] = await db.promise().query(`
      SELECT 
        table_name AS tableName,
        ROUND((data_length + index_length) / 1024 / 1024, 3) AS sizeMB,
        table_rows AS approxRows
      FROM information_schema.TABLES
      WHERE table_schema = DATABASE()
      ORDER BY (data_length + index_length) DESC
    `);

    // Total used MB across all tables
    const totalUsedMB = tableSizes.reduce((sum, t) => sum + parseFloat(t.sizeMB || 0), 0);

    // Get actual DB size allocated on disk (data + index + free space)
    const [dbSize] = await db.promise().query(`
      SELECT 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 3) AS usedMB,
        ROUND(SUM(data_free) / 1024 / 1024, 3) AS freeMB
      FROM information_schema.TABLES
      WHERE table_schema = DATABASE()
    `);

    const usedMB = parseFloat(dbSize[0].usedMB || 0);
    const freeMB = parseFloat(dbSize[0].freeMB || 0);
    const totalAllocatedMB = Math.round((usedMB + freeMB) * 100) / 100;

    // Capacity: 500 MB baseline for a small enterprise app
    const CAPACITY_MB = 500;
    const usedPercent = Math.min(Math.round((usedMB / CAPACITY_MB) * 100), 100);

    // Map to friendly display names
    const tableLabels = {
      employees: 'Employees',
      salary: 'Salary Records',
      attendance: 'Attendance Logs',
      requests: 'Requests',
      announcements: 'Announcements',
      notifications: 'Notifications',
    };

    // Only show our app tables in breakdown, not system tables
    const appTables = tableSizes
      .filter(t => tableLabels[t.tableName])
      .map(t => ({
        label: tableLabels[t.tableName] || t.tableName,
        sizeMB: parseFloat(t.sizeMB),
        rows: parseInt(t.approxRows || 0),
      }));

    res.json({
      usedMB,
      freeMB,
      totalAllocatedMB,
      capacityMB: CAPACITY_MB,
      usedPercent,
      tableStats: appTables,
      status: usedPercent < 60 ? 'Healthy' : usedPercent < 85 ? 'Warning' : 'Critical',
      isRealData: true,
    });
  } catch (err) {
    console.error("System Health Error:", err);
    res.status(500).json({ error: "Failed to fetch system health" });
  }
};
