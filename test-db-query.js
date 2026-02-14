const { Client } = require('pg');

const connectionString = "postgresql://postgres.aldxcpujzfjubfweunxv:Thffhvmflsj%21@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require";

const client = new Client({
    connectionString: connectionString,
});

async function testQuery() {
    try {
        console.log('Connecting to Supabase...');
        await client.connect();
        console.log('✅ Connected successfully!');

        const res = await client.query('SELECT NOW()');
        console.log('✅ Query successful:', res.rows[0]);

        await client.end();
    } catch (err) {
        console.error('❌ Connection error:', err.message);
        process.exit(1);
    }
}

testQuery();
