import React from 'react';
import { Box,Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <Flex minH="100vh">
      <Navbar />
      <Box 
        as="main"
        pt="80px"
        px={6}
        maxW="1600px"
        mx="auto"
      >
        <Outlet />
      </Box>
    </Flex>
  );
};

export default Layout;
