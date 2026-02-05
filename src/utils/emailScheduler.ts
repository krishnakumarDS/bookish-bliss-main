import { sendEmail } from "./email";
import { supabase } from "@/integrations/supabase/client";

// Configuration for email update intervals (in minutes)
// ⚡ FAST TESTING MODE: Set to 1 minute for quick testing
const EMAIL_UPDATE_INTERVALS = {
    confirmed: 1,     // Send update every 1 minute after confirmation (was 30)
    processing: 1,    // Send update every 1 minute during processing (was 20)
    shipped: 1,       // Send update every 1 minute after shipping (was 60)
    outForDelivery: 1, // Send update every 1 minute when out for delivery (was 15)
};

// Maximum number of periodic updates before stopping
const MAX_PERIODIC_UPDATES = {
    confirmed: 4,     // Max 4 updates (2 hours)
    processing: 6,    // Max 6 updates (2 hours)
    shipped: 12,      // Max 12 updates (12 hours)
    outForDelivery: 8, // Max 8 updates (2 hours)
};

interface ScheduledEmail {
    orderId: string;
    userEmail: string;
    status: string;
    updateCount: number;
    lastSent: Date;
    intervalId?: NodeJS.Timeout;
}

// Store active email schedules
const activeSchedules = new Map<string, ScheduledEmail>();

/**
 * Get email template based on order status and update count
 */
const getEmailTemplate = (
    orderId: string,
    status: string,
    updateCount: number,
    orderDetails?: any
): { subject: string; body: string } => {
    const shortId = orderId.slice(0, 8).toUpperCase();

    switch (status) {
        case "confirmed":
            if (updateCount === 0) {
                return {
                    subject: "🎉 Order Confirmed - Your Books Are Being Prepared!",
                    body: `Hello,

Excellent news! Your order #${shortId} has been formally approved and confirmed by our team.

📦 ORDER STATUS: CONFIRMED
⏰ Confirmed at: ${new Date().toLocaleString()}

We are now preparing your curated selection for shipment. Our team is carefully packaging your books to ensure they arrive in perfect condition.

WHAT'S NEXT:
✓ Quality check in progress
✓ Packaging preparation
✓ Shipping label generation

You will receive another notification once your tracking number is active.

Thank you for choosing Bookish Bliss!
The Administrative Team

---
Track your order anytime at: https://bookishbliss.com/orders/${orderId}`,
                };
            } else {
                return {
                    subject: `📦 Order Update #${updateCount} - Still Preparing Your Books`,
                    body: `Hello,

This is an automated update for your order #${shortId}.

📦 CURRENT STATUS: CONFIRMED - IN PREPARATION
⏰ Update ${updateCount} sent at: ${new Date().toLocaleString()}

Your order is still being carefully prepared by our team. We're ensuring every book is in perfect condition before shipment.

PROGRESS UPDATE:
${updateCount === 1 ? "✓ Books selected from inventory" : ""}
${updateCount === 2 ? "✓ Quality inspection completed" : ""}
${updateCount === 3 ? "✓ Packaging materials prepared" : ""}
${updateCount >= 4 ? "✓ Final preparations underway" : ""}

Expected next step: Shipping within the next few hours.

Thank you for your patience!
The Bookish Bliss Team

---
Track your order: https://bookishbliss.com/orders/${orderId}`,
                };
            }

        case "processing":
            return {
                subject: `⚙️ Order Processing Update #${updateCount} - Almost Ready!`,
                body: `Hello,

Processing update for order #${shortId}:

⚙️ CURRENT STATUS: PROCESSING
⏰ Update ${updateCount} at: ${new Date().toLocaleString()}

Your books are being processed and will be ready for shipment soon!

PROCESSING STAGE:
${updateCount <= 2 ? "→ Inventory verification" : ""}
${updateCount > 2 && updateCount <= 4 ? "→ Quality assurance check" : ""}
${updateCount > 4 ? "→ Final packaging stage" : ""}

We're working hard to get your order shipped as quickly as possible.

Best regards,
The Bookish Bliss Team

---
Track your order: https://bookishbliss.com/orders/${orderId}`,
            };

        case "shipped":
            const trackingNumber = `BLS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            return {
                subject: updateCount === 0
                    ? "🚚 Your Order Has Shipped!"
                    : `🚚 Shipping Update #${updateCount} - On The Way!`,
                body: `Hello,

${updateCount === 0 ? "Great news! Your order has been shipped!" : `Shipping update for order #${shortId}:`}

🚚 CURRENT STATUS: SHIPPED
📍 Tracking Number: ${trackingNumber}
⏰ Update sent at: ${new Date().toLocaleString()}

SHIPPING DETAILS:
Carrier: Bliss Express
Estimated Delivery: 3-5 Business Days
${updateCount > 0 ? `\nYour package is currently in transit and making good progress!` : ""}

${updateCount === 0 ? "Your books are now on their way to you!" : ""}
${updateCount > 3 ? "Your package should arrive soon!" : ""}

You can track your shipment live on our website under 'My Orders'.

Thank you for your patronage!
The Logistics Team

---
Track your order: https://bookishbliss.com/orders/${orderId}`,
            };

        case "out_for_delivery":
            return {
                subject: `🎯 Out For Delivery! Update #${updateCount}`,
                body: `Hello,

Exciting news! Your order #${shortId} is out for delivery!

🎯 CURRENT STATUS: OUT FOR DELIVERY
⏰ Update ${updateCount} at: ${new Date().toLocaleString()}

Your books are on the delivery vehicle and will arrive today!

DELIVERY INFORMATION:
${updateCount === 0 ? "→ Package loaded on delivery vehicle" : ""}
${updateCount > 0 && updateCount <= 3 ? "→ En route to your address" : ""}
${updateCount > 3 ? "→ Approaching your delivery location" : ""}

Expected delivery: Today

Please ensure someone is available to receive the package.

The Bookish Bliss Delivery Team

---
Track your order: https://bookishbliss.com/orders/${orderId}`,
            };

        default:
            return {
                subject: `Order Update - #${shortId}`,
                body: `Hello,

This is an update for your order #${shortId}.

Status: ${status}
Time: ${new Date().toLocaleString()}

Thank you for choosing Bookish Bliss!

---
Track your order: https://bookishbliss.com/orders/${orderId}`,
            };
    }
};

