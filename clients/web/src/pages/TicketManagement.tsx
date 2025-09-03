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
  Input,
  Select,
  useColorModeValue,
  Button,
} from '@chakra-ui/react';
import { FiEye, FiEdit, FiUserPlus } from 'react-icons/fi';

interface Ticket {
  id: string;
  category: string;
  location: string;
  assignedTo: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'resolved';
}

const TicketManagement: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');

  // Mock data - replace with actual API call
  const tickets: Ticket[] = [
    {
      id: 'TKT-001',
      category: 'Water Supply',
      location: '123 Main St',
      assignedTo: 'John Doe',
      priority: 'high',
      status: 'pending',
    },
    // Add more mock tickets...
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'in_progress': return 'blue';
      case 'resolved': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Box p={4}>
      <HStack mb={6} spacing={4}>
        <Input placeholder="Search tickets..." />
        <Select placeholder="Status">
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </Select>
        <Select placeholder="Priority">
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
        <Button colorScheme="blue">Search</Button>
      </HStack>

      <Box bg={bgColor} borderRadius="lg" shadow="sm" overflow="hidden">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Ticket ID</Th>
              <Th>Category</Th>
              <Th>Location</Th>
              <Th>Assigned To</Th>
              <Th>Priority</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tickets.map((ticket) => (
              <Tr key={ticket.id}>
                <Td>{ticket.id}</Td>
                <Td>{ticket.category}</Td>
                <Td>{ticket.location}</Td>
                <Td>{ticket.assignedTo}</Td>
                <Td>
                  <Badge colorScheme={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme={getStatusColor(ticket.status)}>
                    {ticket.status}
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
                      aria-label="Edit ticket"
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

export default TicketManagement;
