-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'INFLUENCER');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "CouponStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ArticleCategory" AS ENUM ('AYURVEDIC_HAIR_CARE', 'BOTANICAL_INGREDIENTS', 'HAIR_CARE_RITUALS', 'NATURAL_BEAUTY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Influencer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instagramHandle" TEXT,
    "phone" TEXT,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "totalSales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Influencer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "influencerId" TEXT,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "minimumOrderValue" DOUBLE PRECISION,
    "maximumDiscount" DOUBLE PRECISION,
    "expiryDate" TIMESTAMP(3),
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "status" "CouponStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderAttribution" (
    "id" TEXT NOT NULL,
    "shopifyOrderId" TEXT NOT NULL,
    "shopifyOrderName" TEXT,
    "influencerId" TEXT NOT NULL,
    "couponId" TEXT,
    "couponCode" TEXT NOT NULL,
    "orderValue" DOUBLE PRECISION NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "netOrderValue" DOUBLE PRECISION NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "commissionValue" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "refunded" BOOLEAN NOT NULL DEFAULT false,
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderAttribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "orderAttributionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "payoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstagramReel" (
    "id" TEXT NOT NULL,
    "instagramUrl" TEXT NOT NULL,
    "instagramMediaId" TEXT,
    "title" TEXT,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstagramReel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstagramSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "instagramHandle" TEXT NOT NULL DEFAULT '@shyn.ish',
    "instagramUrl" TEXT NOT NULL DEFAULT 'https://www.instagram.com/shyn.ish/',
    "reelsSectionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sectionHeading" TEXT NOT NULL DEFAULT 'THE SHYN.ISH LOOKBOOK',
    "sectionSubtitle" TEXT NOT NULL DEFAULT 'Real rituals. Real stories. From our community.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstagramSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfluencerApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "instagramHandle" TEXT NOT NULL,
    "followerCount" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfluencerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "ArticleCategory" NOT NULL,
    "imageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedWebhook" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsSnapshot" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "couponRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "couponOrders" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "announcementText" TEXT NOT NULL DEFAULT 'FREE SHIPPING ACROSS INDIA ┬╖ 100% NATURAL',
    "announcementEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_userId_key" ON "Influencer"("userId");

-- CreateIndex
CREATE INDEX "Influencer_userId_idx" ON "Influencer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_influencerId_idx" ON "Coupon"("influencerId");

-- CreateIndex
CREATE INDEX "Coupon_status_idx" ON "Coupon"("status");

-- CreateIndex
CREATE UNIQUE INDEX "OrderAttribution_shopifyOrderId_key" ON "OrderAttribution"("shopifyOrderId");

-- CreateIndex
CREATE INDEX "OrderAttribution_shopifyOrderId_idx" ON "OrderAttribution"("shopifyOrderId");

-- CreateIndex
CREATE INDEX "OrderAttribution_influencerId_idx" ON "OrderAttribution"("influencerId");

-- CreateIndex
CREATE INDEX "OrderAttribution_couponCode_idx" ON "OrderAttribution"("couponCode");

-- CreateIndex
CREATE UNIQUE INDEX "Commission_orderAttributionId_key" ON "Commission"("orderAttributionId");

-- CreateIndex
CREATE INDEX "Commission_influencerId_idx" ON "Commission"("influencerId");

-- CreateIndex
CREATE INDEX "Commission_status_idx" ON "Commission"("status");

-- CreateIndex
CREATE INDEX "Payout_influencerId_idx" ON "Payout"("influencerId");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- CreateIndex
CREATE INDEX "InstagramReel_isPublished_idx" ON "InstagramReel"("isPublished");

-- CreateIndex
CREATE INDEX "InstagramReel_displayOrder_idx" ON "InstagramReel"("displayOrder");

-- CreateIndex
CREATE INDEX "InfluencerApplication_email_idx" ON "InfluencerApplication"("email");

-- CreateIndex
CREATE INDEX "InfluencerApplication_status_idx" ON "InfluencerApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_email_idx" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "JournalArticle_slug_key" ON "JournalArticle"("slug");

-- CreateIndex
CREATE INDEX "JournalArticle_slug_idx" ON "JournalArticle"("slug");

-- CreateIndex
CREATE INDEX "JournalArticle_isPublished_idx" ON "JournalArticle"("isPublished");

-- CreateIndex
CREATE INDEX "ProcessedWebhook_shopifyId_idx" ON "ProcessedWebhook"("shopifyId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedWebhook_topic_shopifyId_key" ON "ProcessedWebhook"("topic", "shopifyId");

-- CreateIndex
CREATE INDEX "AnalyticsSnapshot_date_idx" ON "AnalyticsSnapshot"("date");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsSnapshot_date_key" ON "AnalyticsSnapshot"("date");

-- AddForeignKey
ALTER TABLE "Influencer" ADD CONSTRAINT "Influencer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderAttribution" ADD CONSTRAINT "OrderAttribution_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderAttribution" ADD CONSTRAINT "OrderAttribution_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_orderAttributionId_fkey" FOREIGN KEY ("orderAttributionId") REFERENCES "OrderAttribution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;



INSERT INTO "User" (id, email, "passwordHash", role, name, "isActive", "createdAt", "updatedAt") VALUES ('cuid-admin-1', 'admin@shynish.com', '$2b$10$MSQ09VATjJubw..dcQC.WelKvXkF98UNQFa/2.hHnIoOmynk5q1hi', 'ADMIN', 'Admin User', true, NOW(), NOW());
