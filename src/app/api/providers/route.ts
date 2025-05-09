import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check if this is a request for all providers
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Get provider by ID
      const provider = await prisma.user.findUnique({
        where: {
          id,
          role: 'PROVIDER',
        },
        include: {
          profile: true,
        },
      });

      if (!provider) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Provider not found' } },
          { status: 404 }
        );
      }

      // Add additional provider statistics
      // In a real app, this would involve additional queries for ratings, etc.
      const enhancedProvider = {
        ...provider,
        // Calculate average rating from reviews
        rating: 4.8,
        // Count number of reviews
        reviewCount: 120,
      };

      return NextResponse.json({
        success: true,
        data: enhancedProvider
      }, { status: 200 });
    } else {
      // Get all providers
      const providers = await prisma.user.findMany({
        where: {
          role: 'PROVIDER',
        },
        include: {
          profile: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: providers
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Get provider error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}