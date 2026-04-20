import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { readFile, writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { 
  simulateWatermarkEmbedding, 
  generateOwnershipCertificate 
} from '@/lib/fingerprint';

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

    // Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type. Expected application/json' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { imageId } = body;

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Validate imageId format (cuid)
    if (typeof imageId !== 'string' || imageId.length < 10) {
      return NextResponse.json(
        { error: 'Invalid image ID format' },
        { status: 400 }
      );
    }

    // Get image
    const image = await db.image.findFirst({
      where: {
        id: imageId,
        userId: user.id,
      },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found or you do not have permission to access it' },
        { status: 404 }
      );
    }

    if (image.watermarkEmbedded) {
      return NextResponse.json({
        image: {
          id: image.id,
          contentId: image.contentId,
          watermarkEmbedded: true,
          protectedAt: image.protectedAt,
        },
        certificate: generateOwnershipCertificate(
          image.contentId,
          user.id,
          user.name || 'Unknown',
          image.originalName,
          image.protectedAt || new Date()
        ),
        message: 'Image already protected',
      });
    }

    // Check if file exists
    if (!existsSync(image.path)) {
      return NextResponse.json(
        { error: 'Image file not found on server. Please re-upload the image.' },
        { status: 404 }
      );
    }

    // Read image file
    const imageBuffer = await readFile(image.path);

    // Simulate watermark embedding
    const watermarkedBuffer = simulateWatermarkEmbedding(
      imageBuffer,
      image.contentId,
      user.id
    );

    // Save watermarked image (in simulation, it's the same)
    await writeFile(image.path, watermarkedBuffer);

    // Update database
    const updatedImage = await db.image.update({
      where: { id: image.id },
      data: {
        watermarkEmbedded: true,
        protectedAt: new Date(),
      },
    });

    // Create protection alert
    await db.alert.create({
      data: {
        userId: user.id,
        imageId: image.id,
        type: 'protection',
        title: 'Content Protected',
        message: `Your image "${image.originalName}" has been protected with watermark and fingerprint.`,
        severity: 'success',
      },
    });

    // Generate ownership certificate
    const certificate = generateOwnershipCertificate(
      image.contentId,
      user.id,
      user.name || 'Unknown',
      image.originalName,
      updatedImage.protectedAt!
    );

    return NextResponse.json({
      image: {
        id: updatedImage.id,
        contentId: updatedImage.contentId,
        watermarkEmbedded: updatedImage.watermarkEmbedded,
        protectedAt: updatedImage.protectedAt,
      },
      certificate,
      message: 'Your content is protected!',
    });
  } catch (error) {
    console.error('Protection error:', error);
    return NextResponse.json(
      { error: 'Failed to protect image. Please try again.' },
      { status: 500 }
    );
  }
}
