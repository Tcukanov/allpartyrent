"use client";

import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  Flex,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Select,
  Checkbox,
  CheckboxGroup,
  Stack,
  useToast,
  Divider,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import { ChevronRightIcon, CheckCircleIcon, InfoIcon, StarIcon } from '@chakra-ui/icons';
import { FaMoneyBillWave, FaClipboardCheck, FaUserPlus, FaStore } from 'react-icons/fa';
import MainLayout from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Service categories
const serviceCategories = [
  'Decoration',
  'Catering',
  'Entertainment',
  'Venue',
  'Photography',
  'Music',
  'Bounce House',
  'Clown/Entertainer',
  'Party Supplies',
  'Transportation'
];

// Cities
const cities = [
  'New York',
  'Los Angeles',
  'Chicago',
  'Houston',
  'Miami',
  'Seattle',
  'Boston',
  'San Francisco',
  'Denver',
  'Atlanta'
];

// Days of week
const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export default function ProviderJoinPage() {
  const toast = useToast();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data for all steps
  const [formData, setFormData] = useState({
    // Account Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Business Info
    businessName: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    description: '',
    
    // Service Info
    categories: [],
    serviceCities: [],
    availability: [],
    priceRange: 'medium',
    
    // Terms
    acceptTerms: false,
    acceptPaymentTerms: false
  });
  
  // Steps configuration
  const steps = [
    { title: 'Account', description: 'Create your account' },
    { title: 'Business', description: 'Business information' },
    { title: 'Services', description: 'Service details' },
    { title: 'Review', description: 'Review and submit' }
  ];
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle checkbox group change
  const handleCheckboxGroupChange = (name, values) => {
    setFormData(prev => ({
      ...prev,
      [name]: values
    }));
  };
  
  // Validate current step
  const validateStep = () => {
    switch (activeStep) {
      case 0: // Account Info
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          toast({
            title: "Missing fields",
            description: "Please fill in all required fields",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return false;
        }
        
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Passwords don't match",
            description: "Please make sure your passwords match",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return false;
        }
        
        if (formData.password.length < 8) {
          toast({
            title: "Password too short",
            description: "Password must be at least 8 characters long",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return false;
        }
        
        return true;
        
      case 1: // Business Info
        if (!formData.businessName || !formData.phone || !formData.city || !formData.description) {
          toast({
            title: "Missing fields",
            description: "Please fill in all required fields",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return false;
        }
        return true;
        
      case 2: // Service Info
        if (formData.categories.length === 0 || formData.serviceCities.length === 0 || formData.availability.length === 0) {
          toast({
            title: "Missing selections",
            description: "Please select at least one category, city, and day of availability",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return false;
        }
        return true;
        
      case 3: // Review
        if (!formData.acceptTerms || !formData.acceptPaymentTerms) {
          toast({
            title: "Terms not accepted",
            description: "Please accept the terms and conditions to continue",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };
  
  // Handle previous step
  const handlePrevious = () => {
    setActiveStep(prev => prev - 1);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would call your API to register the provider
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Registration successful!",
        description: "Your provider account has been created. You can now log in.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect to login page
      setTimeout(() => {
        router.push('/auth/signin?role=provider');
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.message || "There was an error creating your account. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <MainLayout>
      <Box bg="brand.600" color="white" py={16}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10} alignItems="center">
            <Box>
              <Heading as="h1" size="2xl" mb={4}>Join as a Service Provider</Heading>
              <Text fontSize="xl">
                Grow your business by connecting with clients looking for your services. 
                Our platform helps you find new opportunities and manage your bookings efficiently.
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={8}>
                <HStack spacing={4}>
                  <Icon as={FaUserPlus} boxSize={6} />
                  <Text>Expand your client base</Text>
                </HStack>
                <HStack spacing={4}>
                  <Icon as={FaMoneyBillWave} boxSize={6} />
                  <Text>Secure payments via escrow</Text>
                </HStack>
                <HStack spacing={4}>
                  <Icon as={FaClipboardCheck} boxSize={6} />
                  <Text>Simplified booking management</Text>
                </HStack>
                <HStack spacing={4}>
                  <Icon as={FaStore} boxSize={6} />
                  <Text>Marketing opportunities</Text>
                </HStack>
              </SimpleGrid>
            </Box>
            
            <Card shadow="lg">
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Stepper index={activeStep} colorScheme="brand">
                    {steps.map((step, index) => (
                      <Step key={index}>
                        <StepIndicator>
                          <StepStatus 
                            complete={<StepIcon />} 
                            incomplete={<StepNumber />} 
                            active={<StepNumber />} 
                          />
                        </StepIndicator>
                        
                        <Box flexShrink="0">
                          <StepTitle>{step.title}</StepTitle>
                          <StepDescription>{step.description}</StepDescription>
                        </Box>
                        
                        <StepSeparator />
                      </Step>
                    ))}
                  </Stepper>
                  
                  <Box mt={6}>
                    {activeStep === 0 && (
                      <VStack spacing={4} as="form">
                        <Heading size="md">Create Your Account</Heading>
                        
                        <FormControl isRequired>
                          <FormLabel>Full Name</FormLabel>
                          <Input 
                            name="name" 
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe" 
                          />
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Email Address</FormLabel>
                          <Input 
                            name="email" 
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com" 
                          />
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Password</FormLabel>
                          <Input 
                            name="password" 
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="At least 8 characters" 
                          />
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Confirm Password</FormLabel>
                          <Input 
                            name="confirmPassword" 
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password" 
                          />
                        </FormControl>
                      </VStack>
                    )}
                    
                    {activeStep === 1 && (
                      <VStack spacing={4} as="form">
                        <Heading size="md">Business Information</Heading>
                        
                        <FormControl isRequired>
                          <FormLabel>Business Name</FormLabel>
                          <Input 
                            name="businessName" 
                            value={formData.businessName}
                            onChange={handleChange}
                            placeholder="Your Company Name" 
                          />
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Phone Number</FormLabel>
                          <Input 
                            name="phone" 
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(555) 123-4567" 
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Website (Optional)</FormLabel>
                          <Input 
                            name="website" 
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://yourwebsite.com" 
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Business Address (Optional)</FormLabel>
                          <Input 
                            name="address" 
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="123 Main St, Suite 101" 
                          />
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>City</FormLabel>
                          <Select 
                            name="city" 
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Select primary city"
                          >
                            {cities.map(city => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </Select>
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Business Description</FormLabel>
                          <Textarea 
                            name="description" 
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Tell clients about your business and services..." 
                            rows={4}
                          />
                        </FormControl>
                      </VStack>
                    )}
                    
                    {activeStep === 2 && (
                      <VStack spacing={6} as="form">
                        <Heading size="md">Service Details</Heading>
                        
                        <FormControl isRequired>
                          <FormLabel>Service Categories</FormLabel>
                          <Text fontSize="sm" color="gray.600" mb={2}>
                            Select all service categories your business offers
                          </Text>
                          <CheckboxGroup 
                            value={formData.categories}
                            onChange={(values) => handleCheckboxGroupChange('categories', values)}
                          >
                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                              {serviceCategories.map(category => (
                                <Checkbox key={category} value={category}>{category}</Checkbox>
                              ))}
                            </SimpleGrid>
                          </CheckboxGroup>
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Service Areas</FormLabel>
                          <Text fontSize="sm" color="gray.600" mb={2}>
                            Select cities where you provide services
                          </Text>
                          <CheckboxGroup 
                            value={formData.serviceCities}
                            onChange={(values) => handleCheckboxGroupChange('serviceCities', values)}
                          >
                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                              {cities.map(city => (
                                <Checkbox key={city} value={city}>{city}</Checkbox>
                              ))}
                            </SimpleGrid>
                          </CheckboxGroup>
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Availability</FormLabel>
                          <Text fontSize="sm" color="gray.600" mb={2}>
                            Select days when you're typically available
                          </Text>
                          <CheckboxGroup 
                            value={formData.availability}
                            onChange={(values) => handleCheckboxGroupChange('availability', values)}
                          >
                            <Stack spacing={2}>
                              {daysOfWeek.map(day => (
                                <Checkbox key={day} value={day}>{day}</Checkbox>
                              ))}
                            </Stack>
                          </CheckboxGroup>
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Price Range</FormLabel>
                          <Select 
                            name="priceRange" 
                            value={formData.priceRange}
                            onChange={handleChange}
                          >
                            <option value="budget">Budget-friendly</option>
                            <option value="medium">Mid-range</option>
                            <option value="premium">Premium</option>
                            <option value="luxury">Luxury</option>
                          </Select>
                        </FormControl>
                      </VStack>
                    )}
                    
                    {activeStep === 3 && (
                      <VStack spacing={6} as="form" onSubmit={handleSubmit}>
                        <Heading size="md">Review Your Application</Heading>
                        
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                          <Card variant="outline">
                            <CardBody>
                              <Heading size="sm" mb={3}>Account Information</Heading>
                              <VStack align="start" spacing={2}>
                                <Text><strong>Name:</strong> {formData.name}</Text>
                                <Text><strong>Email:</strong> {formData.email}</Text>
                              </VStack>
                            </CardBody>
                          </Card>
                          
                          <Card variant="outline">
                            <CardBody>
                              <Heading size="sm" mb={3}>Business Information</Heading>
                              <VStack align="start" spacing={2}>
                                <Text><strong>Business Name:</strong> {formData.businessName}</Text>
                                <Text><strong>Phone:</strong> {formData.phone}</Text>
                                <Text><strong>City:</strong> {formData.city}</Text>
                              </VStack>
                            </CardBody>
                          </Card>
                          
                          <Card variant="outline" gridColumn={{ md: "span 2" }}>
                            <CardBody>
                              <Heading size="sm" mb={3}>Service Information</Heading>
                              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                <Box>
                                  <Text fontWeight="bold" mb={1}>Categories:</Text>
                                  <List spacing={1}>
                                    {formData.categories.map(category => (
                                      <ListItem key={category}>
                                        <ListIcon as={CheckCircleIcon} color="green.500" />
                                        {category}
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                                
                                <Box>
                                  <Text fontWeight="bold" mb={1}>Service Areas:</Text>
                                  <List spacing={1}>
                                    {formData.serviceCities.map(city => (
                                      <ListItem key={city}>
                                        <ListIcon as={CheckCircleIcon} color="green.500" />
                                        {city}
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                                
                                <Box>
                                  <Text fontWeight="bold" mb={1}>Availability:</Text>
                                  <List spacing={1}>
                                    {formData.availability.map(day => (
                                      <ListItem key={day}>
                                        <ListIcon as={CheckCircleIcon} color="green.500" />
                                        {day}
                                      </ListItem>
                                    ))}
                                  </List>
                                  <Text mt={2}><strong>Price Range:</strong> {formData.priceRange}</Text>
                                </Box>
                              </SimpleGrid>
                            </CardBody>
                          </Card>
                        </SimpleGrid>
                        
                        <Divider />
                        
                        <VStack align="start" w="full" spacing={4}>
                          <FormControl isRequired>
                            <Checkbox 
                              name="acceptTerms"
                              isChecked={formData.acceptTerms}
                              onChange={handleChange}
                            >
                              I agree to the <Text as="span" color="brand.500" textDecoration="underline" onClick={() => window.open('/terms', '_blank')} cursor="pointer">Terms and Conditions</Text> and <Text as="span" color="brand.500" textDecoration="underline" onClick={() => window.open('/privacy', '_blank')} cursor="pointer">Privacy Policy</Text>
                            </Checkbox>
                          </FormControl>
                          
                          <FormControl isRequired>
                            <Checkbox 
                              name="acceptPaymentTerms"
                              isChecked={formData.acceptPaymentTerms}
                              onChange={handleChange}
                            >
                              I understand and agree to the payment processing fee and escrow terms
                            </Checkbox>
                          </FormControl>
                        </VStack>
                      </VStack>
                    )}
                    
                    <Flex justify="space-between" mt={8}>
                      {activeStep > 0 && (
                        <Button onClick={handlePrevious} variant="outline">
                          Previous
                        </Button>
                      )}
                      
                      {activeStep < steps.length - 1 ? (
                        <Button onClick={handleNext} colorScheme="brand" ml="auto">
                          Next
                        </Button>
                      ) : (
                        <Button 
                          colorScheme="brand" 
                          ml="auto"
                          onClick={handleSubmit}
                          isLoading={isSubmitting}
                          loadingText="Submitting"
                        >
                          Complete Registration
                        </Button>
                      )}
                    </Flex>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Container>
      </Box>
    </MainLayout>
  );
}