/**
 * Send periodic email update
 */
const sendPeriodicUpdate = async (schedule: ScheduledEmail) => {
    const { orderId, userEmail, status, updateCount } = schedule;

    // Check if we've reached the maximum number of updates
    const maxUpdates = MAX_PERIODIC_UPDATES[status as keyof typeof MAX_PERIODIC_UPDATES] || 5;

    if (updateCount >= maxUpdates) {
        console.log(`[Email Scheduler] Max updates reached for order ${orderId}, stopping periodic emails`);
        stopPeriodicEmails(orderId);
        return;
    }

    // Fetch current order status to ensure it hasn't changed
    const { data: order } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single();

    if (!order || order.status !== status) {
        console.log(`[Email Scheduler] Order ${orderId} status changed, stopping periodic emails`);
        stopPeriodicEmails(orderId);
        return;
    }

    // Get email template
    const { subject, body } = getEmailTemplate(orderId, status, updateCount);

    // Send email
    await sendEmail(userEmail, subject, body, true);

    // Update schedule
    schedule.updateCount++;
    schedule.lastSent = new Date();
    activeSchedules.set(orderId, schedule);

    console.log(`[Email Scheduler] Sent update #${updateCount + 1} for order ${orderId}`);
};

/**
 * Start periodic email updates for an order
 */
