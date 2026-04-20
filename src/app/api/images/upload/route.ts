import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { generateImageFingerprint, generateContentId } from '@/lib/fingerprint';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

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

    await ensureUploadDir();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate fingerprint
    const fingerprintHash = await generateImageFingerprint(buffer, file.name);
    const contentId = generateContentId();

    // Check for duplicate
    const existingImage = await db.image.findFirst({
      where: { fingerprintHash },
    });

    // Generate unique stored name
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const storedName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, storedName);

    // Save file
    await writeFile(filePath, buffer);

    // Save to database
    const image = await db.image.create({
      data: {
        userId: user.id,
        originalName: file.name,
        storedName,
        path: filePath,
        size: file.size,
        mimeType: file.type,
        fingerprintHash,
        contentId,
      },
    });

    // If duplicate found, create alert
    if (existingImage) {
      await db.alert.create({
        data: {
          userId: user.id,
          imageId: image.id,
          type: 'duplicate',
          title: 'Duplicate Image Detected',
          message: `This image appears to be a duplicate of an existing image in the database.`,
          severity: 'warning',
        },
      });
    }

    return NextResponse.json({
      image: {
        id: image.id,
        originalName: image.originalName,
        size: image.size,
        fingerprintHash: image.fingerprintHash,
        contentId: image.contentId,
        isDuplicate: !!existingImage,
        duplicateOf: existingImage ? {
          id: existingImage.id,
          contentId: existingImage.contentId,
        } : null,
      },
      message: existingImage 
        ? '⚠️ Possible duplicate detected!' 
        : 'Image uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
