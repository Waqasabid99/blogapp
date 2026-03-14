import { ApiError } from "../lib/ApiError.js";
import { apiResponse, asyncHandler } from "../lib/helpers.js";
import { prisma } from "../lib/prisma.js";
import crypto from "crypto";

// Helper function to generate secure unsubscribe token
const generateUnsubscribeToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

// Helper function to validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// ==========================================
// SUBSCRIBER MANAGEMENT
// ==========================================

// Subscribe to newsletter (Public)
const subscribe = asyncHandler(async (req, res) => {
    const { email, userId } = req.body;

    // Validate email
    if (!email || !isValidEmail(email)) {
        throw new ApiError(400, "Valid email is required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email: normalizedEmail },
    });

    if (existingSubscriber) {
        if (existingSubscriber.isActive) {
            throw new ApiError(409, "Email is already subscribed");
        } else {
            // Reactivate subscription
            const unsubscribeToken = generateUnsubscribeToken();
            const updatedSubscriber = await prisma.newsletterSubscriber.update({
                where: { id: existingSubscriber.id },
                data: {
                    isActive: true,
                    unsubscribeToken,
                    userId: userId || existingSubscriber.userId,
                },
            });

            return apiResponse(res, 200, true, "Subscription reactivated successfully", {
                subscriber: {
                    id: updatedSubscriber.id,
                    email: updatedSubscriber.email,
                    isActive: updatedSubscriber.isActive,
                },
            });
        }
    }

    // Create new subscription
    const unsubscribeToken = generateUnsubscribeToken();
    const subscriber = await prisma.newsletterSubscriber.create({
        data: {
            email: normalizedEmail,
            userId: userId || null,
            unsubscribeToken,
            isActive: true,
        },
    });

    return apiResponse(res, 201, true, "Successfully subscribed to newsletter", {
        subscriber: {
            id: subscriber.id,
            email: subscriber.email,
            isActive: subscriber.isActive,
        },
    });
});

// Unsubscribe (Public - via token)
const unsubscribe = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        throw new ApiError(400, "Unsubscribe token is required");
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { unsubscribeToken: token },
    });

    if (!subscriber) {
        throw new ApiError(404, "Invalid unsubscribe token");
    }

    if (!subscriber.isActive) {
        return apiResponse(res, 200, true, "Already unsubscribed");
    }

    await prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: { isActive: false },
    });

    return apiResponse(res, 200, true, "Successfully unsubscribed from newsletter");
});

// Get all subscribers (Admin only)
const getAllSubscribers = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        search,
        status = "all", // all, active, inactive
        sortBy = "createdAt",
        order = "desc",
    } = req.query;

    const pageNumber = Math.max(parseInt(page), 1);
    const pageSize = Math.min(parseInt(limit), 100);
    const skip = (pageNumber - 1) * pageSize;

    // Build where clause
    const where = {};

    // Status filter
    if (status === "active") {
        where.isActive = true;
    } else if (status === "inactive") {
        where.isActive = false;
    }

    // Search filter
    if (search) {
        where.email = {
            contains: search,
            mode: "insensitive",
        };
    }

    // Allowed sort fields
    const allowedSortFields = ["createdAt", "updatedAt", "email"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const [subscribers, total] = await prisma.$transaction([
        prisma.newsletterSubscriber.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { [sortField]: sortOrder },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                _count: {
                    select: {
                        newsletterDeliveries: true,
                    },
                },
            },
        }),
        prisma.newsletterSubscriber.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    // Remove sensitive data
    const sanitizedSubscribers = subscribers.map((sub) => ({
        ...sub,
        unsubscribeToken: undefined,
    }));

    return apiResponse(res, 200, true, "Subscribers fetched successfully", {
        subscribers: sanitizedSubscribers,
        pagination: {
            total,
            page: pageNumber,
            limit: pageSize,
            totalPages,
        },
    });
});

// Get single subscriber (Admin only)
const getSubscriber = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                },
            },
            newsletterDeliveries: {
                orderBy: { createdAt: "desc" },
                take: 10,
                include: {
                    campaign: {
                        select: {
                            id: true,
                            subject: true,
                            sentAt: true,
                        },
                    },
                },
            },
        },
    });

    if (!subscriber) {
        throw new ApiError(404, "Subscriber not found");
    }

    // Remove sensitive token
    const { unsubscribeToken, ...subscriberData } = subscriber;

    return apiResponse(res, 200, true, "Subscriber fetched successfully", {
        subscriber: subscriberData,
    });
});

