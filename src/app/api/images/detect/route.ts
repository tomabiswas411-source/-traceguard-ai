import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateImageFingerprint, calculateHashSimilarity } from '@/lib/fingerprint';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate fingerprint
    const fingerprintHash = await generateImageFingerprint(buffer, file.name);

    // Get all images from database
    const allImages = await db.image.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Find matches
    const matches: Array<{
      image: typeof allImages[0];
      similarity: number;
    }> = [];

    for (const image of allImages) {
      const similarity = calculateHashSimilarity(fingerprintHash, image.fingerprintHash);
      
      // Consider it a match if similarity is above 90%
      if (similarity >= 0.9) {
        matches.push({
          image,
          similarity,
        });
      }
    }

    // Sort by similarity (highest first)
    matches.sort((a, b) => b.similarity - a.similarity);

    const isMatchFound = matches.length > 0;

    // Create alert if match found
    if (isMatchFound) {
      await db.alert.create({
        data: {
          userId: user.id,
          type: 'match',
          title: 'Content Match Detected',
          message: `Found ${matches.length} similar image(s) in the database for "${file.name}"`,
          severity: matches[0].similarity === 1 ? 'error' : 'warning',
        },
      });
    }

    return NextResponse.json({
      isMatchFound,
      matches: matches.slice(0, 10).map(m => ({
        id: m.image.id,
        contentId: m.image.contentId,
        originalName: m.image.originalName,
        similarity: Math.round(m.similarity * 100) / 100,
        protectedAt: m.image.protectedAt,
        owner: m.image.user.name || m.image.user.email,
        isExactMatch: m.similarity === 1,
      })),
      scannedFingerprint: fingerprintHash,
      totalScanned: allImages.length,
      message: isMatchFound 
        ? '⚠️ Possible duplicate or reused content detected!'
        : '✅ No match found',
    });
  } catch (error) {
    console.error('Detection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
