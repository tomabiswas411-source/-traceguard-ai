import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const images = await db.image.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      images: images.map(img => ({
        id: img.id,
        originalName: img.originalName,
        size: img.size,
        mimeType: img.mimeType,
        fingerprintHash: img.fingerprintHash,
        contentId: img.contentId,
        watermarkEmbedded: img.watermarkEmbedded,
        protectedAt: img.protectedAt,
        createdAt: img.createdAt,
      })),
      total: images.length,
    });
  } catch (error) {
    console.error('Get images error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
