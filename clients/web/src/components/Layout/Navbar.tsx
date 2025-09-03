import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  IconButton,
  Badge,
  Avatar,
  useColorModeValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  VStack,
  useDisclosure 
} from '@chakra-ui/react';
import { FiHome, FiList, FiUsers, FiBell, FiUser, FiMap, FiMenu } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const bg = useColorModeValue('white', 'gray.800');
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const NavItems = () => (
    <>
      <Button 
        as={Link} 
        to="/dashboard" 
        variant="ghost" 
        leftIcon={<FiHome />} 
        isActive={location.pathname === '/dashboard'}
      >
        Dashboard
      </Button>
      <Button 
        as={Link} 
        to="/issues" 
        variant="ghost" 
        leftIcon={<FiList />} 
        isActive={location.pathname === '/issues'}
      >
        Issues
      </Button>
      <Button 
        as={Link} 
        to="/map" 
        variant="ghost" 
        leftIcon={<FiMap />} 
        isActive={location.pathname === '/map'}
      >
        Map
      </Button>
      <Button 
        as={Link} 
        to="/technicians" 
        variant="ghost" 
        leftIcon={<FiUser />} 
        isActive={location.pathname === '/technicians'}
      >
        Technicians
      </Button>
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<FiBell />}
          variant="ghost"
          position="relative"
        >
          <Badge
            position="absolute"
            top="-1"
            right="-1"
            colorScheme="red"
            borderRadius="full"
          >
            3
          </Badge>
        </MenuButton>
        <MenuList>
          <MenuItem>New Issue Assigned</MenuItem>
          <MenuItem>Status Update Required</MenuItem>
          <MenuItem>Issue Resolved</MenuItem>
        </MenuList>
      </Menu>
    </>
  );

  return (
    <Box
      px={4}
      bg={bg}
      boxShadow="sm"
      position="fixed"
      w="100%"
      zIndex={1000}
    >
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="1600px" mx="auto">
        <HStack spacing={8}>
          <Link to="/dashboard">
            <Box fontWeight="bold" fontSize="xl">CIVIX</Box>
          </Link>

          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
            <NavItems />
          </HStack>
        </HStack>

        <HStack spacing={4}>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<FiUser />}
              variant="ghost"
            >
              {user?.name}
            </MenuButton>
            <MenuList>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <MenuItem onClick={logout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} onClose={onClose} placement="left">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Navigation</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <NavItems />
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Hamburger Icon for Mobile */}
      <Flex display={{ base: 'flex', md: 'none' }} alignItems="center">
        <IconButton
          aria-label="Open menu"
          icon={<FiMenu />}
          variant="ghost"
          onClick={onOpen}
        />
      </Flex>
    </Box>
  );
};

export default Navbar;
