import React from 'react';
import { Box, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';

interface StatCardProps {
  title: string;
  value: string | number;
  helpText?: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, helpText, icon }) => {
  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
      <Stat>
        <StatLabel fontSize="md">{title}</StatLabel>
        <StatNumber fontSize="2xl">{value}</StatNumber>
        {helpText && <StatHelpText>{helpText}</StatHelpText>}
      </Stat>
    </Box>
  );
};

export default StatCard;
