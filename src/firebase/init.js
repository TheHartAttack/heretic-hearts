import firebase from 'firebase'
//import firestore from 'firebase/firestore'

var config = {
  apiKey: "AIzaSyDegeJw_QcA2RLm-wl7sEP10kQ3JDy-BGQ",
  authDomain: "heretic-hearts.firebaseapp.com",
  databaseURL: "https://heretic-hearts.firebaseio.com",
  projectId: "heretic-hearts",
  storageBucket: "heretic-hearts.appspot.com",
  messagingSenderId: "662485139020",
  appId: "1:662485139020:web:576fbb968a2c9e5601bee9",
  measurementId: "G-7VWLRZ8G82"
};

  const firebaseApp = firebase.initializeApp(config);
  //firebaseApp.firestore().settings({timestampsInSnapshots: true});

  export default firebaseApp.firestore()