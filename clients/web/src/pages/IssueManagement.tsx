import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Divider,
  Image,
  SimpleGrid,
  useColorModeValue,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepTitle,
  StepDescription,
  useSteps,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiMapPin, FiThumbsUp, FiClock } from 'react-icons/fi';
import { sampleIssues } from '../data/sampleIssues';
import { Issue } from '../types';


const steps = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];


const IssueCard: React.FC<{ issue: Issue; onOpen: (issue: Issue) => void }> = ({ issue, onOpen }) => {
  return (
    <Box
      p={5}
      bg={useColorModeValue("white", "gray.800")}
      borderRadius="lg"
      shadow="sm"
      cursor="pointer"
      onClick={() => onOpen(issue)}
      _hover={{ shadow: "md", transform: "scale(1.02)", transition: "0.2s" }}
    >
      <VStack align="stretch" spacing={4}>
        {/* Title + Status */}
        <HStack justify="space-between" align="start">
          <Text fontWeight="bold" fontSize="lg" noOfLines={2}>
            {issue.title}
          </Text>
          <Badge
            colorScheme={
              issue.status === "resolved"
                ? "green"
                : issue.status === "in_progress"
                ? "blue"
                : "orange"
            }
            px={2}
            py={1}
            borderRadius="md"
            textTransform="capitalize"
          >
            {issue.status.replace("_", " ")}
          </Badge>
        </HStack>

        {/* Location */}
        <HStack fontSize="sm" color="gray.500">
          <FiMapPin />
          <Text noOfLines={1}>{issue.location.address}</Text>
        </HStack>

        <Divider />

        {/* Category + Bottom Info */}
        <HStack justify="space-between">
          <Badge colorScheme="purple" px={2} py={1} borderRadius="md">
            {issue.category}
          </Badge>

          <HStack spacing={5} color="gray.600">
            <HStack spacing={1}>
              <FiThumbsUp />
              <Text fontSize="sm">{issue.upvotes}</Text>
            </HStack>
            <HStack spacing={1}>
              <FiClock />
              <Text fontSize="sm">
                {new Date(issue.createdAt).toLocaleDateString()}
              </Text>
            </HStack>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
};
const IssueManagement: React.FC = () => {
  const [filter, setFilter] = useState({ status: 'all', type: 'all', priority: 'all' });
  const [sortBy, setSortBy] = useState<keyof Issue>('createdAt');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cardBg = useColorModeValue('white', 'gray.800');

  const filteredAndSortedIssues = useMemo(() => {
    return sampleIssues
      .filter(issue => {
        if (filter.status !== 'all' && issue.status !== filter.status) return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            issue.title.toLowerCase().includes(query) ||
            issue.description.toLowerCase().includes(query) ||
            issue.location.address.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'createdAt':
            return b.createdAt.getTime() - a.createdAt.getTime();
          case 'upvotes':
            return b.upvotes - a.upvotes;
          case 'category':
            return a.category.localeCompare(b.category);
          default:
            return 0;
        }
      });
  }, [filter, sortBy, searchQuery]);

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <HStack mb={6} spacing={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search issues..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          
          <Select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as keyof Issue)}
          >
            <option value="createdAt">Date</option>
            <option value="upvotes">Upvotes</option>
            <option value="category">Category</option>
          </Select>
          
          <Select 
            value={filter.status} 
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="all">All Status</option>
            {steps.map(step => (
              <option key={step} value={step.toLowerCase()}>{step}</option>
            ))}
          </Select>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredAndSortedIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} onOpen={onOpen} />
          ))}
        </SimpleGrid>

        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedIssue?.title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedIssue && (
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Description</Text>
                    <Text>{selectedIssue.description}</Text>
                  </Box>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <Box>
                      <Text fontWeight="bold">Reported By</Text>
                      <Text>{selectedIssue.createdBy.name}</Text>
                      {selectedIssue.createdBy.contact && (
                        <Text fontSize="sm">{selectedIssue.createdBy.contact}</Text>
                      )}
                    </Box>
                    
                    <Box>
                      <Text fontWeight="bold">Location</Text>
                      <Text>{selectedIssue.location.address}</Text>
                    </Box>
                  </Grid>

                  {selectedIssue.attachments && selectedIssue.attachments.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" mb={2}>Attachments</Text>
                      <SimpleGrid columns={3} spacing={2}>
                        {selectedIssue.attachments.map((url, index) => (
                          <Image
                            key={index}
                            src={url}
                            alt={`Attachment ${index + 1}`}
                            borderRadius="md"
                          />
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}

                  <Box>
                    <Text fontWeight="bold" mb={2}>Status History</Text>
                    <VStack align="stretch" spacing={2}>
                      {/* {selectedIssue.updates.map((update, index) => (
                        <Box key={index} p={2} bg="gray.50" borderRadius="md">
                          <Text fontWeight="medium">
                            {update.status} {update.officer && `- ${update.officer}`}
                          </Text>
                          <Text fontSize="sm">{update.note}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {new Date(update.date).toLocaleString()}
                          </Text>
                        </Box>
                      ))} */}
                    </VStack>
                  </Box>
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default IssueManagement;
