
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const COMPLAINTS_FILE = path.join(DATA_DIR, 'complaints.json');

// Mock data
const mockComplaints = [
    { id: '1', subject: 'Test 1', createdAt: new Date().toISOString() },
    { id: '2', subject: 'Test 2', createdAt: new Date().toISOString() },
    { id: '3', subject: 'Test 3', createdAt: new Date().toISOString() }
];

async function testDelete() {
    // Setup
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
    fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify(mockComplaints, null, 2));

    console.log('Initial:', JSON.parse(fs.readFileSync(COMPLAINTS_FILE, 'utf-8')).length);

    // Simulate deleteComplaint logic from db.ts
    const data = fs.readFileSync(COMPLAINTS_FILE, 'utf-8');
    let complaints = JSON.parse(data);

    const idToDelete = '2';
    const index = complaints.findIndex((c) => c.id === idToDelete);

    if (index !== -1) {
        console.log(`Deleting index ${index}`);
        complaints.splice(index, 1);
        fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify(complaints, null, 2));
    }

    const final = JSON.parse(fs.readFileSync(COMPLAINTS_FILE, 'utf-8'));
    console.log('Final:', final.length);
    console.log('Items:', final.map(c => c.id));
}

testDelete();
