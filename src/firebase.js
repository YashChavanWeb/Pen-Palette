import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import 'firebase/compat/database';

const app = firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
});

// const app = firebase.initializeApp({
//   apiKey: "AIzaSyBjVNzyIMD2xcpiXxKz3GgniJBu6pbs4WU",
//   authDomain: "auth-development-d40b6.firebaseapp.com",
//   databaseURL: "https://auth-development-d40b6-default-rtdb.firebaseio.com",
//   projectId: "auth-development-d40b6",
//   storageBucket: "auth-development-d40b6.appspot.com",
//   messagingSenderId: "565539690111",
//   appId: "1:565539690111:web:200da469580cbe6318d14a"
// });

export const auth = app.auth();
export const storage = app.storage();
export const db = app.database();

export default app;