// Update subscriber (Admin only)
const updateSubscriber = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, isActive, userId } = req.body;

    const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { id },
    });

    if (!subscriber) {
        throw new ApiError(404, "Subscriber not found");
    }

    const updateData = {};

    // Update email if provided
    if (email !== undefined) {
        if (!isValidEmail(email)) {
            throw new ApiError(400, "Valid email is required");
        }
        const normalizedEmail = email.toLowerCase().trim();
        
        // Check for duplicate email
        if (normalizedEmail !== subscriber.email) {
            const existing = await prisma.newsletterSubscriber.findUnique({
                where: { email: normalizedEmail },
            });
            if (existing) {
                throw new ApiError(409, "Email already in use");
            }
        }
        updateData.email = normalizedEmail;
    }

    // Update active status
    if (isActive !== undefined) {
        updateData.isActive = Boolean(isActive);
    }

    // Update user link
    if (userId !== undefined) {
        if (userId === null) {
            updateData.userId = null;
        } else {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new ApiError(404, "User not found");
            }
            updateData.userId = userId;
        }
    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No valid fields provided for update");
    }

    const updatedSubscriber = await prisma.newsletterSubscriber.update({
        where: { id },
        data: updateData,
    });

    return apiResponse(res, 200, true, "Subscriber updated successfully", {
        subscriber: {
            id: updatedSubscriber.id,
            email: updatedSubscriber.email,
            isActive: updatedSubscriber.isActive,
        },
    });
});

// Delete subscriber (Admin only)
const deleteSubscriber = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { id },
    });

    if (!subscriber) {
        throw new ApiError(404, "Subscriber not found");
    }

    await prisma.newsletterSubscriber.delete({
        where: { id },
    });

    return apiResponse(res, 200, true, "Subscriber deleted successfully");
});

// Bulk import subscribers (Admin only)
const bulkImportSubscribers = asyncHandler(async (req, res) => {
    const { emails } = req.body;

    if (!Array.isArray(emails) || emails.length === 0) {
        throw new ApiError(400, "Emails array is required");
    }

    if (emails.length > 1000) {
        throw new ApiError(400, "Maximum 1000 emails allowed per batch");
    }

    const results = {
        success: [],
        failed: [],
        skipped: [],
    };

    // Process in chunks to avoid overwhelming the database
    const chunkSize = 100;
    for (let i = 0; i < emails.length; i += chunkSize) {
        const chunk = emails.slice(i, i + chunkSize);
        
        await prisma.$transaction(async (tx) => {
            for (const email of chunk) {
                const normalizedEmail = email.toLowerCase().trim();
                
                if (!isValidEmail(normalizedEmail)) {
                    results.failed.push({ email, reason: "Invalid email format" });
                    continue;
                }

                const existing = await tx.newsletterSubscriber.findUnique({
                    where: { email: normalizedEmail },
                });

                if (existing) {
                    if (!existing.isActive) {
                        // Reactivate
                        await tx.newsletterSubscriber.update({
                            where: { id: existing.id },
                            data: { isActive: true },
                        });
                        results.success.push({ email, action: "reactivated" });
                    } else {
                        results.skipped.push({ email, reason: "Already subscribed" });
                    }
                    continue;
                }

                const token = generateUnsubscribeToken();
                await tx.newsletterSubscriber.create({
                    data: {
                        email: normalizedEmail,
                        unsubscribeToken: token,
                        isActive: true,
                    },
                });
                results.success.push({ email, action: "created" });
            }
        });
    }

    return apiResponse(res, 200, true, "Bulk import completed", results);
});

// ==========================================
// CAMPAIGN MANAGEMENT
// ==========================================

// Create campaign (Admin only)
const createCampaign = asyncHandler(async (req, res) => {
    const { subject, content, scheduledAt } = req.body;

    // Validation
    if (!subject || subject.trim().length === 0) {
        throw new ApiError(400, "Subject is required");
    }

    if (!content || content.trim().length === 0) {
        throw new ApiError(400, "Content is required");
    }

    if (subject.length > 200) {
        throw new ApiError(400, "Subject must be less than 200 characters");
    }

    let scheduledDate = null;
    if (scheduledAt) {
        scheduledDate = new Date(scheduledAt);
        if (isNaN(scheduledDate.getTime())) {
            throw new ApiError(400, "Invalid scheduled date");
        }
        if (scheduledDate < new Date()) {
            throw new ApiError(400, "Scheduled date must be in the future");
        }
    }

    const campaign = await prisma.newsletterCampaign.create({
        data: {
            subject: subject.trim(),
            content: content.trim(),
            scheduledAt: scheduledDate,
        },
    });

    return apiResponse(res, 201, true, "Campaign created successfully", {
        campaign,
    });
});

