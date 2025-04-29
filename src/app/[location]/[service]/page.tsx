import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import { Box, Container, Heading, Text, SimpleGrid, Card, CardBody, Image, VStack, HStack, Badge, Button } from '@chakra-ui/react';
import { Service, User, Profile, ServiceCategory, City } from '@prisma/client';
import LocationServiceClientPage from './client';

type ServiceWithProvider = Service & {
  provider: User & {
    profile: Profile | null;
  };
};

// Metadata is now a function that returns a Promise
export async function generateMetadata(props: { params: Promise<{ location: string; service: string }> }): Promise<Metadata> {
  // Use React.use() to unwrap the params promise
  const params = await props.params;
  const { location, service } = params;
  
  try {
    // Find the city by slug
    const city = await prisma.city.findUnique({
      where: { slug: location.toLowerCase() },
    });

    // Find the service category by slug
    const category = await prisma.serviceCategory.findUnique({
      where: { slug: service.toLowerCase() },
    });

    if (!city || !category) {
      return {
        title: 'Not Found',
        description: 'This page could not be found.'
      };
    }

    return {
      title: `${category.name} in ${city.name} | All Party Rent`,
      description: `Find the best ${category.name} services in ${city.name} - All Party Rent helps you find quality party ${category.name.toLowerCase()} services in your area.`
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error',
      description: 'There was an error loading this page.'
    };
  }
}

// Generate static paths for all location-service combinations
export async function generateStaticParams() {
  try {
    // Fetch all cities and categories from the database
    const cities = await prisma.city.findMany({
      select: { slug: true }
    });

    const categories = await prisma.serviceCategory.findMany({
      select: { slug: true }
    });

    // Generate paths for all combinations
    const paths = cities.flatMap(city =>
      categories.map(category => ({
        location: city.slug,
        service: category.slug,
      }))
    );

    return paths;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function LocationServicePage(props: { params: Promise<{ location: string; service: string }> }) {
  // Unwrap params promise
  const params = await props.params;
  const { location, service } = params;
  
  // Reserved paths that should not be handled by this route
  const reservedPaths = ['api', 'auth', 'admin', 'client', 'provider', 'services'];
  
  // Handle cases where the route was incorrectly matched to API routes
  if (location === 'api' || location === 'socket') {
    console.error(`API/Socket route incorrectly routed to location/service page: ${location}/${service}`);
    return notFound();
  }
  
  // If it's a system path, return 404
  if (reservedPaths.includes(location.toLowerCase()) ||
      reservedPaths.includes(service.toLowerCase()) ||
      location.includes('/') ||
      service.includes('/')) {
    console.error(`Reserved or invalid path used as location/service slug: location=${location}, service=${service}`);
    return notFound();
  }
  
  // If either parameter is empty, return 404
  if (!location || !service ||
      location.trim() === '' || service.trim() === '') {
    console.error(`Invalid params: location=${location}, service=${service}`);
    return notFound();
  }
  
  // Extract slugs for city and service
  const locationSlug = location.toLowerCase();
  const serviceSlug = service.toLowerCase();

  // Check if slugs contain special characters (only allow alphanumeric, dash, underscore)
  const validSlugPattern = /^[a-z0-9-_]+$/;
  if (!validSlugPattern.test(locationSlug) || !validSlugPattern.test(serviceSlug)) {
    console.error(`Invalid slug format: location=${locationSlug}, service=${serviceSlug}`);
    notFound();
  }

  try {
    // Find the city first
    const city = await prisma.city.findFirst({
      where: {
        slug: locationSlug,
      },
    });

    if (!city) {
      console.error(`City not found for slug: ${locationSlug}`);
      notFound();
    }

    // Find the service category
    const category = await prisma.serviceCategory.findFirst({
      where: {
        slug: serviceSlug,
      },
    });

    if (!category) {
      console.error(`Service category not found for slug: ${serviceSlug}`);
      notFound();
    }

    // Fetch all categories for filters
    const categories = await prisma.serviceCategory.findMany();
    
    // Fetch all cities for filters
    const cities = await prisma.city.findMany();
    
    // Use the correct table name for category filters
    let categoryFilters = [];
    try {
      // Check if the CategoryFilter table exists and fetch filters
      categoryFilters = await prisma.$queryRaw`
        SELECT * FROM "CategoryFilter"
        WHERE "categoryId" = ${category.id}
        ORDER BY "createdAt" ASC
      `;
    } catch (error) {
      console.error('Error fetching category filters:', error);
      // Continue with empty array
    }

    // Fetch services for this location and category
    const services = await prisma.service.findMany({
      where: {
        AND: [
          { categoryId: category.id },
          { status: 'ACTIVE' },
          {
            OR: [
              { cityId: city.id }, // Direct match on city
              {
                AND: [
                  // Provider has this city as a service location
                  {
                    providerId: {
                      in: await getProviderIdsWithCity(city.id)
                    }
                  },
                  // The service is either in this city or has no city specified
                  {
                    OR: [
                      { cityId: city.id },
                      { cityId: null }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      include: {
        provider: {
          include: {
            profile: true
          }
        }
      }
    });

    // Convert Decimal objects to numbers to avoid serialization issues
    const serializedServices = services.map(service => ({
      ...service,
      price: service.price ? Number(service.price) : 0,
    }));

    // Now pass the data to the client component
    return (
      <LocationServiceClientPage 
        services={serializedServices}
        categories={categories}
        cities={cities}
        currentCity={city}
        currentCategory={category}
        categoryFilters={categoryFilters || []}
      />
    );
  } catch (error) {
    console.error('Error fetching services:', error);
    return (
      <Container maxW="container.xl" py={8}>
        <Box p={8} textAlign="center" borderWidth="1px" borderRadius="md">
          <Text fontSize="lg" color="red.500">
            An error occurred while loading the services. Please try again later.
          </Text>
        </Box>
      </Container>
    );
  }
}

// Helper function to get providers who serve this city
async function getProviderIdsWithCity(cityId: string): Promise<string[]> {
  try {
    const providersWithCity = await prisma.$queryRaw`
      SELECT p."userId" as "providerId"
      FROM "ProviderCity" pc
      JOIN "Provider" p ON pc."providerId" = p.id
      WHERE pc."cityId" = ${cityId}
    `;
    
    const providerIds: string[] = [];
    if (Array.isArray(providersWithCity) && providersWithCity.length > 0) {
      providersWithCity.forEach((p: any) => {
        if (p.providerId) providerIds.push(p.providerId);
      });
    }
    
    return providerIds;
  } catch (error) {
    console.error(`Error finding providers for city ${cityId}:`, error);
    return [];
  }
} 