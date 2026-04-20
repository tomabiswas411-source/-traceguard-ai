import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateImageFingerprint, calculateHashSimilarity } from '@/lib/fingerprint';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MATCH_THRESHOLD = 0.9; // 90% similarity threshold
const MAX_RESULTS = 10;

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Check content type for multipart form
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid content type. Expected multipart/form-data' },
        { status: 400 }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse form data' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Please select an image to scan.' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.` },
        { status: 400 }
      );
    }

    // Validate file is not empty
    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty. Please select a valid image.' },
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
      
      // Consider it a match if similarity is above threshold
      if (similarity >= MATCH_THRESHOLD) {
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
      matches: matches.slice(0, MAX_RESULTS).map(m => ({
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
      { error: 'Failed to scan image. Please try again.' },
      { status: 500 }
    );
  }
}
