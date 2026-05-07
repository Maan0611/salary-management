const db = require("../db");

const getAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const searchDate = date || new Date().toLocaleDateString('en-CA');
    
    // Fetch all employees and their attendance for the specified date
    const [rows] = await db.promise().query(`
      SELECT 
        e.id, e.name, e.department, e.position, e.emp_id,
        a.id as attendance_id, a.status, a.check_in, a.check_out, a.notes
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.emp_id AND a.date = ?
    `, [searchDate]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const saveAttendance = async (req, res) => {
  try {
    const { attendanceData, date } = req.body;
    const saveDate = date || new Date().toLocaleDateString('en-CA');

    for (const record of attendanceData) {
      const { emp_id, status, check_in, check_out, notes } = record;

      // Check if record exists
      const [existing] = await db.promise().query(
        "SELECT id FROM attendance WHERE emp_id = ? AND date = ?",
        [emp_id, saveDate]
      );

      if (existing.length > 0) {
        await db.promise().query(
          "UPDATE attendance SET status = ?, check_in = ?, check_out = ?, notes = ? WHERE id = ?",
          [status, check_in || null, check_out || null, notes || null, existing[0].id]
        );
      } else {
        await db.promise().query(
          "INSERT INTO attendance (emp_id, date, status, check_in, check_out, notes) VALUES (?, ?, ?, ?, ?, ?)",
          [emp_id, saveDate, status, check_in || null, check_out || null, notes || null]
        );
      }
    }

    res.json({ message: "Attendance saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, check_in, check_out, notes } = req.body;

    await db.promise().query(
      "UPDATE attendance SET status = ?, check_in = ?, check_out = ?, notes = ? WHERE id = ?",
      [status, check_in || null, check_out || null, notes || null, id]
    );

    res.json({ message: "Attendance updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkIn = async (req, res) => {
  try {
    const emp_id = req.user.id;
    if (!emp_id) {
      return res.status(401).json({ message: "Employee ID missing in token" });
    }

    const date = new Date().toISOString().slice(0, 10);
    // MySQL TIME type expects HH:MM:SS format
    const check_in = new Date().toLocaleTimeString('en-GB', { hour12: false });

    // Verify if already checked in
    const [existing] = await db.promise().query(
      "SELECT id, status, check_in FROM attendance WHERE emp_id = ? AND date = ?",
      [emp_id, date]
    );

    if (existing && existing.length > 0) {
      if (existing[0].check_in) {
        return res.status(400).json({ message: "You have already checked in for today." });
      }
      // If record exists (e.g. marked Absent by admin) but no check_in time, allow check-in
      await db.promise().query(
        "UPDATE attendance SET status = 'Present', check_in = ? WHERE id = ?",
        [check_in, existing[0].id]
      );
    } else {
      // Insert new record
      await db.promise().query(
        "INSERT INTO attendance (emp_id, date, status, check_in) VALUES (?, ?, 'Present', ?)",
        [emp_id, date, check_in]
      );
    }

    console.log(`Success: Employee ${emp_id} checked in at ${check_in} on ${date}`);
    res.json({ message: "Checked in successfully" });
  } catch (err) {
    console.error("Check-in Error:", err);
    res.status(500).json({ 
      message: "Database synchronization failed. Please try again or contact IT.",
      error: err.message 
    });
  }
};

const checkOut = async (req, res) => {
  try {
    const emp_id = req.user.id;
    if (!emp_id) {
      return res.status(401).json({ message: "Employee ID missing in token" });
    }

    const date = new Date().toISOString().slice(0, 10);
    const check_out = new Date().toLocaleTimeString('en-GB', { hour12: false });

    // Verify if already checked in today
    const [existing] = await db.promise().query(
      "SELECT id, check_out FROM attendance WHERE emp_id = ? AND date = ?",
      [emp_id, date]
    );

    if (!existing || existing.length === 0) {
      return res.status(400).json({ message: "You haven't checked in for today yet." });
    }

    if (existing[0].check_out) {
      return res.status(400).json({ message: "You have already checked out for today." });
    }

    // Update record with check-out time
    await db.promise().query(
      "UPDATE attendance SET check_out = ? WHERE id = ?",
      [check_out, existing[0].id]
    );

    console.log(`Success: Employee ${emp_id} checked out at ${check_out} on ${date}`);
    res.json({ message: "Checked out successfully" });
  } catch (err) {
    console.error("Check-out Error:", err);
    res.status(500).json({ 
      message: "Database synchronization failed. Please try again or contact IT.",
      error: err.message 
    });
  }
};

module.exports = { getAttendance, saveAttendance, updateAttendance, checkIn, checkOut };
