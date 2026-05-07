const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const categoryRoutes = require("./routes/Category");
const adminRoutes = require("./routes/Admin");

const pageRoutes = require("./routes/PageRoutes");

const notificationRoutes = require("./routes/Notification"); // New notification routes
const liveSessionRoutes = require("./routes/LiveSession"); // Live session routes
const mcqRoutes = require("./routes/MCQ"); // MCQ routes
const { servePdf } = require("./utils/pdfUploader");

dotenv.config();
const PORT = process.env.PORT || 4000;

//database connect
database.connect();
//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //for using postman
app.use(cookieParser());
app.use(
  cors({
    // origin: "http://localhost:8080",
    origin: "https://vidyagan-ai-server.onrender.com",
    // origin: "https://vidyagan-ai.com",
    // origin: "https://seccouncil.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);
//cloudinary connection
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);

app.use("/api/v1/category", categoryRoutes);

app.use("/api/v1/admin", adminRoutes);

app.use("/api/v1/pages", pageRoutes);

app.use("/api/v1/notifications", notificationRoutes); // New notification routes
app.use("/api/v1/live-sessions", liveSessionRoutes); // Live session routes
app.use("/api/v1/mcq", mcqRoutes); // MCQ routes

// PDF serving route
app.get("/uploads/:folder/:filename", servePdf);

//def route

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running....",
  });
});

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
