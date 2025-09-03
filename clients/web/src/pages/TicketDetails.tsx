import React from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

const TicketDetails: React.FC = () => {
  const { id } = useParams();
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Box p={4}>
      <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm">
        <Heading size="lg" mb={6}>Ticket #{id}</Heading>
        
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
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
              <Text fontWeight="bold">Category</Text>
              <Text>Water Supply</Text>
            </Box>
          </VStack>
          
          <VStack align="start" spacing={4}>
            <Box>
              <Text fontWeight="bold">Location</Text>
              <Text>123 Main St, City</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Reported On</Text>
              <Text>July 20, 2023</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Assigned To</Text>
              <Text>John Doe</Text>
            </Box>
          </VStack>
        </Grid>
      </Box>
    </Box>
  );
};

export default TicketDetails;
