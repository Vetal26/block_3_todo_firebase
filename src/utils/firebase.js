import firebase from "firebase/app";

import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBlONYW26_FQPjfSY2kwEQ2cdK7ZcmGSBI",
    authDomain: "todojs-5c5ac.firebaseapp.com",
    projectId: "todojs-5c5ac",
    storageBucket: "todojs-5c5ac.appspot.com",
    messagingSenderId: "545703399493",
    appId: "1:545703399493:web:5fc77a8ed93999dc65132c"
  };

firebase.initializeApp(firebaseConfig);

export let db = firebase.firestore();

