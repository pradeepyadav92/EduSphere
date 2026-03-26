const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbPath = path.join(__dirname, '../Database/db.js');
const connectToMongo = require(dbPath);

const StudentDetail = require('../models/details/student-details.model');
const Branch = require('../models/branch.model');

async function runDiagnostics() {
    try {
        await connectToMongo();
        console.log('Connected to MongoDB');

        const lastStudents = await StudentDetail.find().sort({ createdAt: -1 }).limit(5).populate('branchId');
        
        console.log('Last 5 Students:');
        lastStudents.forEach((s, idx) => {
            console.log(`--- Student ${idx + 1} ---`);
            console.log(`Name: ${s.firstName} ${s.lastName}`);
            console.log(`Email: ${s.email}`);
            console.log(`BranchId: ${s.branchId ? (s.branchId.name || s.branchId) : 'NULL'}`);
            console.log(`EmergencyContact: ${JSON.stringify(s.emergencyContact)}`);
            console.log(`--------------------\n`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

runDiagnostics();
