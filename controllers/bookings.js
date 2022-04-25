const { compareSync } = require("bcryptjs");
const booking = require("../models/booking");
const calendar = require("../models/calendar");

const db = require("../models/index");
const users = db.user;
const { constants } = require("./constants");
const bookings = db.booking;
const calendardb = db.calendar;

exports.bookingsController = {
  createBooking: (req, res) => {
    let date = req.body.date;
    date = date.split("-")[2];
    let time = req.body.time;
    let department = req.body.department;
    console.log(date)

    req.body.userId = req.userId;
    let doctorsNameArr = [];
    users
      .findAll()
      .then((data) => {
        data.forEach((user) => {
          if (user.userType === "doctor") {
            doctorsNameArr.push({
              name: user.fullName,
              id: user.id,
              contact: user.phone
            });
          }
        });
        // console.log(doctorsNameArr)
      })
      .catch((err) => {
        constants.handleErr(err, res);
      });

    bookings
      .findAll()
      .then((data) => {
        let appointmentsArr = [];
        data.forEach((booking) => {
          appointmentsArr.push(booking.userId);
        });
        // console.log(appointmentsArr)
        // if(!(appointmentsArr.includes(req.body.userId))){
        calendardb
          .findAll()
          .then((data) => {
            let doctors = [];
            data.forEach((element) => {
              if (
                element[date].includes(time) &&
                element.department == department
              ) {
                doctors.push(element.userId);
                // console.log(doctors);
              }
            });
            const randomDoctorId =
              doctors[Math.floor(Math.random() * doctors.length)];
            let selectedDoctor = {};
            for (let i = 0; i < doctorsNameArr.length; i++) {
              if (randomDoctorId == doctorsNameArr[i].id) {
                (selectedDoctor.fullName = doctorsNameArr[i].name),
                  (selectedDoctor.id = doctorsNameArr[i].id),
                  (selectedDoctor.contact = doctorsNameArr[i].contact)
              }
            }
            console.log(selectedDoctor);
            req.body.doctorName = selectedDoctor.fullName;
            req.body.doctorContact = selectedDoctor.contact;
            users
              .findOne({
                where: {
                  id: req.body.userId
                }
              })
              .then((data) => {
                req.body.patientName = data.fullName;
                req.body.patientContact = data.phone;
              })
            calendardb
              .findOne({
                where: {
                  userId: randomDoctorId,
                },
              })
              .then((data) => {
                let oldTime = data.dataValues[date];
                let oldTimeArr = oldTime.split(" ");
                let pickedTimeIndex = oldTimeArr.indexOf(time);
                oldTimeArr.splice(pickedTimeIndex, 1);
                let remainingTime = oldTimeArr.join(" ");
                req.body.time = remainingTime;
                let newReqObj = {};
                newReqObj.doctorId = randomDoctorId;
                newReqObj[date] = remainingTime;
                if (data[date].includes(time)) {
                  calendardb
                    .update(newReqObj, {
                      where: {
                        userId: newReqObj.doctorId,
                      },
                    })
                    .then((data) => {
                      if (data[0] !== 1) {
                        res.status(404).send({
                          message:
                            "Could not create appointment; Date/ time unavailable",
                        });
                      } else {
                        req.body.time = time;
                        req.body.status = "Pending";
                        req.body.doctorId = randomDoctorId;
                        // delete req.body.id;
                        bookings
                          .create(req.body, {
                            include: {
                              model: users,
                              attributes: ["userId"],
                            },
                          })
                          .then((date) => {
                            res.status(200).send({
                              status: true,
                              message: "appointment booked successfully",
                              doctor: selectedDoctor,
                            });
                          })
                          .catch((err) => {
                            constants.handleErr(err, res);
                            console.log(err);
                          });
                      }
                    })
                    .catch((err) => {
                      constants.handleErr(err, res);
                      console.log(err);
                    });
                } else {
                  res.status(404).send({
                    message:
                      "Could not create appointment; Date/ time unavailable",
                  });
                }
              })
              .catch((err) => {
                res.status(404).send({
                  message:
                    "Could not create appointment; Date/ time unavailable",
                });
              });
          })
          .catch((err) => {
            res.status(404).send({
              message: "Could not create appointment; Date/ time unavailable",
            });
          });
      })
      .catch((err) => {
        res.status(404).send({
          message: "Could not create appointment; Date/ time unavailable",
        });
      });
    // if(calendardb){}
  },

  getAll: (req, res) => {
    bookings
      .findAll({
        include: {
          model: db.user,
        },
      })
      .then((data) => {
        res.status(200).send({
          success: true,
          message: "All Bookings Retrieved successfully",
          data,
        });
      })
      .catch((err) => {
        res.status(400).send({
          message: err.message || "Could not find record",
        });
      });
  },

  getByBookingId: (req, res) => {
    bookings
      .findOne({
        where: {
          Id: req.params.id,
        },
        include: {
          model: db.user,
        },
      })
      .then((data) => {
        if (!data) {
          res.status(400).send({
            message: "Record not found",
          });
        } else if (req.userId != data.userId) {
          res.status(400).send({
            message: "Unauthorised Access",
          });
        }
        res.status(200).send(data);
      })
      .catch((err) => {
        res.status(400).send({
          message: err.message || "Could not find record",
        });
      });
  },

  getbyPatientId: (req, res) => {
    bookings
      .findAll({
        where: {
          userId: req.userId,
        }
      })
      .then((data) => {
        if (!data) {
          res.status(400).send({
            message: "Record not found",
          });
        }
        res.status(200).send(data);
      })
      .catch((err) => {
        res.status(400).send({
          message: err.message || "Could not find record",
        });
      });
  },

   getbyDoctorId: (req, res) => {
    bookings
      .findAll({
        where: {
          doctorId: req.userId,
        }
      })
      .then((data) => {
        if (!data) {
          res.status(400).send({
            message: "Record not found",
          });
        }
        res.status(200).send(data);
      })
      .catch((err) => {
        res.status(400).send({
          message: err.message || "Could not find record",
        });
      });
  },

  update: (req, res) => {
    const booking = req.body;
    bookings
      .update(booking, {
        where: {
          id: req.params.id,
        },
      })
      .then((data) => {
        if (data[0] !== 1) {
          res.status(400).send({
            message: "Record not found",
          });
        }
        res.status(200).send({ message: "Record Updated" });
      })
      .catch((err) => {
        constants.handleErr(err, res);
      });
  },

  delete: (req, res) => {
    bookings
      .destroy({
        where: {
          id: req.userId,
        },
      })
      .then((data) => {
        if (data[0] !== 1) {
          res.status(400).send({
            message: "Record not found",
          });
        }
        res.status(200).send("Record Deleted");
      })
      .catch((err) => {
        res.status(400).send({
          message: err.message || "Could not be deleted",
        });
      });
  },
};
