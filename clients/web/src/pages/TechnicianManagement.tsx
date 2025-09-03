import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  HStack,
  useColorModeValue,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { FiEye, FiEdit, FiUserPlus } from 'react-icons/fi';
import { sampleTechnicians } from '../data/sampleTechnicians';

const TechnicianManagement: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'on_leave': return 'red';
      case 'on_site': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <Box p={6}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <Stat p={4} bg={bgColor} borderRadius="lg" shadow="sm">
          <StatLabel>Total Technicians</StatLabel>
          <StatNumber>24</StatNumber>
          <StatHelpText>Active staff members</StatHelpText>
        </Stat>
        <Stat p={4} bg={bgColor} borderRadius="lg" shadow="sm">
          <StatLabel>Active on Duty</StatLabel>
          <StatNumber>18</StatNumber>
          <StatHelpText>Currently working</StatHelpText>
        </Stat>
        <Stat p={4} bg={bgColor} borderRadius="lg" shadow="sm">
          <StatLabel>Avg. Open Tickets</StatLabel>
          <StatNumber>4.2</StatNumber>
          <StatHelpText>Per technician</StatHelpText>
        </Stat>
      </SimpleGrid>

      <Box 
        bg={useColorModeValue('white', 'gray.800')} 
        borderRadius="lg" 
        shadow="sm" 
        overflow="hidden"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Contact</Th>
              <Th>Open Tickets</Th>
              <Th>Avg. Resolution Time</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sampleTechnicians.map(tech => (
              <Tr key={tech.id}>
                <Td>{tech.id}</Td>
                <Td>{tech.name}</Td>
                <Td>{tech.contact}</Td>
                <Td>{tech.openTickets}</Td>
                <Td>{tech.avgResolutionTime}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(tech.status)}>
                    {tech.status.replace('_', ' ')}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="View details"
                      icon={<FiEye />}
                      size="sm"
                      variant="ghost"
                    />
                    <IconButton
                      aria-label="Edit technician"
                      icon={<FiEdit />}
                      size="sm"
                      variant="ghost"
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default TechnicianManagement;
