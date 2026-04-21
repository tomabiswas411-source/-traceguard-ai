import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { readFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('session_token')?.value;
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate ID format
    if (!id || typeof id !== 'string' || id.length < 10) {
      return NextResponse.json(
        { error: 'Invalid image ID' },
        { status: 400 }
      );
    }

    const image = await db.image.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Check if file exists
    if (!existsSync(image.path)) {
      return NextResponse.json(
        { error: 'Image file not found on server' },
        { status: 404 }
      );
    }

    // Read image file
    const imageBuffer = await readFile(image.path);

    // Return image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': image.mimeType,
        'Content-Disposition': `inline; filename="${image.originalName}"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Get image error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve image' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('session_token')?.value;
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate ID format
    if (!id || typeof id !== 'string' || id.length < 10) {
      return NextResponse.json(
        { error: 'Invalid image ID' },
        { status: 400 }
      );
    }

    const image = await db.image.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Delete file from disk (ignore errors if file doesn't exist)
    try {
      if (existsSync(image.path)) {
        await unlink(image.path);
      }
    } catch (fileError) {
      console.warn('Failed to delete image file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await db.image.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image. Please try again.' },
      { status: 500 }
    );
  }
}
