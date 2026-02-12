module.exports = {
    apps: [{
        name: 'asc-lounge-booking',
        script: 'npm',
        args: 'start',
        cwd: '/home/ubuntu/ASC-lounge-booking-system',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            PORT: 3002
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true
    }]
};
