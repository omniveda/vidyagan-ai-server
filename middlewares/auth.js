// // Importing required modules
// const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv");
// const User = require("../models/User");
// // Configuring dotenv to load environment variables from .env file
// dotenv.config();

// // This function is used as middleware to authenticate user requests
// exports.auth = async (req, res, next) => {
// 	try {
// 		// Extracting JWT from request cookies, body or header
// 		const token =
// 			req.cookies.token ||
// 			req.body.token ||
// 			req.header("Authorization").replace("Bearer ", "");

// 		// If JWT is missing, return 401 Unauthorized response
// 		if (!token) {
// 			return res.status(401).json({ success: false, message: `Token Missing` });
// 		}

// 		try {
// 			// Verifying the JWT using the secret key stored in environment variables
// 			const decode = await jwt.verify(token, process.env.JWT_SECRET);
// 			console.log(decode);
// 			// Storing the decoded JWT payload in the request object for further use
// 			req.user = decode;
// 		} catch (error) {
// 			// If JWT verification fails, return 401 Unauthorized response
// 			return res
// 				.status(401)
// 				.json({ success: false, message: "token is invalid" });
// 		}

// 		// If JWT is valid, move on to the next middleware or request handler
// 		next();
// 	} catch (error) {
// 		// If there is an error during the authentication process, return 401 Unauthorized response
// 		return res.status(401).json({
// 			success: false,
// 			message: `Something Went Wrong While Validating the Token`,
// 		});
// 	}
// };
// exports.isStudent = async (req, res, next) => {
// 	try {
// 		const userDetails = await User.findOne({ email: req.user.email });

// 		if (userDetails.accountType !== "Student") {
// 			return res.status(401).json({
// 				success: false,
// 				message: "This is a Protected Route for Students",
// 			});
// 		}
// 		next();
// 	} catch (error) {
// 		return res
// 			.status(500)
// 			.json({ success: false, message: `User Role Can't be Verified` });
// 	}
// };
// exports.isAdmin = async (req, res, next) => {
// 	try {
// 		const userDetails = await User.findOne({ email: req.user.email });

// 		if (userDetails.accountType !== "Admin") {
// 			return res.status(401).json({
// 				success: false,
// 				message: "This is a Protected Route for Admin",
// 			});
// 		}
// 		next();
// 	} catch (error) {
// 		return res
// 			.status(500)
// 			.json({ success: false, message: `User Role Can't be Verified` });
// 	}
// };
// exports.isInstructor = async (req, res, next) => {
// 	try {
// 		const userDetails = await User.findOne({ email: req.user.email });
// 		console.log(userDetails);

// 		console.log(userDetails.accountType);

// 		if (userDetails.accountType !== "Instructor") {
// 			return res.status(401).json({
// 				success: false,
// 				message: "This is a Protected Route for Instructor",
// 			});
// 		}
// 		next();
// 	} catch (error) {
// 		return res
// 			.status(500)
// 			.json({ success: false, message: `User Role Can't be Verified` });
// 	}
// };

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const User = require("../models/User");

dotenv.config();

// Hardcoded Admin Credentials
const adminEmail = "msk1events0236@gmail.com";
const adminPassword = "1234"; // You can hash this password if necessary

// Middleware for authenticating JWT tokens

async function createAdmin() {
  try {
    // Check if the admin already exists
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log("Admin already exists in the database.");
      return;
    }

    // Hash the admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create the admin user with required fields
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      accountType: "Admin", // Ensure the accountType is Admin
      firstName: "Admin", // Provide a default first name
      lastName: "User", // Provide a default last name
      additionalDetails: "Admin account", // Provide default additional details
    });

    // Save the admin user to the database
    await adminUser.save();
    console.log("Admin user created successfully.");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

// Call the function to create the admin user
createAdmin();

exports.auth = async (req, res, next) => {
  try {
    // Extracting JWT from request cookies, body, or header
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization").replace("Bearer ", "");

    // If JWT is missing, return 401 Unauthorized response
    if (!token) {
      return res.status(401).json({ success: false, message: "Token Missing" });
    }

    try {
      // Verifying the JWT using the secret key stored in environment variables
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      // Storing the decoded JWT payload in the request object for further use
      req.user = decode;
    } catch (error) {
      // If JWT verification fails, return 401 Unauthorized response
      return res
        .status(401)
        .json({ success: false, message: "Token is invalid" });
    }

    // If JWT is valid, move on to the next middleware or request handler
    next();
  } catch (error) {
    // If there is an error during the authentication process, return 401 Unauthorized response
    return res.status(401).json({
      success: false,
      message: "Something Went Wrong While Validating the Token",
    });
  }
};

// Middleware for logging in an admin or regular user

// claude

// exports.auth = async (req, res, next) => {
//   try {
//     // Add detailed logging
//     console.log("Cookies:", req.cookies);
//     console.log("Authorization header:", req.header("Authorization"));

//     // Extracting JWT from request cookies, body, or header with better error handling
//     let token = null;

//     if (req.cookies && req.cookies.token) {
//       token = req.cookies.token;
//       console.log("Using token from cookies");
//     } else if (req.body && req.body.token) {
//       token = req.body.token;
//       console.log("Using token from request body");
//     } else if (req.header("Authorization")) {
//       // Handle different authorization header formats
//       const authHeader = req.header("Authorization");
//       console.log("Auth header format:", authHeader);

