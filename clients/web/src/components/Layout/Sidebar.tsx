import React from 'react';
import {
  Box,
  VStack,
  Text,
  useColorModeValue,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiList, FiMap, FiUsers, FiSettings } from 'react-icons/fi';

interface NavItemProps {
  icon: any;
  children: string;
  path: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, children, path }) => {
  const location = useLocation();
  const isActive = location.pathname === path;
  const activeBg = useColorModeValue('blue.100', 'blue.800');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Link to={path}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
      >
        <Icon mr="4" fontSize="16" as={icon} />
        <Text>{children}</Text>
      </Flex>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  return (
    <Box
      as="aside"
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      w="280px"
      bg={useColorModeValue('white', 'gray.800')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      py={6}
      px={4}
    >
      <VStack spacing={1}>
        <Text fontSize="2xl" fontWeight="bold" mb={8}>CIVIX</Text>
        <NavItem icon={FiHome} path="/dashboard">Dashboard</NavItem>
        <NavItem icon={FiList} path="/tickets">Tickets</NavItem>
        <NavItem icon={FiMap} path="/map">Map View</NavItem>
        <NavItem icon={FiUsers} path="/technicians">Technicians</NavItem>
        <NavItem icon={FiSettings} path="/settings">Settings</NavItem>
      </VStack>
    </Box>
  );
};

export default Sidebar;