// Get all campaigns (Admin only)
const getAllCampaigns = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        status = "all", // all, draft, scheduled, sent
        sortBy = "createdAt",
        order = "desc",
    } = req.query;

    const pageNumber = Math.max(parseInt(page), 1);
    const pageSize = Math.min(parseInt(limit), 50);
    const skip = (pageNumber - 1) * pageSize;

    const where = {};

    // Status filtering
    if (status === "scheduled") {
        where.scheduledAt = { not: null };
        where.sentAt = null;
    } else if (status === "sent") {
        where.sentAt = { not: null };
    } else if (status === "draft") {
        where.scheduledAt = null;
        where.sentAt = null;
    }

    const allowedSortFields = ["createdAt", "scheduledAt", "sentAt", "subject"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const [campaigns, total] = await prisma.$transaction([
        prisma.newsletterCampaign.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { [sortField]: sortOrder },
            include: {
                _count: {
                    select: {
                        deliveries: true,
                    },
                },
                deliveries: {
                    where: {
                        sentAt: { not: null },
                    },
                    select: {
                        openedAt: true,
                    },
                },
            },
        }),
        prisma.newsletterCampaign.count({ where }),
    ]);

    // Calculate open rates
    const campaignsWithStats = campaigns.map((campaign) => {
        const totalSent = campaign.deliveries.length;
        const totalOpened = campaign.deliveries.filter((d) => d.openedAt).length;
        const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(2) : 0;

        return {
            ...campaign,
            stats: {
                totalSent,
                totalOpened,
                openRate: `${openRate}%`,
            },
            deliveries: undefined,
        };
    });

    const totalPages = Math.ceil(total / pageSize);

    return apiResponse(res, 200, true, "Campaigns fetched successfully", {
        campaigns: campaignsWithStats,
        pagination: {
            total,
            page: pageNumber,
            limit: pageSize,
            totalPages,
        },
    });
});

// Get single campaign (Admin only)
const getCampaign = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const campaign = await prisma.newsletterCampaign.findUnique({
        where: { id },
        include: {
            deliveries: {
                include: {
                    subscriber: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!campaign) {
        throw new ApiError(404, "Campaign not found");
    }

    // Calculate detailed stats
    const stats = {
        totalRecipients: campaign.deliveries.length,
        sent: campaign.deliveries.filter((d) => d.sentAt).length,
        opened: campaign.deliveries.filter((d) => d.openedAt).length,
        clicked: campaign.deliveries.filter((d) => d.clickedAt).length,
        pending: campaign.deliveries.filter((d) => !d.sentAt).length,
    };

    return apiResponse(res, 200, true, "Campaign fetched successfully", {
        campaign: {
            ...campaign,
            stats,
        },
    });
});

// Update campaign (Admin only) - Only allowed if not sent yet
const updateCampaign = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { subject, content, scheduledAt } = req.body;

    const campaign = await prisma.newsletterCampaign.findUnique({
        where: { id },
    });

    if (!campaign) {
        throw new ApiError(404, "Campaign not found");
    }

    // Cannot edit sent campaigns
    if (campaign.sentAt) {
        throw new ApiError(400, "Cannot edit a campaign that has already been sent");
    }

    const updateData = {};

    if (subject !== undefined) {
        if (subject.trim().length === 0) {
            throw new ApiError(400, "Subject cannot be empty");
        }
        if (subject.length > 200) {
            throw new ApiError(400, "Subject must be less than 200 characters");
        }
        updateData.subject = subject.trim();
    }

    if (content !== undefined) {
        if (content.trim().length === 0) {
            throw new ApiError(400, "Content cannot be empty");
        }
        updateData.content = content.trim();
    }

    if (scheduledAt !== undefined) {
        if (scheduledAt === null) {
            updateData.scheduledAt = null;
        } else {
            const scheduledDate = new Date(scheduledAt);
            if (isNaN(scheduledDate.getTime())) {
                throw new ApiError(400, "Invalid scheduled date");
            }
            if (scheduledDate < new Date()) {
                throw new ApiError(400, "Scheduled date must be in the future");
            }
            updateData.scheduledAt = scheduledDate;
        }
    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No valid fields provided for update");
    }

    const updatedCampaign = await prisma.newsletterCampaign.update({
        where: { id },
        data: updateData,
    });

    return apiResponse(res, 200, true, "Campaign updated successfully", {
        campaign: updatedCampaign,
    });
});

