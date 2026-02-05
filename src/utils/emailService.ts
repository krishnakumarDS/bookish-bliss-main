import { toast } from "sonner";

// ============================================
// EMAIL SERVICE CONFIGURATION
// ============================================

const EMAIL_CONFIG = {
    service: import.meta.env.VITE_EMAIL_SERVICE || 'simulation',
    enabled: import.meta.env.VITE_EMAIL_ENABLED === 'true',
    debug: import.meta.env.VITE_EMAIL_DEBUG === 'true',

    // SendGrid
    sendgrid: {
        apiKey: import.meta.env.VITE_SENDGRID_API_KEY || '',
        fromEmail: import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'noreply@bookstore.com',
        fromName: import.meta.env.VITE_SENDGRID_FROM_NAME || 'Bookish Bliss',
    },

    // Gmail SMTP
    gmail: {
        user: import.meta.env.VITE_GMAIL_USER || '',
        appPassword: import.meta.env.VITE_GMAIL_APP_PASSWORD || '',
        fromName: import.meta.env.VITE_GMAIL_FROM_NAME || 'Bookish Bliss',
    }
};

// Log configuration on startup (only in debug mode)
if (EMAIL_CONFIG.debug) {
    console.group('[EMAIL CONFIG] Service Configuration');
    console.log('Service:', EMAIL_CONFIG.service);
    console.log('Enabled:', EMAIL_CONFIG.enabled);
    console.log('Debug:', EMAIL_CONFIG.debug);
    console.log('SendGrid API Key:', EMAIL_CONFIG.sendgrid.apiKey ? '✓ Set' : '✗ Not Set');
    console.log('Gmail User:', EMAIL_CONFIG.gmail.user || '✗ Not Set');
    console.log('Gmail App Password:', EMAIL_CONFIG.gmail.appPassword ? '✓ Set' : '✗ Not Set');
    console.groupEnd();
}

// ============================================
// API KEY GENERATION (for simulation mode)
// ============================================

const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const segments = [];

    for (let i = 0; i < 4; i++) {
        let segment = '';
        for (let j = 0; j < 8; j++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        segments.push(segment);
    }

    return segments.join('-');
};

// ============================================
// LOGGING UTILITIES
// ============================================

const logEmailAction = (log: any) => {
    try {
        const existingLogs = JSON.parse(localStorage.getItem("admin_email_logs") || "[]");
        localStorage.setItem("admin_email_logs", JSON.stringify([log, ...existingLogs].slice(0, 100)));

        if (log.status === "Failed") {
            console.error(`[EMAIL FAILURE] ${log.message_id}`, log);
        } else {
            console.info(`[EMAIL SUCCESS] ${log.message_id}`, log);
        }
    } catch (error) {
        console.error("[EMAIL LOGGING ERROR] Failed to log email action:", error);
    }
};

const logEmailFailure = (to: string, subject: string, error: any, requestId: string, apiKey: string) => {
    const failureLog = {
        id: Date.now(),
        to,
        subject,
        status: "Failed",
        protocol: EMAIL_CONFIG.service.toUpperCase(),
        message_id: requestId,
        api_key: apiKey,
        error_message: error?.message || "Unknown error",
        error_code: error?.code || "UNKNOWN",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString(),
        retry_attempted: false
    };

    logEmailAction(failureLog);

    toast.error(`Email Failed: ${subject}`, {
        description: `Failed to send to ${to}. Error: ${error?.message || "Unknown error"}`
    });

    return failureLog;
};

// ============================================
// SENDGRID EMAIL SERVICE
// ============================================