//       if (authHeader.startsWith("Bearer ")) {
//         token = authHeader.replace("Bearer ", "");
//       } else {
//         token = authHeader; // Try using the header value directly
//       }
//       console.log("Using token from Authorization header");
//     }

//     console.log("Token found:", token ? "Yes" : "No");

//     // If JWT is missing, return 401 Unauthorized response
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required. Please log in.",
//       });
//     }

//     try {
//       // Verifying the JWT using the secret key stored in environment variables
//       const decode = await jwt.verify(token, process.env.JWT_SECRET);
//       console.log("Decoded token:", decode);

//       // Storing the decoded JWT payload in the request object for further use
//       req.user = decode;
//     } catch (error) {
//       console.error("Token verification error:", error);
//       // If JWT verification fails, return 401 Unauthorized response
//       return res.status(401).json({
//         success: false,
//         message: "Invalid or expired token. Please log in again.",
//       });
//     }

//     // If JWT is valid, move on to the next middleware or request handler
//     next();
//   } catch (error) {
//     console.error("Auth middleware error:", error);
//     // If there is an error during the authentication process, return 401 Unauthorized response
//     return res.status(401).json({
//       success: false,
//       message: "Authentication error. Please try logging in again.",
//     });
//   }
// };
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  // Check if the email matches the hardcoded admin email
  if (email === adminEmail) {
    // Check if the password matches the hardcoded admin password
    if (password === adminPassword) {
      // Generate JWT for admin
      const token = jwt.sign(
        { email, accountType: "Admin" },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      // Return the JWT token for admin
      return res.status(200).json({
        success: true,
        token,
        message: "Admin login successful",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }
  }

  // If not admin, check in the database for other users
  const userDetails = await User.findOne({ email });
  if (!userDetails) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Compare the password
  const isPasswordMatch = await bcrypt.compare(password, userDetails.password);
  if (!isPasswordMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  // Generate JWT for the user
  const token = jwt.sign(
    { email: userDetails.email, accountType: userDetails.accountType },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Return JWT token for the user
  return res.status(200).json({
    success: true,
    token,
    message: "Login successful",
  });
};

// Middleware to check if the user is a Student

// claude

// exports.adminLogin = async (req, res) => {
//   const { email, password } = req.body;

//   // Check if the email matches the hardcoded admin email
//   if (email === adminEmail) {
//     // Check if the password matches the hardcoded admin password
//     if (password === adminPassword) {
//       // Generate JWT for admin - match the format of the user tokens
//       const token = jwt.sign(
//         {
//           email,
//           accountType: "Admin",
//           id: "admin-special-id", // Add an ID to match format with user tokens
//         },
//         process.env.JWT_SECRET,
//         {
//           expiresIn: "24h", // Extend token expiration to reduce login frequency
//         }
//       );

//       // Return the JWT token for admin
//       return res.status(200).json({
//         success: true,
//         token,
//         message: "Admin login successful",
//       });
//     } else {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid admin credentials",
//       });
//     }
//   }

//   // If not admin, check in the database for other users
//   const userDetails = await User.findOne({ email });
//   if (!userDetails) {
//     return res.status(404).json({ success: false, message: "User not found" });
//   }

//   // Compare the password
//   const isPasswordMatch = await bcrypt.compare(password, userDetails.password);
//   if (!isPasswordMatch) {
//     return res
//       .status(401)
//       .json({ success: false, message: "Invalid credentials" });
//   }

//   // Generate JWT for the user
//   const token = jwt.sign(
//     {
//       email: userDetails.email,
//       accountType: userDetails.accountType,
//       id: userDetails._id,
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: "24h" }
//   );

//   // Return JWT token for the user
//   return res.status(200).json({
//     success: true,
//     token,
//     message: "Login successful",
//   });
// };

exports.isStudent = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });

    if (userDetails.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route for Students",
      });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "User Role Can't be Verified" });
  }
};

// Middleware to check if the user is an Admin
exports.isAdmin = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });
    console.log("User Details:", userDetails); // Log the user details

    // Check if the user is an admin (including hardcoded admin)
    if (
      req.user.accountType !== "Admin" &&
      userDetails.accountType !== "Admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route for Admin",
      });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "User Role Can't be Verified" });
  }
};

// claude

// exports.isAdmin = async (req, res, next) => {
//   try {
//     // Check if the admin account uses hardcoded credentials (from the token)
//     if (req.user.email === adminEmail && req.user.accountType === "Admin") {
//       return next();
//     }

//     // If not the hardcoded admin, check the database
//     const userDetails = await User.findOne({ email: req.user.email });
//     console.log("User Details:", userDetails); // Log the user details

//     if (!userDetails || userDetails.accountType !== "Admin") {
//       return res.status(401).json({
//         success: false,
//         message: "This is a Protected Route for Admin",
//       });
//     }

//     next();
//   } catch (error) {
//     console.error("Admin verification error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "User Role Can't be Verified" });
//   }
// };
// Middleware to check if the user is an Instructor
exports.isInstructor = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });
    console.log(userDetails);
    console.log(userDetails.accountType);

    if (userDetails.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route for Instructor",
      });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "User Role Can't be Verified" });
  }
};
