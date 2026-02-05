import { toast } from "sonner";

// Generate random API key for SMTP authentication simulation
const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const segments = [];

    // Generate 4 segments of 8 characters each (format: XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX)
    for (let i = 0; i < 4; i++) {
        let segment = '';
        for (let j = 0; j < 8; j++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        segments.push(segment);
    }

    return segments.join('-');
};

// Log email action to localStorage for monitoring and debugging
const logEmailAction = (log: any) => {
    try {
        const existingLogs = JSON.parse(localStorage.getItem("admin_email_logs") || "[]");
        localStorage.setItem("admin_email_logs", JSON.stringify([log, ...existingLogs].slice(0, 100)));

        // Also log to console for debugging
        if (log.status === "Failed") {
            console.error(`[EMAIL FAILURE] ${log.message_id}`, log);
        } else {
            console.info(`[EMAIL SUCCESS] ${log.message_id}`, log);
        }
    } catch (error) {
        console.error("[EMAIL LOGGING ERROR] Failed to log email action:", error);
    }
};

// Log email failure with detailed error information
const logEmailFailure = (to: string, subject: string, error: any, requestId: string, apiKey: string) => {
    const failureLog = {
        id: Date.now(),
        to,
        subject,
        status: "Failed",
        protocol: "SMTP/Gmail",
        message_id: requestId,
        api_key: apiKey,
        error_message: error?.message || "Unknown error",
        error_code: error?.code || "UNKNOWN",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString(),
        retry_attempted: false
    };

    logEmailAction(failureLog);

    // Show error toast
    toast.error(`Email Failed: ${subject}`, {
        description: `Failed to send to ${to}. Error: ${error?.message || "Unknown error"}`
    });

    return failureLog;
};

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

        // Advanced SMTP Simulation (Gmail Protocol)
        console.group(`[SMTP OUTGOING] ${requestId}`);
        console.log(`TIMESTAMP: ${new Date().toISOString()}`);
        console.log(`AUTH: API-KEY ${apiKey}`);
        console.log(`HELO bookstore.smtp.relay`);
        console.log(`MAIL FROM: <noreply@bookstore.com>`);
        console.log(`RCPT TO: <${to}>`);
        console.log(`DATA: ${subject}`);
        console.log(`BODY LENGTH: ${body.length} characters`);
        console.groupEnd();

        // Simulate email sending with potential failure (for testing)
        // In production, this would be replaced with actual SMTP/API call
        const simulateFailure = false; // Set to true to test failure logging

        if (simulateFailure) {
            throw new Error("SMTP connection timeout");
        }

        return new Promise((resolve, reject) => {
            // Simulate network latency (500ms)
            setTimeout(() => {
                try {
                    const deliveryTime = Date.now() - startTime;

                    // Success log
                    const successLog = {
                        id: Date.now(),
                        to,
                        subject,
                        status: "Delivered",
                        protocol: "SMTP/Gmail",
                        message_id: requestId,
                        api_key: apiKey,
                        delivery_time_ms: deliveryTime,
                        body_length: body.length,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        timestamp: new Date().toISOString(),
                        retry_count: 0
                    };

                    // Log successful email
                    logEmailAction(successLog);

                    // Show success toast (if not silent)
                    if (!silent) {
                        toast.success(`Email Sent Successfully`, {
                            description: `${subject} → ${to}`
                        });
                    }

                    // Resolve with success details
                    resolve({
                        success: true,
                        messageId: requestId,
                        apiKey,
                        deliveryTime,
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    // Handle unexpected errors during success processing
                    console.error("[EMAIL ERROR] Unexpected error during email processing:", error);
                    logEmailFailure(to, subject, error, requestId, apiKey);
                    reject(error);
                }
            }, 500);
        });

    } catch (error: any) {
        // Log failure
        console.error(`[SMTP ERROR] ${requestId}`, error);
        logEmailFailure(to, subject, error, requestId, apiKey);

        // Return error details instead of throwing
        return {
            success: false,
            messageId: requestId,
            apiKey,
            error: error.message || "Unknown error",
            timestamp: new Date().toISOString()
        };
    }
};

// Get all email logs (for admin monitoring)
export const getEmailLogs = () => {
    try {
        return JSON.parse(localStorage.getItem("admin_email_logs") || "[]");
    } catch (error) {
        console.error("[EMAIL LOGS] Failed to retrieve email logs:", error);
        return [];
    }
};

// Get failed emails only (for debugging)
export const getFailedEmails = () => {
    try {
        const allLogs = getEmailLogs();
        return allLogs.filter((log: any) => log.status === "Failed");
    } catch (error) {
        console.error("[EMAIL LOGS] Failed to retrieve failed emails:", error);
        return [];
    }
};

// Get email statistics
export const getEmailStats = () => {
    try {
        const allLogs = getEmailLogs();
        const total = allLogs.length;
        const delivered = allLogs.filter((log: any) => log.status === "Delivered").length;
        const failed = allLogs.filter((log: any) => log.status === "Failed").length;
        const successRate = total > 0 ? ((delivered / total) * 100).toFixed(2) : "0.00";

        return {
            total,
            delivered,
            failed,
            successRate: `${successRate}%`,
            lastEmail: allLogs[0] || null
        };
    } catch (error) {
        console.error("[EMAIL STATS] Failed to calculate email statistics:", error);
        return {
            total: 0,
            delivered: 0,
            failed: 0,
            successRate: "0.00%",
            lastEmail: null
        };
    }
};

// Clear old email logs (keep last 100)
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
