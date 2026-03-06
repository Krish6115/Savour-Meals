const admin = require('firebase-admin');

// Initialize Firebase Admin if credentials are provided
let firebaseInitialized = false;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firebaseInitialized = true;
    console.log('Firebase Admin initialized');
  }
} catch (error) {
  console.log('Firebase Admin not initialized:', error.message);
  console.log('Push notifications will be disabled');
}

const sendNotification = async (token, title, body, data = {}) => {
  if (!firebaseInitialized || !token) {
    console.log('Notification skipped - Firebase not initialized or no token');
    return null;
  }

  try {
    const message = {
      notification: { title, body },
      data: {
        ...data,
        title,
        body
      },
      token
    };
    
    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error.message);
    // Don't throw error, just log it
    return null;
  }
};

const sendBatchNotifications = async (tokens, title, body, data = {}) => {
  if (!firebaseInitialized || !tokens || tokens.length === 0) {
    console.log('Batch notification skipped - Firebase not initialized or no tokens');
    return null;
  }

  try {
    const message = {
      notification: { title, body },
      data: {
        ...data,
        title,
        body
      }
    };

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      ...message
    });
    
    console.log(`Batch notification sent: ${response.successCount} successful, ${response.failureCount} failed`);
    return response;
  } catch (error) {
    console.error('Error sending batch notifications:', error.message);
    return null;
  }
};

module.exports = {
  sendNotification,
  sendBatchNotifications
};

