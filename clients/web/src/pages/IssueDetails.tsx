import React from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Image,
  useColorModeValue,
  Divider,
  Step,
  // Steps,
  // useSteps,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

const IssueDetails: React.FC = () => {
  const { id } = useParams();
  const bgColor = useColorModeValue('white', 'gray.800');
  const steps = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
//   const { nextStep, prevStep, currentStep } = useSteps({
//     initialStep: 0,
//   });

  return (
    <Box>
      <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm">
        <Heading size="lg" mb={6}>Issue #{id}</Heading>
        
        {/* Timeline implementation */}
        <HStack spacing={4} mb={6}>
          {steps.map((step, index) => (
            <VStack key={index} spacing={1}>
              <Badge colorScheme={index === 2 ? "green" : "gray"}>{step}</Badge>
              {index < steps.length - 1 && (
                <Box w="2px" h="24px" bg="gray.300" />
              )}
            </VStack>
          ))}
        </HStack>
        
        <Grid templateColumns="repeat(2, 1fr)" gap={6} mt={6}>
          <VStack align="start" spacing={4}>
            <Box>
              <Text fontWeight="bold">Status</Text>
              <Badge colorScheme="orange">Pending</Badge>
            </Box>
            <Box>
              <Text fontWeight="bold">Priority</Text>
              <Badge colorScheme="red">High</Badge>
            </Box>
            <Box>
              <Text fontWeight="bold">Upvotes</Text>
              <Text>42</Text>
            </Box>
          </VStack>
          
          <VStack align="start" spacing={4}>
            <Box>
              <Text fontWeight="bold">Location</Text>
              <Text>123 Main St, City</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Created On</Text>
              <Text>July 20, 2023</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Category</Text>
              <Text>Water Supply</Text>
            </Box>
          </VStack>
        </Grid>

        <Divider my={6} />

        <Box>
          <Text fontWeight="bold" mb={2}>Description</Text>
          <Text>Detailed description of the issue goes here...</Text>
        </Box>

        <Box mt={6}>
          <Text fontWeight="bold" mb={2}>Evidence</Text>
          <HStack spacing={4}>
            {/* Image gallery will be added here */}
          </HStack>
        </Box>
      </Box>

      {/* Status history timeline */}
      <VStack align="stretch" spacing={4} mt={6}>
        {/* Timeline implementation */}
      </VStack>
    </Box>
  );
};

export default IssueDetails;
