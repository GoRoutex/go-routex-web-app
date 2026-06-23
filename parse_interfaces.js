const fs = require('fs');
const path = require('path');

const files = [
    'MerchantOperationPointPage.tsx',
    'MerchantScheduleManagementPage.tsx',
    'MerchantTripManagementPage.tsx',
    'MerchantTicketManagementPage.tsx',
    'MerchantQuickBookingPage.tsx',
    'MerchantCampaignManagementPage.tsx',
    'MerchantFeedbackPage.tsx',
    'MerchantStaffManagementPage.tsx',
    'MerchantMaintenancePage.tsx'
];

const basePath = '/Volumes/Dev/Workspace/Routex Client/go-routex-web-app/src/pages/merchant/';

let output = '';

files.forEach(file => {
    const filePath = path.join(basePath, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        // Simple regex to grab top level interfaces
        const matches = content.match(/interface\s+\w+\s*\{[^}]+\}/g);
        output += `\n\n=== ${file} ===\n`;
        if (matches) {
            output += matches.join('\n\n');
        } else {
            output += "No interfaces found.";
        }
        
        // Also grab formData default state
        const formDataMatch = content.match(/setFormData\(\{([\s\S]*?)\}\);/);
        if (formDataMatch) {
             output += `\n\nForm Data State:\n${formDataMatch[1]}\n`;
        }
        
        // Grab API endpoints
        const endpoints = content.match(/const\s+\w+_ENDPOINTS\s*=\s*\{([\s\S]*?)\}/);
        if (endpoints) {
             output += `\n\nEndpoints:\n${endpoints[1]}\n`;
        }
    }
});

fs.writeFileSync('interfaces_dump.txt', output);
console.log('Done parsing.');
