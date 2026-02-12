
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Manually load .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            // Remove quotes if present
            let cleanValue = value.trim();
            if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
                cleanValue = cleanValue.slice(1, -1);
            }
            process.env[key.trim()] = cleanValue;
        }
    });
}

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Connected successfully!');

        const userCount = await prisma.user.count();
        console.log(`User count: ${userCount}`);

        if (userCount > 0) {
            const firstUser = await prisma.user.findFirst();
            console.log('First user:', firstUser.username);
        } else {
            console.log('No users found.');
        }

        await prisma.$disconnect();
    } catch (e) {
        console.error('Database connection failed:', e);
        process.exit(1);
    }
}

main();
