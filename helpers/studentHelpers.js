let db = require('../config/connection');
const { getTimetable } = require('./hodHelpers');

module.exports = {

    doSignup: (loginData) => {
        console.log("Signup data:", loginData);

        const { name, course, sem, phone, email, password, dob, aadhar, gender } = loginData;
        return new Promise((resolve, reject) => {
            // SQL query to insert new user
            const query = `
                INSERT INTO students 
                (name, course, semester, phone, email, password, dob, aadhar, gender, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            // Execute the query
            db.query(
                query,
                [name, course, sem, phone, email, password, dob, aadhar, gender, 0],
                (err, results) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            // Duplicate email error
                            console.error('Duplicate email error:', err);
                            reject({ message: 'Email already exists. Please use a different email.' });
                        } else {
                            // Other database errors
                            console.error('Error inserting into database:', err);
                            return reject(new Error("An error occurred while processing your request. Please try again."));

                        }
                    } else {
                        resolve({ message: 'Signup successful!' });
                    }
                }
            );
        });
        // return new Promise((resolve, reject) => {
        //     // SQL query to insert new user
        //     const query = `
        //         INSERT INTO login_data 
        //         (name, type, course, semester, phone, email, password, dob, aadhar, gender, status) 
        //         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        //     `;

        //     // Execute the query
        //     db.query(
        //         query,
        //         [name, "student", course, sem, phone, email, password, dob, aadhar, gender, 0],
        //         (err, results) => {
        //             if (err) {
        //                 if (err.code === 'ER_DUP_ENTRY') {
        //                     // Duplicate email error
        //                     console.error('Duplicate email error:', err);
        //                     reject({ message: 'Email already exists. Please use a different email.' });
        //                 } else {
        //                     // Other database errors
        //                     console.error('Error inserting into database:', err);
        //                     return reject(new Error("An error occurred while processing your request. Please try again."));

        //                 }
        //             } else {
        //                 resolve({ message: 'Signup successful!' });
        //             }
        //         }
        //     );
        // });
    },

    doLogin: (loginData) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM students WHERE email = ?';
            db.query(query, [loginData.email], (err, data) => {
                if (err) {
                    console.error("Error querying login data:", err);
                    return reject(err);
                }
    
                if (data.length === 0) {
                    return resolve({ err: 'Email does not exist' });
                }
    
                const user = data[0]; // Retrieved user data
    
                if (loginData.password !== user.password) {
                    return resolve({ err: 'Password is incorrect' });
                }
    
                if (user.status !== 1) {
                    return resolve({ err: 'Account is inactive' });
                }
    
                // Successful login
                resolve({ err: false, data: user });
            });
        });     
        // return new Promise((resolve, reject) => {
        //     const query = 'SELECT * FROM login_data WHERE email = ?';
        //     db.query(query, [loginData.email], (err, data) => {
        //         if (err) {
        //             console.error("Error querying login_data:", err);
        //             reject(err);
        //         } else if (data.length === 0) {
        //             // No user found with the provided email
        //             resolve({ err: 'Email does not exist' });
        //         } else {

        //             const user = data[0]; // Retrieved user data
        //             // console.log('useru', user);
        //             if (loginData.password === user.password) {
        //                 if (user.type === "student") {
        //                     if (user.status === 1) {
        //                         resolve({ err: false, data: user });
        //                         // If the student is active, insert into the `students` table
        //                         // const insertQuery = `
        //                         //     INSERT IGNORE INTO students (name, email,year, department_id)
        //                         //     VALUES (?, ?, ?, ?)
        //                         // `;
        //                         // db.query(insertQuery, [user.name, user.email,user.year, user.department_id], (insertErr, insertResult) => {
        //                         //     if (insertErr) {
        //                         //         console.error("Error inserting into students table:", insertErr);
        //                         //         reject(insertErr);
        //                         //     } else {
        //                         //         resolve({ err: false, data: user });
        //                         //     }
        //                         // });
        //                     } else {
        //                         resolve({ err: 'Account is inactive' });
        //                     }
        //                 } else {
        //                     resolve({ err: 'Email does not exist' });
        //                 }
        //             } else {
        //                 resolve({ err: 'Password is incorrect' });
        //             }
        //         }
        //     });
        // });
    },
    getTimetable: (course, semester) => {
        return new Promise((resolve, reject) => {
            // Query to fetch the timetable for a specific course and semester
            db.query(
                "SELECT day, time, subject, teacher FROM timetable WHERE course = ? AND semester = ?",
                [course, semester],
                (err, data) => {
                    if (err) {
                        console.error("Error fetching student timetable:", err);
                        return reject(err);
                    }

                    const times = [...new Set(data.map(row => row.time))]; // Extract unique times

                    // Initialize an object to store the timetable data grouped by day
                    const timetable = {};

                    // Group subjects by day (without including time)
                    data.forEach(row => {
                        if (!timetable[row.day]) {
                            timetable[row.day] = [];  // Initialize an empty array for each day
                        }

                        // Add the subject and teacher for the current day
                        timetable[row.day].push({
                            subject: row.subject,
                            teacher: row.teacher
                        });
                    });

                    // Convert the grouped data into the desired format (array of objects)
                    const formattedTimetable = Object.keys(timetable).map(day => ({
                        day: day,
                        subjects: timetable[day]
                    }));

                    // Resolve with the structured timetable data
                    resolve({ times, timetable: formattedTimetable });
                }
            );
        });
    },
    getAttendance: (email) => {
        return new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM attendance WHERE email = ? ORDER BY date DESC",
                [email],
                (err, results) => {
                    if (err) {
                        return reject(err);
                    }
        
                    if (results.length > 0) {
                        const attendanceByMonth = {};
                        let totalMarkedDays = 0; // Total days with attendance records
                        let totalPresent = 0; // Count present and half-days
                        
                        results.forEach((row) => {
                            const originalDate = new Date(row.date);
                            const monthName = originalDate.toLocaleString("en-US", { month: "long" });
                            const year = originalDate.getFullYear();
                            const monthYearKey = `${monthName} ${year}`;
        
                            // Format the date to DD-MM-YYYY
                            const day = String(originalDate.getDate()).padStart(2, "0");
                            const formattedDate = `${day}-${String(originalDate.getMonth() + 1).padStart(2, "0")}-${year}`;
                            const dayName = originalDate.toLocaleString("en-US", { weekday: "long" });
        
                            if (!attendanceByMonth[monthYearKey]) {
                                attendanceByMonth[monthYearKey] = [];
                            }
        
                            attendanceByMonth[monthYearKey].push({
                                ...row,
                                formattedDate,
                                day: dayName,
                            });
        
                            // Count present and half-days
                            if (row.status === "present") {
                                totalPresent += 1;
                            } else if (row.status === "half") {
                                totalPresent += 0.5;
                            }
        
                            // Only count days where attendance was marked
                            if (row.status !== null) {
                                totalMarkedDays += 1;
                            }
                        });
        
                        // Calculate attendance percentage
                        const attendancePercentage = totalMarkedDays > 0 
                            ? ((totalPresent / totalMarkedDays) * 100).toFixed(2) 
                            : 0;
        
                        resolve({ 
                            attendanceByMonth, 
                            attendancePercentage 
                        });
                    } else {
                        resolve({ attendanceByMonth: {}, attendancePercentage: 0 });
                    }
                }
            );
        });
        
                
    },

    updateAttendanceReason: (email, date, reason) => {
        return new Promise((resolve, reject) => {
            // Input validation
            if (!email || typeof email !== 'string') {
                return reject(new Error("Invalid or missing email"));
            }
            if (!reason || typeof reason !== 'string') {
                return reject(new Error("Invalid or missing reason"));
            }
            if (!date) {
                return reject(new Error("Invalid or missing date"));
            }

            console.log("email:", email);
            console.log("date:", date);
            console.log("reason:", reason);

            // Parse the date into a Date object
            let parsedDate = new Date(date);

            // Check if the date is valid
            if (isNaN(parsedDate.getTime())) {
                return reject(new Error("Invalid date provided"));
            }

            // Convert the date to YYYY-MM-DD format
            const year = parsedDate.getFullYear();
            const month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const day = String(parsedDate.getDate()).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;
            console.log("formattedDate:", formattedDate);

            // Perform the database update query
            db.query(
                "UPDATE attendance SET reason = ? WHERE email = ? AND date = ?",
                [reason, email, formattedDate],
                (err, updateResult) => {
                    if (err) {
                        console.error("Error updating reason:", err);
                        return reject(new Error("Database query failed"));
                    }

                    console.log("Attendance reason updated successfully:", updateResult);
                    resolve(updateResult);
                }
            );
        });
    },
    getAllMonthAttendance: (email) => {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT * FROM attendance
            WHERE email = ?
            ORDER BY date
          `;

            db.query(query, [email], (err, results) => {
                if (err) {
                    return reject(err);
                }

                if (results.length === 0) {
                    return resolve({ months: [] });
                }

                const monthsMap = {};

                results.forEach((record) => {
                    const date = new Date(record.date);
                    const monthName = date.toLocaleString('en-US', { month: 'long' });
                    const day = date.getDate();
                    const monthYear = `${monthName} ${date.getFullYear()}`;

                    if (!monthsMap[monthYear]) {
                        monthsMap[monthYear] = {
                            month: monthYear,
                            attendance: Array(31).fill(null), // Initialize array for days in month
                            presentCount: 0,
                            halfCount: 0
                        };
                    }

                    // Assign attendance status for the day
                    monthsMap[monthYear].attendance[day - 1] = record.status;

                    // Count presence and half presence
                    if (record.status === 'present') {
                        monthsMap[monthYear].presentCount += 1;
                    } else if (record.status === 'half') {
                        monthsMap[monthYear].halfCount += 0.5;
                    }
                });

                // Calculate attendance percentage for each month
                const months = Object.values(monthsMap);

                months.forEach((month) => {
                    const totalDays = month.attendance.filter(status => status !== null).length;
                    const totalPresent = month.presentCount + month.halfCount;
                    const attendancePercentage = totalDays > 0 ? (totalPresent / totalDays) * 100 : 0;
                    month.attendancePercentage = Math.round(attendancePercentage * 100) / 100;
                });
                console.log("month", months);

                resolve({ months });
            });
        });
    },

    getMarks: (email) => {
        return new Promise((resolve, reject) => {
            db.query(
                "SELECT subject, marks FROM mark WHERE email = ?",
                [email],
                (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                }
            );
        });
    },
    getEvents: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM events', (err, results) => {
                if (err) {
                    return reject(err);
                }

                const formattedEvents = results.map(event => {
                    // Format eventDate as MM-DD-YYYY
                    const date = new Date(event.eventDate);
                    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getFullYear()}`;

                    // Return the event with the formatted date
                    return {
                        ...event,
                        eventDate: formattedDate
                    };
                });

                resolve(formattedEvents);
            });
        });
    },




}