const sendEmailViaSendGrid = async (to: string, subject: string, body: string, requestId: string, apiKey: string) => {
    const startTime = Date.now();

    // Log outgoing email with random API key for monitoring
    console.group(`[SENDGRID OUTGOING] ${requestId}`);
    console.log(`TIMESTAMP: ${new Date().toISOString()}`);
    console.log(`MONITORING API-KEY: ${apiKey}`); // Random key for logging/monitoring
    console.log(`SENDGRID API: ${EMAIL_CONFIG.sendgrid.apiKey.substring(0, 15)}...`); // Real API key (truncated)
    console.log(`FROM: ${EMAIL_CONFIG.sendgrid.fromName} <${EMAIL_CONFIG.sendgrid.fromEmail}>`);
    console.log(`TO: <${to}>`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY LENGTH: ${body.length} characters`);
    console.groupEnd();

    try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${EMAIL_CONFIG.sendgrid.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                personalizations: [{
                    to: [{ email: to }],
                    subject: subject,
                }],
                from: {
                    email: EMAIL_CONFIG.sendgrid.fromEmail,
                    name: EMAIL_CONFIG.sendgrid.fromName,
                },
                content: [{
                    type: 'text/plain',
                    value: body,
                }],
            }),
        });

        const deliveryTime = Date.now() - startTime;

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.errors?.[0]?.message || `SendGrid API error: ${response.status}`);
        }

        // Success
        const successLog = {
            id: Date.now(),
            to,
            subject,
            status: "Delivered",
            protocol: "SendGrid",
            message_id: requestId,
            api_key: apiKey, // Random monitoring key
            sendgrid_api_key: EMAIL_CONFIG.sendgrid.apiKey.substring(0, 15) + '...', // Truncated real key
            delivery_time_ms: deliveryTime,
            body_length: body.length,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date().toISOString(),
            retry_count: 0
        };

        logEmailAction(successLog);

        return {
            success: true,
            messageId: requestId,
            apiKey,
            deliveryTime,
            timestamp: new Date().toISOString()
        };

    } catch (error: any) {
        console.error(`[SENDGRID ERROR] ${requestId}`, error);
        logEmailFailure(to, subject, error, requestId, apiKey);

        return {
            success: false,
            messageId: requestId,
            apiKey,
            error: error.message || "Unknown error",
            timestamp: new Date().toISOString()
        };
    }
};

// ============================================
// GMAIL SMTP EMAIL SERVICE
// ============================================

const sendEmailViaGmail = async (to: string, subject: string, body: string, requestId: string, apiKey: string) => {
    const startTime = Date.now();

    // Note: Direct SMTP from browser is not possible due to CORS and security restrictions
    // This would need a backend API endpoint to handle SMTP
    // For now, we'll simulate Gmail SMTP with enhanced logging

    console.group(`[GMAIL SMTP OUTGOING] ${requestId}`);
    console.log(`TIMESTAMP: ${new Date().toISOString()}`);
    console.log(`MONITORING API-KEY: ${apiKey}`); // Random key for logging/monitoring
    console.log(`GMAIL AUTH: ${EMAIL_CONFIG.gmail.user}`);
    console.log(`APP PASSWORD: ${EMAIL_CONFIG.gmail.appPassword ? EMAIL_CONFIG.gmail.appPassword.substring(0, 4) + '************' : '✗ Not Set'}`);
    console.log(`SMTP SERVER: smtp.gmail.com:587`);
    console.log(`FROM: ${EMAIL_CONFIG.gmail.fromName} <${EMAIL_CONFIG.gmail.user}>`);
    console.log(`TO: <${to}>`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY LENGTH: ${body.length} characters`);
    console.groupEnd();

    // Simulate sending (would need backend for real SMTP)
    return new Promise((resolve) => {
        setTimeout(() => {
            const deliveryTime = Date.now() - startTime;

            const successLog = {
                id: Date.now(),
                to,
                subject,
                status: "Delivered (Simulated)",
                protocol: "Gmail SMTP",
                message_id: requestId,
                api_key: apiKey, // Random monitoring key
                gmail_user: EMAIL_CONFIG.gmail.user,
                delivery_time_ms: deliveryTime,
                body_length: body.length,
                smtp_server: "smtp.gmail.com:587",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date().toISOString(),
                retry_count: 0,
                note: "Gmail SMTP requires backend API - currently simulated"
            };

            logEmailAction(successLog);

            resolve({
                success: true,
                messageId: requestId,
                apiKey,
                deliveryTime,
                timestamp: new Date().toISOString(),
                note: "Gmail SMTP requires backend API - currently simulated"
            });
        }, 500);
    });
};

// ============================================
// SIMULATION EMAIL SERVICE
// ============================================

const sendEmailViaSimulation = async (to: string, subject: string, body: string, requestId: string, apiKey: string) => {
    const startTime = Date.now();

    console.group(`[SMTP OUTGOING] ${requestId}`);
    console.log(`TIMESTAMP: ${new Date().toISOString()}`);
    console.log(`AUTH: API-KEY ${apiKey}`);
    console.log(`HELO bookstore.smtp.relay`);
    console.log(`MAIL FROM: <noreply@bookstore.com>`);
    console.log(`RCPT TO: <${to}>`);
    console.log(`DATA: ${subject}`);
    console.log(`BODY LENGTH: ${body.length} characters`);
    console.groupEnd();

    return new Promise((resolve) => {
        setTimeout(() => {
            const deliveryTime = Date.now() - startTime;

            const successLog = {
                id: Date.now(),
                to,
                subject,
                status: "Delivered",
                protocol: "SMTP/Gmail (Simulated)",
                message_id: requestId,
                api_key: apiKey,
                delivery_time_ms: deliveryTime,
                body_length: body.length,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date().toISOString(),
                retry_count: 0
            };

            logEmailAction(successLog);

            resolve({
                success: true,
                messageId: requestId,
                apiKey,
                deliveryTime,
                timestamp: new Date().toISOString()
            });
        }, 500);
    });
};

