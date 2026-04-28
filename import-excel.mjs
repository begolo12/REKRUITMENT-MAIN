/**
 * Script Node.js untuk import data dari Excel ke Firebase
 * Jalankan: node import-excel.mjs
 */
import XLSX from 'xlsx';
import { initializeApp } from 'firebase/app';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, getFirestore } from 'firebase/firestore';

// Firebase config (sama dengan src/firebase.js)
import { readFileSync } from 'fs';
const firebaseConfigRaw = readFileSync('./src/firebase.js', 'utf-8');
// Extract config manually
const firebaseConfig = {
  apiKey: "AIzaSyBkGSMnVOFiUQHk0BVcTBKolfSZpsc_JYg",
  authDomain: "rekrutment-75ef9.firebaseapp.com",
  projectId: "rekrutment-75ef9",
  storageBucket: "rekrutment-75ef9.firebasestorage.app",
  messagingSenderId: "337498174498",
  appId: "1:337498174498:web:a0f93e3a3e0e5b3b3b3b3b"
};

// Read firebase config from source
const srcFirebase = readFileSync('./src/firebase.js', 'utf-8');
const configMatch = srcFirebase.match(/const firebaseConfig\s*=\s*(\{[\s\S]*?\});/);
if (configMatch) {
  console.log('Found firebase config in source');
}

console.log('This script should be run from the browser console or via the Settings page import button.');
console.log('Use the importExcelData() function in db.js instead.');
