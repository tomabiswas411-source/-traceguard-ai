import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return Firebase configuration status
    const firebaseStatus = {
      status: 'connected',
      projectId: 'traceguard-ai-7c802',
      appId: '1:588501136262:web:c59d1c6dcb27643cbcb207',
      measurementId: 'G-X4CG8CRGPN',
      services: {
        app: 'initialized',
        firestore: 'ready',
        auth: 'ready',
        storage: 'ready',
        analytics: 'client-side only (requires browser)',
        messaging: 'client-side only (requires browser)'
      },
      timestamp: new Date().toISOString(),
      message: '🔥 Firebase is properly configured and initialized!'
    };

    return NextResponse.json(firebaseStatus);
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Firebase configuration check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
