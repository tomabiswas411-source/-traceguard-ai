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
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Validate file extension
function hasValidExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

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

    await ensureUploadDir();

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
        { error: 'No file provided. Please select an image to upload.' },
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

    // Validate file extension
    if (!hasValidExtension(file.name)) {
      return NextResponse.json(
        { error: `Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.` },
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

    // Sanitize filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate fingerprint
    const fingerprintHash = await generateImageFingerprint(buffer, sanitizedName);
    const contentId = generateContentId();

    // Check for duplicate
    const existingImage = await db.image.findFirst({
      where: { fingerprintHash },
    });

    // Generate unique stored name
    const timestamp = Date.now();
    const ext = sanitizedName.split('.').pop() || 'jpg';
    const storedName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, storedName);

    // Save file
    await writeFile(filePath, buffer);

    // Save to database
    const image = await db.image.create({
      data: {
        userId: user.id,
        originalName: sanitizedName,
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
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 }
    );
  }
}
