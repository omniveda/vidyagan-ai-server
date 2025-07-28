// // const { admin } = require("../config/firebase");
// // const User = require("../models/User");

// // // Send notification to all users
// // exports.sendNotificationToAll = async (req, res) => {
// //   try {
// //     const { title, body, imageUrl } = req.body;

// //     if (!title || !body) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Title and body are required for notifications",
// //       });
// //     }

// //     // Get all FCM tokens (assuming tokens are stored in user model)
// //     const users = await User.find({ fcmToken: { $exists: true, $ne: null } });
// //     const tokens = users.map((user) => user.fcmToken).filter(Boolean);

// //     if (tokens.length === 0) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "No registered devices found",
// //       });
// //     }

// //     // Prepare notification payload
// //     const message = {
// //       notification: {
// //         title,
// //         body,
// //       },
// //       data: {
// //         type: "general",
// //         click_action: "FLUTTER_NOTIFICATION_CLICK",
// //         ...req.body.data,
// //       },
// //     };

// //     // Add image if provided
// //     if (imageUrl) {
// //       message.notification.imageUrl = imageUrl;
// //     }

// //     // Send to multiple devices
// //     const response = await admin.messaging().sendMulticast({
// //       tokens,
// //       ...message,
// //     });

// //     return res.status(200).json({
// //       success: true,
// //       message: `Notification sent successfully to ${response.successCount} devices`,
// //       failed: response.failureCount,
// //     });
// //   } catch (error) {
// //     console.error("Error sending notification:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Error sending notification",
// //       error: error.message,
// //     });
// //   }
// // };

// // // Send notification to specific user groups
// // exports.sendNotificationToGroup = async (req, res) => {
// //   try {
// //     const { title, body, imageUrl, userType } = req.body;

// //     if (!title || !body || !userType) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Title, body, and userType are required",
// //       });
// //     }

// //     // Find users of specified type
// //     const users = await User.find({
// //       accountType: userType,
// //       fcmToken: { $exists: true, $ne: null },
// //     });

// //     const tokens = users.map((user) => user.fcmToken).filter(Boolean);

// //     if (tokens.length === 0) {
// //       return res.status(404).json({
// //         success: false,
// //         message: `No registered devices found for ${userType} users`,
// //       });
// //     }

// //     // Prepare notification payload
// //     const message = {
// //       notification: {
// //         title,
// //         body,
// //       },
// //       data: {
// //         type: userType.toLowerCase(),
// //         click_action: "FLUTTER_NOTIFICATION_CLICK",
// //         ...req.body.data,
// //       },
// //     };

// //     // Add image if provided
// //     if (imageUrl) {
// //       message.notification.imageUrl = imageUrl;
// //     }

// //     // Send to multiple devices
// //     const response = await admin.messaging().sendMulticast({
// //       tokens,
// //       ...message,
// //     });

// //     return res.status(200).json({
// //       success: true,
// //       message: `Notification sent successfully to ${response.successCount} ${userType} users`,
// //       failed: response.failureCount,
// //     });
// //   } catch (error) {
// //     console.error("Error sending notification:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Error sending notification",
// //       error: error.message,
// //     });
// //   }
// // };

// // // // Get notification history
// // // exports.getNotificationHistory = async (req, res) => {
// // //   try {
// // //     // This would require a Notification model to store notification history
// // //     // For this example, we'll return a mock response
// // //     return res.status(200).json({
// // //       success: true,
// // //       message: "Notification history fetched successfully",
// // //       data: [
// // //         {
// // //           id: "1",
// // //           title: "New Course Available",
// // //           body: "Check out our new course on React Native!",
// // //           sentAt: new Date().toISOString(),
// // //           sentTo: "All Users",
// // //           sentBy: req.user.email,
// // //         },
// // //       ],
// // //     });
// // //   } catch (error) {
// // //     console.error("Error fetching notification history:", error);
// // //     return res.status(500).json({
// // //       success: false,
// // //       message: "Error fetching notification history",
// // //       error: error.message,
// // //     });
// // //   }
// // // };

// // // // Register FCM token
// // // exports.registerFcmToken = async (req, res) => {
// // //   try {
// // //     const { fcmToken } = req.body;
// // //     const userId = req.user.id; // Assuming user ID is available from auth middleware

// // //     if (!fcmToken) {
// // //       return res.status(400).json({
// // //         success: false,
// // //         message: "FCM token is required",
// // //       });
// // //     }

// // //     // Update user with FCM token
// // //     await User.findByIdAndUpdate(userId, { fcmToken });

// // //     return res.status(200).json({
// // //       success: true,
// // //       message: "FCM token registered successfully",
// // //     });
// // //   } catch (error) {
// // //     console.error("Error registering FCM token:", error);
// // //     return res.status(500).json({
// // //       success: false,
// // //       message: "Error registering FCM token",
// // //       error: error.message,
// // //     });
// // //   }
// // // };

