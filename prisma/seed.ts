import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function generateHash(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateContentId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `TG-${timestamp}-${random}`.toUpperCase();
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.alert.deleteMany();
  await prisma.image.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create demo user
  const demoUser = await prisma.user.create({
    data: {
      id: 'demo-user-001',
      email: 'demo@traceguard.ai',
      password: '$2a$10$rQZ9QxZQxZQxZQxZQxZQxOZ9QxZQxZQxZQxZQxZQxZQxZQxZQxZQ', // demo123
      name: 'Demo User',
      avatar: null,
    },
  });

  // Create guest user
  const guestUser = await prisma.user.create({
    data: {
      id: 'guest-user',
      email: 'guest@traceguard.ai',
      password: 'guest-password',
      name: 'Guest User',
      avatar: null,
    },
  });

  console.log('✅ Created users');

  // Demo images data
  const demoImages = [
    {
      id: 'img-001',
      originalName: 'sunset-beach.jpg',
      storedName: 'sunset-beach-protected.jpg',
      path: '/upload/sunset-beach.jpg',
      size: 2458624,
      mimeType: 'image/jpeg',
      watermarkEmbedded: true,
      protectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      id: 'img-002',
      originalName: 'mountain-landscape.png',
      storedName: 'mountain-landscape-protected.png',
      path: '/upload/mountain-landscape.png',
      size: 3145728,
      mimeType: 'image/png',
      watermarkEmbedded: true,
      protectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      id: 'img-003',
      originalName: 'city-skyline.jpg',
      storedName: 'city-skyline.jpg',
      path: '/upload/city-skyline.jpg',
      size: 1572864,
      mimeType: 'image/jpeg',
      watermarkEmbedded: false,
      protectedAt: null,
    },
    {
      id: 'img-004',
      originalName: 'forest-path.jpg',
      storedName: 'forest-path-protected.jpg',
      path: '/upload/forest-path.jpg',
      size: 2097152,
      mimeType: 'image/jpeg',
      watermarkEmbedded: true,
      protectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      id: 'img-005',
      originalName: 'ocean-waves.png',
      storedName: 'ocean-waves.png',
      path: '/upload/ocean-waves.png',
      size: 4194304,
      mimeType: 'image/png',
      watermarkEmbedded: false,
      protectedAt: null,
    },
    {
      id: 'img-006',
      originalName: 'desert-dunes.jpg',
      storedName: 'desert-dunes-protected.jpg',
      path: '/upload/desert-dunes.jpg',
      size: 1835008,
      mimeType: 'image/jpeg',
      watermarkEmbedded: true,
      protectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  ];

  // Create images for demo user
  for (const img of demoImages) {
    await prisma.image.create({
      data: {
        id: img.id,
        userId: demoUser.id,
        originalName: img.originalName,
        storedName: img.storedName,
        path: img.path,
        size: img.size,
        mimeType: img.mimeType,
        fingerprintHash: generateHash(),
        contentId: generateContentId(),
        watermarkEmbedded: img.watermarkEmbedded,
        protectedAt: img.protectedAt,
      },
    });
  }

  console.log('✅ Created demo images');

  // Demo alerts
  const demoAlerts = [
    {
      id: 'alert-001',
      userId: demoUser.id,
      imageId: 'img-001',
      type: 'match',
      title: 'Duplicate Found Online',
      message: 'Your image "sunset-beach.jpg" was found on an external website. The content ID matches your protected image.',
      severity: 'warning',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 'alert-002',
      userId: demoUser.id,
      imageId: 'img-002',
      type: 'protection',
      title: 'Image Protected Successfully',
      message: 'Your image "mountain-landscape.png" has been protected with an invisible watermark.',
      severity: 'success',
      isRead: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'alert-003',
      userId: demoUser.id,
      imageId: 'img-004',
      type: 'duplicate',
      title: 'Potential Duplicate Detected',
      message: 'A similar image to "forest-path.jpg" was uploaded by another user. Similarity: 94%.',
      severity: 'warning',
      isRead: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: 'alert-004',
      userId: demoUser.id,
      imageId: null,
      type: 'protection',
      title: 'Protection Certificate Generated',
      message: 'Digital ownership certificate has been generated for your protected content.',
      severity: 'info',
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'alert-005',
      userId: demoUser.id,
      imageId: 'img-006',
      type: 'match',
      title: 'Exact Match Found',
      message: 'Your protected image "desert-dunes.jpg" was found on social media platform. Content ID verified.',
      severity: 'error',
      isRead: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
  ];

  // Create alerts
  for (const alert of demoAlerts) {
    await prisma.alert.create({
      data: {
        id: alert.id,
        userId: alert.userId,
        imageId: alert.imageId,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        isRead: alert.isRead,
        createdAt: alert.createdAt,
      },
    });
  }

  console.log('✅ Created demo alerts');

  // Create a demo session for the demo user
  await prisma.session.create({
    data: {
      id: 'session-demo',
      userId: demoUser.id,
      token: 'demo-token-' + generateHash(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  console.log('✅ Created demo session');

  // Summary
  const userCount = await prisma.user.count();
  const imageCount = await prisma.image.count();
  const alertCount = await prisma.alert.count();

  console.log('\n🎉 Seed completed!');
  console.log('📊 Summary:');
  console.log(`   - Users: ${userCount}`);
  console.log(`   - Images: ${imageCount}`);
  console.log(`   - Alerts: ${alertCount}`);
  console.log('\n🔐 Demo credentials:');
  console.log('   Email: demo@traceguard.ai');
  console.log('   Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
