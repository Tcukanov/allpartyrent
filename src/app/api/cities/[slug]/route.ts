import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { DEFAULT_CITY_SETTING_KEY } from '@/lib/cities/default-city';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Unwrap the params Promise
    const unwrappedParams = await params;
    const { slug } = unwrappedParams;
    
    console.log(`Fetching city with slug: ${slug}`);
    
    // Try to find by id first
    let city = null;
    if (slug.match(/^[0-9a-fA-F]{24}$/) || slug.match(/^[0-9a-fA-F]{12}$/)) {
      city = await prisma.city.findUnique({
        where: { id: slug }
      });
    }
    
    // If not found by id, try to find by slug
    if (!city) {
      city = await prisma.city.findFirst({
        where: { slug: slug.toLowerCase() }
      });
    }

    if (!city) {
      console.error(`City not found for slug: ${slug}`);
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'City not found' } },
        { status: 404 }
      );
    }

    // Check if this is the default city
    const defaultCitySetting = await prisma.systemSettings.findUnique({
      where: { key: DEFAULT_CITY_SETTING_KEY }
    });
    
    const isDefault = defaultCitySetting?.value === city.id;

    console.log(`City found: ${city.name} (${city.id}), isDefault: ${isDefault}`);
    return NextResponse.json({
      success: true,
      data: {
        ...city,
        isDefault
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching city:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to fetch city',
          details: error instanceof Error ? error.message : 'Unknown error' 
        } 
      },
      { status: 500 }
    );
  }
} 