// // // Get notification history
// // exports.getNotificationHistory = async (req, res) => {
// //   try {
// //     const notifications = await Notification.find()
// //       .sort({ createdAt: -1 })
// //       .limit(100);

// //     // Format the notifications for the frontend
// //     const formattedNotifications = notifications.map((notification) => ({
// //       id: notification._id,
// //       title: notification.title,
// //       body: notification.body,
// //       sentAt: notification.createdAt,
// //       sentTo: notification.sentTo,
// //       imageUrl: notification.imageUrl,
// //       successCount: notification.successCount,
// //       failureCount: notification.failureCount,
// //       data: notification.data || {},
// //     }));

// //     return res.status(200).json({
// //       success: true,
// //       count: formattedNotifications.length,
// //       notifications: formattedNotifications,
// //     });
// //   } catch (error) {
// //     console.error("Error fetching notification history:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Error fetching notification history",
// //       error: error.message,
// //     });
// //   }
// // };

// // // Get notifications for specific user
// // exports.getUserNotifications = async (req, res) => {
// //   try {
// //     const userId = req.user.id;
// //     const userType = req.user.accountType;

// //     // Find both general notifications and ones targeted to this user's type
// //     const notifications = await Notification.find({
// //       $or: [{ sentTo: "All" }, { sentTo: userType }],
// //     })
// //       .sort({ createdAt: -1 })
// //       .limit(50);

// //     const formattedNotifications = notifications.map((notification) => ({
// //       id: notification._id,
// //       title: notification.title,
// //       body: notification.body,
// //       sentAt: notification.createdAt,
// //       imageUrl: notification.imageUrl,
// //       data: notification.data || {},
// //     }));

// //     return res.status(200).json({
// //       success: true,
// //       count: formattedNotifications.length,
// //       notifications: formattedNotifications,
// //     });
// //   } catch (error) {
// //     console.error("Error fetching user notifications:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Error fetching user notifications",
// //       error: error.message,
// //     });
// //   }
// // };

// // // Mark notification as read
// // exports.markNotificationAsRead = async (req, res) => {
// //   try {
// //     const { notificationId } = req.params;
// //     const userId = req.user.id;

// //     // Assuming you have a user-notification relationship model
// //     // or a read status field in your notification model
// //     const updated = await User.findByIdAndUpdate(
// //       userId,
// //       { $addToSet: { readNotifications: notificationId } },
// //       { new: true }
// //     );

// //     if (!updated) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "User not found or notification already marked as read",
// //       });
// //     }

// //     return res.status(200).json({
// //       success: true,
// //       message: "Notification marked as read",
// //     });
// //   } catch (error) {
// //     console.error("Error marking notification as read:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Error marking notification as read",
// //       error: error.message,
// //     });
// //   }
// // };

// // // Delete notification (admin only)
// // exports.deleteNotification = async (req, res) => {
// //   try {
// //     const { notificationId } = req.params;

// //     const deleted = await Notification.findByIdAndDelete(notificationId);

// //     if (!deleted) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Notification not found",
// //       });
// //     }

// //     return res.status(200).json({
// //       success: true,
// //       message: "Notification deleted successfully",
// //     });
// //   } catch (error) {
// //     console.error("Error deleting notification:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Error deleting notification",
// //       error: error.message,
// //     });
// //   }
// // };

// // module.exports = {
// //   sendNotificationToAll,
// //   sendNotificationToGroup,
// //   getNotificationHistory,
// //   getUserNotifications,
// //   markNotificationAsRead,
// //   deleteNotification,
// // };

// // deepseek

// const { admin } = require("../config/firebase");
// const User = require("../models/User");
// const Notification = require("../models/Notification");

// // Send notification to all users
// exports.sendNotificationToAll = async (req, res) => {
//   try {
//     const { title, body, imageUrl } = req.body;

//     if (!title || !body) {
//       return res.status(400).json({
//         success: false,
//         message: "Title and body are required for notifications",
//       });
//     }

//     // Get all FCM tokens
//     const users = await User.find({ fcmToken: { $exists: true, $ne: null } });
//     const tokens = users.map((user) => user.fcmToken).filter(Boolean);

//     if (tokens.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No registered devices found",
//       });
//     }

//     // Prepare notification payload
//     const message = {
//       notification: {
//         title,
//         body,
//       },
//       data: {
//         type: "general",
//         click_action: "FLUTTER_NOTIFICATION_CLICK",
//         ...req.body.data,
//       },
//     };

//     // Add image if provided
//     if (imageUrl) {
//       message.notification.imageUrl = imageUrl;
//     }