// Delete campaign (Admin only)
const deleteCampaign = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const campaign = await prisma.newsletterCampaign.findUnique({
        where: { id },
        include: {
            _count: {
                select: { deliveries: true },
            },
        },
    });

    if (!campaign) {
        throw new ApiError(404, "Campaign not found");
    }

    // Prevent deletion of sent campaigns with deliveries
    if (campaign.sentAt && campaign._count.deliveries > 0) {
        throw new ApiError(400, "Cannot delete a sent campaign with delivery records");
    }

    await prisma.newsletterCampaign.delete({
        where: { id },
    });

    return apiResponse(res, 200, true, "Campaign deleted successfully");
});

// Send campaign immediately (Admin only)
const sendCampaign = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const campaign = await prisma.newsletterCampaign.findUnique({
        where: { id },
        include: {
            _count: {
                select: { deliveries: true },
            },
        },
    });

    if (!campaign) {
        throw new ApiError(404, "Campaign not found");
    }

    if (campaign.sentAt) {
        throw new ApiError(400, "Campaign has already been sent");
    }

    // Get all active subscribers
    const activeSubscribers = await prisma.newsletterSubscriber.findMany({
        where: { isActive: true },
        select: { id: true },
    });

    if (activeSubscribers.length === 0) {
        throw new ApiError(400, "No active subscribers to send to");
    }

    // Create deliveries and mark as sent
    await prisma.$transaction(async (tx) => {
        // Create delivery records
        const deliveryData = activeSubscribers.map((subscriber) => ({
            campaignId: id,
            subscriberId: subscriber.id,
            sentAt: new Date(),
        }));

        // Batch create deliveries
        const batchSize = 1000;
        for (let i = 0; i < deliveryData.length; i += batchSize) {
            const batch = deliveryData.slice(i, i + batchSize);
            await tx.newsletterDelivery.createMany({
                data: batch,
                skipDuplicates: true,
            });
        }

        // Update campaign as sent
        await tx.newsletterCampaign.update({
            where: { id },
            data: {
                sentAt: new Date(),
                scheduledAt: null,
            },
        });
    });

    // TODO: Integrate with your email service (SendGrid, AWS SES, Nodemailer, etc.)
    // await emailService.sendNewsletter(campaign, activeSubscribers);

    return apiResponse(res, 200, true, "Campaign sent successfully", {
        recipientsCount: activeSubscribers.length,
    });
});

// Schedule campaign (Admin only)
const scheduleCampaign = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { scheduledAt } = req.body;

    if (!scheduledAt) {
        throw new ApiError(400, "Scheduled date is required");
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
        throw new ApiError(400, "Invalid scheduled date");
    }

    if (scheduledDate < new Date()) {
        throw new ApiError(400, "Scheduled date must be in the future");
    }

    const campaign = await prisma.newsletterCampaign.findUnique({
        where: { id },
    });

    if (!campaign) {
        throw new ApiError(404, "Campaign not found");
    }

    if (campaign.sentAt) {
        throw new ApiError(400, "Cannot schedule a campaign that has already been sent");
    }

    const updatedCampaign = await prisma.newsletterCampaign.update({
        where: { id },
        data: { scheduledAt: scheduledDate },
    });

    return apiResponse(res, 200, true, "Campaign scheduled successfully", {
        campaign: updatedCampaign,
    });
});

// Cancel scheduled campaign (Admin only)
const cancelScheduledCampaign = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const campaign = await prisma.newsletterCampaign.findUnique({
        where: { id },
    });

    if (!campaign) {
        throw new ApiError(404, "Campaign not found");
    }

    if (!campaign.scheduledAt) {
        throw new ApiError(400, "Campaign is not scheduled");
    }

    if (campaign.sentAt) {
        throw new ApiError(400, "Cannot cancel a campaign that has already been sent");
    }

    const updatedCampaign = await prisma.newsletterCampaign.update({
        where: { id },
        data: { scheduledAt: null },
    });

    return apiResponse(res, 200, true, "Campaign schedule cancelled", {
        campaign: updatedCampaign,
    });
});

// ==========================================
// DELIVERY & ANALYTICS
// ==========================================

// Track email open (Pixel tracking)
const trackOpen = asyncHandler(async (req, res) => {
    const { deliveryId } = req.params;

    // Update delivery record
    await prisma.newsletterDelivery.updateMany({
        where: {
            id: deliveryId,
            openedAt: null,
        },
        data: {
            openedAt: new Date(),
        },
    });

    // Return 1x1 transparent pixel
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    
    // Transparent GIF pixel
    const pixel = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
    res.send(pixel);
});

