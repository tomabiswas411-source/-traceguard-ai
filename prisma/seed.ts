import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'traceguard_salt').digest('hex');
}

async function main() {
  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@traceguard.ai' },
    update: {},
    create: {
      email: 'demo@traceguard.ai',
      password: hashPassword('demo123'),
      name: 'Demo User',
    },
  });

  console.log('Demo user created:', demoUser);

  // Create some demo alerts
  const existingAlerts = await prisma.alert.count({
    where: { userId: demoUser.id },
  });

  if (existingAlerts === 0) {
    await prisma.alert.createMany({
      data: [
        {
          userId: demoUser.id,
          type: 'protection',
          title: 'Welcome to TraceGuard AI!',
          message: 'Your account is ready. Start protecting your images now.',
          severity: 'success',
          isRead: false,
        },
        {
          userId: demoUser.id,
          type: 'info',
          title: 'Getting Started',
          message: 'Upload your first image to generate a unique fingerprint.',
          severity: 'info',
          isRead: true,
        },
      ],
    });
    console.log('Demo alerts created');
  }

  console.log('\n=================================');
  console.log('Demo User Credentials:');
  console.log('Email: demo@traceguard.ai');
  console.log('Password: demo123');
  console.log('=================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