//     // Send to multiple devices
//     const messaging = admin.messaging();
//     console.log("Messaging object:", messaging);

//     const response = await messaging.sendMulticast({
//       tokens,
//       ...message,
//     });

//     // Save notification history
//     const notification = new Notification({
//       title,
//       body,
//       imageUrl,
//       sentBy: req.user.id, // Add the user ID of the admin sending it
//       sentTo: "All",
//       successCount: response.successCount,
//       failureCount: response.failureCount,
//       data: req.body.data,
//     });
//     await notification.save();

//     return res.status(200).json({
//       success: true,
//       message: `Notification sent successfully to ${response.successCount} devices`,
//       failed: response.failureCount,
//     });
//   } catch (error) {
//     console.error("Error sending notification:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error sending notification",
//       error: error.message,
//     });
//   }
// };

// // Send notification to specific user groups
// exports.sendNotificationToGroup = async (req, res) => {
//   try {
//     const { title, body, imageUrl, userType } = req.body;

//     if (!title || !body || !userType) {
//       return res.status(400).json({
//         success: false,
//         message: "Title, body, and userType are required",
//       });
//     }

//     // Find users of specified type
//     const users = await User.find({
//       accountType: userType,
//       fcmToken: { $exists: true, $ne: null },
//     });

//     const tokens = users.map((user) => user.fcmToken).filter(Boolean);

//     if (tokens.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `No registered devices found for ${userType} users`,
//       });
//     }

//     // Prepare notification payload
//     const message = {
//       notification: {
//         title,
//         body,
//       },
//       data: {
//         type: userType.toLowerCase(),
//         click_action: "FLUTTER_NOTIFICATION_CLICK",
//         ...req.body.data,
//       },
//     };

//     // Add image if provided
//     if (imageUrl) {
//       message.notification.imageUrl = imageUrl;
//     }

//     // Send to multiple devices
//     const response = await admin.messaging().sendMulticast({
//       tokens,
//       ...message,
//     });

//     // Save notification history
//     const notification = new Notification({
//       title,
//       body,
//       imageUrl,
//       sentBy: req.user.id, // Add the user ID of the admin sending it
//       sentTo: userType,
//       successCount: response.successCount,
//       failureCount: response.failureCount,
//       data: req.body.data,
//     });
//     await notification.save();

//     return res.status(200).json({
//       success: true,
//       message: `Notification sent successfully to ${response.successCount} ${userType} users`,
//       failed: response.failureCount,
//     });
//   } catch (error) {
//     console.error("Error sending notification:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error sending notification",
//       error: error.message,
//     });
//   }
// };

// // Get notification history
// exports.getNotificationHistory = async (req, res) => {
//   try {
//     const notifications = await Notification.find()
//       .sort({ createdAt: -1 })
//       .limit(100);

//     // Format the notifications for the frontend
//     const formattedNotifications = notifications.map((notification) => ({
//       id: notification._id,
//       title: notification.title,
//       body: notification.body,
//       sentAt: notification.createdAt,
//       sentTo: notification.sentTo,
//       imageUrl: notification.imageUrl,
//       successCount: notification.successCount,
//       failureCount: notification.failureCount,
//       data: notification.data || {},
//     }));

//     return res.status(200).json({
//       success: true,
//       count: formattedNotifications.length,
//       notifications: formattedNotifications,
//     });
//   } catch (error) {
//     console.error("Error fetching notification history:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching notification history",
//       error: error.message,
//     });
//   }
// };

// // Register FCM token
// exports.registerFcmToken = async (req, res) => {
//   try {
//     const { fcmToken } = req.body;
//     const userId = req.user.id; // Assuming user ID is available from auth middleware

//     if (!fcmToken) {
//       return res.status(400).json({
//         success: false,
//         message: "FCM token is required",
//       });
//     }

//     // Update user with FCM token
//     await User.findByIdAndUpdate(userId, { fcmToken });

//     return res.status(200).json({
//       success: true,
//       message: "FCM token registered successfully",
//     });
//   } catch (error) {
//     console.error("Error registering FCM token:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error registering FCM token",
//       error: error.message,
//     });
//   }
// };

// // Export all functions
// module.exports = {
//   sendNotificationToAll: exports.sendNotificationToAll,
//   sendNotificationToGroup: exports.sendNotificationToGroup,
//   getNotificationHistory: exports.getNotificationHistory,
//   registerFcmToken: exports.registerFcmToken,
// };

// claude update for that one library which not working