// Track link click
const trackClick = asyncHandler(async (req, res) => {
    const { deliveryId } = req.params;
    const { url } = req.query;

    if (!url) {
        throw new ApiError(400, "URL parameter is required");
    }

    // Validate URL to prevent open redirects
    let targetUrl;
    try {
        targetUrl = new URL(url);
        // Optional: Add domain whitelist check here
    } catch (e) {
        throw new ApiError(400, "Invalid URL");
    }

    // Update click tracking
    await prisma.newsletterDelivery.updateMany({
        where: {
            id: deliveryId,
        },
        data: {
            clickedAt: new Date(),
        },
    });

    // Redirect to original URL
    res.redirect(targetUrl.toString());
});

// Get newsletter statistics (Admin only)
const getStatistics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.lte = new Date(endDate);
    }

    const [
        totalSubscribers,
        activeSubscribers,
        inactiveSubscribers,
        totalCampaigns,
        sentCampaigns,
        totalDeliveries,
        openedDeliveries,
        clickedDeliveries,
        recentSubscribers,
        recentCampaigns,
    ] = await prisma.$transaction([
        // Total subscribers
        prisma.newsletterSubscriber.count(),
        
        // Active subscribers
        prisma.newsletterSubscriber.count({ where: { isActive: true } }),
        
        // Inactive subscribers
        prisma.newsletterSubscriber.count({ where: { isActive: false } }),
        
        // Total campaigns
        prisma.newsletterCampaign.count(),
        
        // Sent campaigns
        prisma.newsletterCampaign.count({ where: { sentAt: { not: null } } }),
        
        // Total deliveries
        prisma.newsletterDelivery.count(),
        
        // Opened deliveries
        prisma.newsletterDelivery.count({ where: { openedAt: { not: null } } }),
        
        // Clicked deliveries
        prisma.newsletterDelivery.count({ where: { clickedAt: { not: null } } }),
        
        // Recent subscribers (last 7 days)
        prisma.newsletterSubscriber.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
                id: true,
                email: true,
                createdAt: true,
            },
        }),
        
        // Recent campaigns
        prisma.newsletterCampaign.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
                id: true,
                subject: true,
                sentAt: true,
                scheduledAt: true,
                createdAt: true,
            },
        }),
    ]);

    // Calculate rates
    const openRate = totalDeliveries > 0 
        ? ((openedDeliveries / totalDeliveries) * 100).toFixed(2) 
        : 0;
    const clickRate = totalDeliveries > 0 
        ? ((clickedDeliveries / totalDeliveries) * 100).toFixed(2) 
        : 0;
    const clickToOpenRate = openedDeliveries > 0 
        ? ((clickedDeliveries / openedDeliveries) * 100).toFixed(2) 
        : 0;

    return apiResponse(res, 200, true, "Statistics fetched successfully", {
        overview: {
            totalSubscribers,
            activeSubscribers,
            inactiveSubscribers,
            totalCampaigns,
            sentCampaigns,
        },
        engagement: {
            totalDeliveries,
            openedDeliveries,
            clickedDeliveries,
            openRate: `${openRate}%`,
            clickRate: `${clickRate}%`,
            clickToOpenRate: `${clickToOpenRate}%`,
        },
        recentActivity: {
            newSubscribers: recentSubscribers,
            recentCampaigns,
        },
    });
});

// Export subscribers (Admin only)
const exportSubscribers = asyncHandler(async (req, res) => {
    const { format = "json", status = "all" } = req.query;

    const where = {};
    if (status === "active") where.isActive = true;
    if (status === "inactive") where.isActive = false;

    const subscribers = await prisma.newsletterSubscriber.findMany({
        where,
        select: {
            email: true,
            isActive: true,
            createdAt: true,
            user: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    if (format === "csv") {
        // Generate CSV
        const headers = ["Email", "Status", "Name", "Subscribed At"];
        const rows = subscribers.map((s) => [
            s.email,
            s.isActive ? "active" : "inactive",
            s.user?.name || "",
            s.createdAt.toISOString(),
        ]);
        
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=subscribers.csv");
        return res.send(csv);
    }

    // Default JSON
    return apiResponse(res, 200, true, "Subscribers exported", {
        count: subscribers.length,
        subscribers,
    });
});

export {
    // Subscriber management
    subscribe,
    unsubscribe,
    getAllSubscribers,
    getSubscriber,
    updateSubscriber,
    deleteSubscriber,
    bulkImportSubscribers,
    
    // Campaign management
    createCampaign,
    getAllCampaigns,
    getCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    scheduleCampaign,
    cancelScheduledCampaign,
    
    // Tracking & Analytics
    trackOpen,
    trackClick,
    getStatistics,
    exportSubscribers,
};