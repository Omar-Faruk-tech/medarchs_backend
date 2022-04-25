var express = require("express");
var router = express.Router();
const { bookingsController } = require("../controllers/bookings");
const { jwtAuth } = require("../middleware/auth");

/* create new record. */
// router.post("/create", jwtAuth.patientVerifyToken, bookingsController.create);

/* GET users listing. */
router.get("/getall", jwtAuth.adminVerifyToken, 
bookingsController.getAll);

router.get("/patient", jwtAuth.generalVerifyToken, 
bookingsController.getbyPatientId);

router.get("/doctor", jwtAuth.generalVerifyToken, 
bookingsController.getbyDoctorId);



/* GET each booking by Id. */
router.get(
  "/:id",
  jwtAuth.generalVerifyToken,
  bookingsController.getByBookingId
);

/* GET each booking by userID. */

router.get(
  "/userBookings",
  jwtAuth.generalVerifyToken,
  bookingsController.getByBookingId
);


/* Update user record by id. */
router.put("/update/:id", jwtAuth.patientVerifyToken, bookingsController.update);

/* Update user record by id. */
router.post("/create-booking", jwtAuth.patientVerifyToken, bookingsController.createBooking);


/* Delete user by id. */
router.delete("/delete/:id", jwtAuth.patientVerifyToken, bookingsController.delete);

module.exports = router;