const { admin } = require("../config/firebase");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Send notification to all users
exports.sendNotificationToAll = async (req, res) => {
  try {
    const { title, body, imageUrl } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Title and body are required for notifications",
      });
    }

    // Get all FCM tokens
    const users = await User.find({ fcmToken: { $exists: true, $ne: null } });
    const tokens = users.map((user) => user.fcmToken).filter(Boolean);

    if (tokens.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No registered devices found",
      });
    }

    // Prepare notification payload
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        type: "general",
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        ...req.body.data,
      },
    };

    // Add image if provided
    if (imageUrl) {
      message.notification.imageUrl = imageUrl;
    }

    // Send to multiple devices using compatible method
    const messaging = admin.messaging();
    console.log("Messaging object:", messaging);

    // Use send method instead of sendMulticast
    const batchResponse = await Promise.all(
      tokens.map((token) =>
        messaging
          .send({
            token: token,
            notification: message.notification,
            data: message.data,
          })
          .catch((error) => {
            console.log("Error sending message:", error);
            return { error };
          })
      )
    );

    // Count successes and failures
    const successCount = batchResponse.filter((result) => !result.error).length;
    const failureCount = batchResponse.filter((result) => result.error).length;

    // Save notification history
    const notification = new Notification({
      title,
      body,
      imageUrl,
      sentBy: req.user.id, // Add the user ID of the admin sending it
      sentTo: "All",
      successCount: successCount,
      failureCount: failureCount,
      data: req.body.data,
    });
    await notification.save();

    return res.status(200).json({
      success: true,
      message: `Notification sent successfully to ${successCount} devices`,
      failed: failureCount,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending notification",
      error: error.message,
    });
  }
};

// Send notification to specific user groups
exports.sendNotificationToGroup = async (req, res) => {
  try {
    const { title, body, imageUrl, userType } = req.body;

    if (!title || !body || !userType) {
      return res.status(400).json({
        success: false,
        message: "Title, body, and userType are required",
      });
    }

    // Find users of specified type
    const users = await User.find({
      accountType: userType,
      fcmToken: { $exists: true, $ne: null },
    });

    const tokens = users.map((user) => user.fcmToken).filter(Boolean);

    if (tokens.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No registered devices found for ${userType} users`,
      });
    }

    // Prepare notification payload
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        type: userType.toLowerCase(),
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        ...req.body.data,
      },
    };

    // Add image if provided
    if (imageUrl) {
      message.notification.imageUrl = imageUrl;
    }

    // Send to multiple devices using compatible method
    const messaging = admin.messaging();

    // Use send method instead of sendMulticast
    const batchResponse = await Promise.all(
      tokens.map((token) =>
        messaging
          .send({
            token: token,
            notification: message.notification,
            data: message.data,
          })
          .catch((error) => {
            console.log("Error sending message:", error);
            return { error };
          })
      )
    );

    // Count successes and failures
    const successCount = batchResponse.filter((result) => !result.error).length;
    const failureCount = batchResponse.filter((result) => result.error).length;

    // Save notification history
    const notification = new Notification({
      title,
      body,
      imageUrl,
      sentBy: req.user.id, // Add the user ID of the admin sending it
      sentTo: userType,
      successCount: successCount,
      failureCount: failureCount,
      data: req.body.data,
    });
    await notification.save();

    return res.status(200).json({
      success: true,
      message: `Notification sent successfully to ${successCount} ${userType} users`,
      failed: failureCount,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending notification",
      error: error.message,
    });
  }
};

// Get notification history
exports.getNotificationHistory = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(100);

    // Format the notifications for the frontend
    const formattedNotifications = notifications.map((notification) => ({
      id: notification._id,
      title: notification.title,
      body: notification.body,
      sentAt: notification.createdAt,
      sentTo: notification.sentTo,
      imageUrl: notification.imageUrl,
      successCount: notification.successCount,
      failureCount: notification.failureCount,
      data: notification.data || {},
    }));

    return res.status(200).json({
      success: true,
      count: formattedNotifications.length,
      notifications: formattedNotifications,
    });
  } catch (error) {
    console.error("Error fetching notification history:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching notification history",
      error: error.message,
    });
  }
};

// Register FCM token
exports.registerFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id; // Assuming user ID is available from auth middleware

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required",
      });
    }

    // Update user with FCM token
    await User.findByIdAndUpdate(userId, { fcmToken });

    return res.status(200).json({
      success: true,
      message: "FCM token registered successfully",
    });
  } catch (error) {
    console.error("Error registering FCM token:", error);
    return res.status(500).json({
      success: false,
      message: "Error registering FCM token",
      error: error.message,
    });
  }
};

// Export all functions
module.exports = {
  sendNotificationToAll: exports.sendNotificationToAll,
  sendNotificationToGroup: exports.sendNotificationToGroup,
  getNotificationHistory: exports.getNotificationHistory,
  registerFcmToken: exports.registerFcmToken,
};