// ============================================
// MAIN EMAIL FUNCTION
// ============================================

export const sendEmail = async (to: string, subject: string, body: string, silent: boolean = false) => {
    const requestId = `msg-${Math.random().toString(36).substr(2, 9)}`;
    const apiKey = generateApiKey();
    const startTime = Date.now();

    try {
        // Validate email parameters
        if (!to || !subject) {
            throw new Error("Missing required email parameters (to or subject)");
        }

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            throw new Error(`Invalid email address: ${to}`);
        }

        // Check if email service is enabled
        if (!EMAIL_CONFIG.enabled) {
            console.warn('[EMAIL] Email service is disabled in configuration');
            return {
                success: false,
                messageId: requestId,
                apiKey,
                error: "Email service is disabled",
                timestamp: new Date().toISOString()
            };
        }

        // Route to appropriate email service
        let result;

        switch (EMAIL_CONFIG.service) {
            case 'sendgrid':
                if (!EMAIL_CONFIG.sendgrid.apiKey) {
                    throw new Error("SendGrid API key not configured");
                }
                result = await sendEmailViaSendGrid(to, subject, body, requestId, apiKey);
                break;

            case 'gmail':
                if (!EMAIL_CONFIG.gmail.user || !EMAIL_CONFIG.gmail.appPassword) {
                    throw new Error("Gmail credentials not configured");
                }
                result = await sendEmailViaGmail(to, subject, body, requestId, apiKey);
                break;

            case 'simulation':
            default:
                result = await sendEmailViaSimulation(to, subject, body, requestId, apiKey);
                break;
        }

        // Show success toast (if not silent)
        if (!silent && result.success) {
            toast.success(`Email Sent Successfully`, {
                description: `${subject} → ${to}`
            });
        }

        return result;

    } catch (error: any) {
        console.error(`[EMAIL ERROR] ${requestId}`, error);
        logEmailFailure(to, subject, error, requestId, apiKey);

        return {
            success: false,
            messageId: requestId,
            apiKey,
            error: error.message || "Unknown error",
            timestamp: new Date().toISOString()
        };
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getEmailLogs = () => {
    try {
        return JSON.parse(localStorage.getItem("admin_email_logs") || "[]");
    } catch (error) {
        console.error("[EMAIL LOGS] Failed to retrieve email logs:", error);
        return [];
    }
};

export const getFailedEmails = () => {
    try {
        const allLogs = getEmailLogs();
        return allLogs.filter((log: any) => log.status === "Failed");
    } catch (error) {
        console.error("[EMAIL LOGS] Failed to retrieve failed emails:", error);
        return [];
    }
};

export const getEmailStats = () => {
    try {
        const allLogs = getEmailLogs();
        const total = allLogs.length;
        const delivered = allLogs.filter((log: any) => log.status.includes("Delivered")).length;
        const failed = allLogs.filter((log: any) => log.status === "Failed").length;
        const successRate = total > 0 ? ((delivered / total) * 100).toFixed(2) : "0.00";

        return {
            total,
            delivered,
            failed,
            successRate: `${successRate}%`,
            lastEmail: allLogs[0] || null,
            service: EMAIL_CONFIG.service
        };
    } catch (error) {
        console.error("[EMAIL STATS] Failed to calculate email statistics:", error);
        return {
            total: 0,
            delivered: 0,
            failed: 0,
            successRate: "0.00%",
            lastEmail: null,
            service: EMAIL_CONFIG.service
        };
    }
};

export const cleanupEmailLogs = () => {
    try {
        const allLogs = getEmailLogs();
        const recentLogs = allLogs.slice(0, 100);
        localStorage.setItem("admin_email_logs", JSON.stringify(recentLogs));
        console.info(`[EMAIL CLEANUP] Cleaned up email logs. Kept ${recentLogs.length} recent logs.`);
        return true;
    } catch (error) {
        console.error("[EMAIL CLEANUP] Failed to cleanup email logs:", error);
        return false;
    }
};

// Get current email service configuration
export const getEmailConfig = () => {
    return {
        service: EMAIL_CONFIG.service,
        enabled: EMAIL_CONFIG.enabled,
        debug: EMAIL_CONFIG.debug,
        sendgridConfigured: !!EMAIL_CONFIG.sendgrid.apiKey,
        gmailConfigured: !!(EMAIL_CONFIG.gmail.user && EMAIL_CONFIG.gmail.appPassword)
    };
};
