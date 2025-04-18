'use client';

import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text,
  VStack,
  useToast,
  Box,
  Flex
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ServiceRequestPayment from '../payment/ServiceRequestPayment';
import ServiceAvailabilityCalendar from './ServiceAvailabilityCalendar';
import { useRouter } from 'next/navigation';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Steps for the booking process
const steps = [
  { title: 'Pick Date & Time', description: 'Select when you need the service' },
  { title: 'Payment', description: 'Complete your booking' },
  { title: 'Confirmation', description: 'Booking confirmed' }
];

const ServiceRequestButton = ({ service, offer }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  // Booking details
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(service?.minRentalHours || 1);
  const [bookingComments, setBookingComments] = useState('');
  const [bookingAddress, setBookingAddress] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);

  console.log("ServiceRequestButton received service:", JSON.stringify({
    id: service?.id,
    name: service?.name,
    price: service?.price,
    providerId: service?.providerId,
    availableDays: service?.availableDays,
    availableHoursStart: service?.availableHoursStart,
    availableHoursEnd: service?.availableHoursEnd,
    minRentalHours: service?.minRentalHours,
    maxRentalHours: service?.maxRentalHours
  }, null, 2));

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
  };
  
  const handleCommentChange = (comment) => {
    setBookingComments(comment);
  };
  
  const handleAddressChange = (address) => {
    setBookingAddress(address);
  };

  const handleProceedToPayment = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select both a date and time for your booking",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Format the booking details for display and API submission
    const bookingInfo = {
      date: selectedDate,
      time: selectedTime,
      duration: selectedDuration,
      comments: bookingComments,
      address: bookingAddress,
      formattedDate: selectedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      // Format as ISO string for API
      isoDateTime: new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedTime.split(':')[0],
        selectedTime.split(':')[1]
      ).toISOString()
    };

    setBookingDetails(bookingInfo);
    setActiveStep(1); // Move to payment step
  };

  const handlePaymentComplete = (transaction) => {
    setPaymentCompleted(true);
    setActiveStep(2); // Move to confirmation step
    
    toast({
      title: "Service Request Submitted",
      description: "Your payment has been authorized and the provider has been notified. You will be redirected to your transactions page.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    
    // Redirect to transactions page after a short delay
    setTimeout(() => {
      router.push('/client/transactions');
    }, 3000);
  };

  const handleBack = () => {
    if (activeStep === 1) {
      setActiveStep(0); // Go back to date selection
    } else {
      onClose(); // Close modal if on first step
    }
  };

  const handleCancel = () => {
    onClose();
    // Reset everything when modal closes
    setTimeout(() => {
      setActiveStep(0);
      setSelectedDate(null);
      setSelectedTime('');
      setBookingDetails(null);
      setPaymentCompleted(false);
    }, 300);
  };

  // Format booking details for the confirmation step
  const getFormattedBookingInfo = () => {
    if (!selectedDate) return null;

    const date = new Date(selectedDate);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      date: selectedDate,
      formattedDate,
      time: selectedTime,
      duration: selectedDuration,
      address: bookingAddress,
      comments: bookingComments,
    };
  };

  return (
    <>
      <Button 
        onClick={onOpen} 
        colorScheme="blue" 
        size="lg" 
        width="full"
        isLoading={isSubmitting}
      >
        Send Request
      </Button>

      <Modal isOpen={isOpen} onClose={handleCancel} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {steps[activeStep].title}
            <Text fontSize="sm" color="gray.500" mt={1}>
              {service?.name || offer?.service?.name}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          
          {/* Custom Stepper */}
          <Box px={6} mb={6} mt={4}>
            <Flex justify="space-between" align="center" width="100%">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  {/* Step Item */}
                  <VStack 
                    spacing={1}
                    flexBasis="30%"
                    align="center"
                    opacity={index < activeStep ? 1 : index === activeStep ? 1 : 0.5}
                  >
                    {/* Number Indicator */}
                    <Flex
                      w="30px"
                      h="30px"
                      borderRadius="full"
                      bg={index < activeStep ? "green.500" : index === activeStep ? "blue.500" : "gray.200"}
                      color="white"
                      justify="center"
                      align="center"
                      fontWeight="bold"
                    >
                      {index < activeStep ? <CheckIcon fontSize="sm" /> : index + 1}
                    </Flex>
                    
                    {/* Step Title and Description */}
                    <Text 
                      fontWeight="medium" 
                      fontSize="sm" 
                      textAlign="center"
                      color={index === activeStep ? "blue.500" : "gray.700"}
                    >
                      {step.title}
                    </Text>
                    <Text 
                      fontSize="xs" 
                      color="gray.500" 
                      textAlign="center"
                      display={{ base: 'none', md: 'block' }}
                    >
                      {step.description}
                    </Text>
                  </VStack>
                  
                  {/* Separator Line */}
                  {index < steps.length - 1 && (
                    <Box 
                      height="1px" 
                      bg={index < activeStep ? "green.500" : "gray.200"} 
                      flex="1"
                    />
                  )}
                </React.Fragment>
              ))}
            </Flex>
          </Box>
          
          <ModalBody pb={6}>
            {activeStep === 0 && (
              <ServiceAvailabilityCalendar 
                service={service}
                onDateSelect={handleDateSelect}
                onTimeSelect={handleTimeSelect}
                onDurationSelect={handleDurationSelect}
                onCommentChange={handleCommentChange}
                onAddressChange={handleAddressChange}
              />
            )}
            
            {activeStep === 1 && (
              <Box>
                <Elements stripe={stripePromise}>
                  <ServiceRequestPayment 
                    service={service} 
                    offer={offer}
                    onPaymentComplete={handlePaymentComplete}
                    onCancel={handleCancel}
                    bookingDetails={bookingDetails}
                  />
                </Elements>
              </Box>
            )}
            
            {activeStep === 2 && (
              <VStack spacing={4} align="stretch" p={4}>
                <Text fontSize="lg" fontWeight="bold" color="green.500">
                  Booking Confirmed!
                </Text>
                <Text>
                  Your service request has been submitted and the provider has been notified. 
                  They will review your request within 24 hours.
                </Text>
                <Box borderWidth="1px" p={4} borderRadius="md" bg="blue.50">
                  <Text fontWeight="bold" mb={2}>Booking Details</Text>
                  <Text>Date: {bookingDetails?.formattedDate}</Text>
                  <Text>Time: {bookingDetails?.time}</Text>
                  <Text>Duration: {bookingDetails?.duration} hour{bookingDetails?.duration !== 1 ? 's' : ''}</Text>
                  <Text>Address: {bookingDetails?.address}</Text>
                  {bookingDetails?.comments && (
                    <Text mt={2}>
                      <Text as="span" fontWeight="bold">Comments: </Text>
                      {bookingDetails.comments}
                    </Text>
                  )}
                </Box>
                <Text>
                  Your payment will only be processed if the provider accepts your request.
                </Text>
              </VStack>
            )}
          </ModalBody>
          
          <ModalFooter>
            {activeStep === 0 && (
              <>
                <Button onClick={handleCancel} mr={3}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={handleProceedToPayment}
                  isDisabled={!selectedDate || !selectedTime}
                >
                  Proceed to Payment
                </Button>
              </>
            )}
            
            {activeStep === 1 && (
              <Button onClick={handleBack} mr={3}>
                Back
              </Button>
            )}
            
            {activeStep === 2 && (
              <>
                <Button colorScheme="blue" mr={3} onClick={handleCancel}>
                  Close
                </Button>
                <Button variant="outline" onClick={() => router.push('/client/transactions')}>
                  View Transactions
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ServiceRequestButton; 