export const startPeriodicEmails = async (
    orderId: string,
    userEmail: string,
    status: string
) => {
    // Stop any existing schedule for this order
    stopPeriodicEmails(orderId);

    // Get interval for this status
    const intervalMinutes = EMAIL_UPDATE_INTERVALS[status as keyof typeof EMAIL_UPDATE_INTERVALS] || 30;
    const intervalMs = intervalMinutes * 60 * 1000;

    console.log(`[Email Scheduler] Starting periodic emails for order ${orderId}, interval: ${intervalMinutes} minutes`);

    // Send immediate confirmation email
    const { subject, body } = getEmailTemplate(orderId, status, 0);
    await sendEmail(userEmail, subject, body, true);

    // Create schedule
    const schedule: ScheduledEmail = {
        orderId,
        userEmail,
        status,
        updateCount: 1,
        lastSent: new Date(),
    };

    // Set up periodic updates
    const intervalId = setInterval(() => {
        sendPeriodicUpdate(schedule);
    }, intervalMs);

    schedule.intervalId = intervalId;
    activeSchedules.set(orderId, schedule);

    // Store schedule in localStorage for persistence
    saveSchedulesToStorage();
};

/**
 * Stop periodic email updates for an order
 */
export const stopPeriodicEmails = (orderId: string) => {
    const schedule = activeSchedules.get(orderId);

    if (schedule?.intervalId) {
        clearInterval(schedule.intervalId);
        console.log(`[Email Scheduler] Stopped periodic emails for order ${orderId}`);
    }

    activeSchedules.delete(orderId);
    saveSchedulesToStorage();
};

/**
 * Update order status and adjust email schedule
 */
export const updateOrderEmailSchedule = async (
    orderId: string,
    newStatus: string,
    userEmail: string
) => {
    // Stop current schedule
    stopPeriodicEmails(orderId);

    // Start new schedule based on new status
    if (["confirmed", "processing", "shipped", "out_for_delivery"].includes(newStatus)) {
        await startPeriodicEmails(orderId, userEmail, newStatus);
    } else if (newStatus === "delivered" || newStatus === "cancelled") {
        // Send final email for delivered or cancelled orders
        const { subject, body } = getEmailTemplate(orderId, newStatus, 0);
        await sendEmail(userEmail, subject, body, true);
    }
};

/**
 * Save active schedules to localStorage
 */
const saveSchedulesToStorage = () => {
    const schedulesData = Array.from(activeSchedules.entries()).map(([orderId, schedule]) => ({
        orderId,
        userEmail: schedule.userEmail,
        status: schedule.status,
        updateCount: schedule.updateCount,
        lastSent: schedule.lastSent.toISOString(),
    }));

    localStorage.setItem("email_schedules", JSON.stringify(schedulesData));
};

/**
 * Restore schedules from localStorage (call on app init)
 */
export const restoreEmailSchedules = async () => {
    const stored = localStorage.getItem("email_schedules");

    if (!stored) return;

    try {
        const schedulesData = JSON.parse(stored);

        for (const data of schedulesData) {
            // Verify order still exists and status matches
            const { data: order } = await supabase
                .from("orders")
                .select("status")
                .eq("id", data.orderId)
                .single();

            if (order && order.status === data.status) {
                // Restart schedule
                await startPeriodicEmails(data.orderId, data.userEmail, data.status);
            }
        }
    } catch (error) {
        console.error("[Email Scheduler] Error restoring schedules:", error);
    }
};

/**
 * Get all active schedules (for admin monitoring)
 */
export const getActiveSchedules = () => {
    return Array.from(activeSchedules.values());
};

/**
 * Clear all schedules (for cleanup)
 */
export const clearAllSchedules = () => {
    activeSchedules.forEach((schedule) => {
        if (schedule.intervalId) {
            clearInterval(schedule.intervalId);
        }
    });
    activeSchedules.clear();
    localStorage.removeItem("email_schedules");
    console.log("[Email Scheduler] All schedules cleared");
};
