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

    const alerts = await db.alert.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json({
      alerts: alerts.map(alert => ({
        id: alert.id,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        isRead: alert.isRead,
        createdAt: alert.createdAt,
      })),
      total: alerts.length,
      unread: alerts.filter(a => !a.isRead).length,
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { alertId, markAllRead } = body;

    if (markAllRead) {
      await db.alert.updateMany({
        where: {
          userId: user.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({
        message: 'All alerts marked as read',
      });
    }

    if (alertId) {
      await db.alert.update({
        where: {
          id: alertId,
          userId: user.id,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({
        message: 'Alert marked as read',
      });
    }

    return NextResponse.json(
      { error: 'No action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update alert error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
