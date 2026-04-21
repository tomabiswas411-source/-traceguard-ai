import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const data = JSON.parse(body);
    
    // In a real app, you would update Firestore here
    // For now, we just log it
    console.log('User going offline:', data);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Offline status recorded',
      userId: data.userId 
    });
  } catch (error) {
    console.error('Error setting offline status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to set offline status' 
    }, { status: 500 });
  }
}
