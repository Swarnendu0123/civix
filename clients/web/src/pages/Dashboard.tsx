import React from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import StatCard from '../components/Dashboard/StatCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const lineData = {
    labels,
    datasets: [
      {
        label: 'New Tickets',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Resolved Tickets',
        data: [28, 48, 40, 19, 86, 27],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  const barData = {
    labels: ['Water', 'Roads', 'Electricity', 'Sanitation', 'Others'],
    datasets: [
      {
        label: 'Issues by Category',
        data: [12, 19, 3, 5, 2],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  const doughnutData = {
    labels: ['Pending', 'In Progress', 'Resolved'],
    datasets: [
      {
        data: [12, 19, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
      },
    ],
  };

  return (
    <Box p={4}>
      <Heading mb={6}>Dashboard</Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <StatCard title="Total Open Tickets" value="156" helpText="Active issues" />
        <StatCard title="New Tickets (24h)" value="23" helpText="Last 24 hours" />
        <StatCard title="Avg. Resolution Time" value="2.5 days" helpText="This week" />
        <StatCard title="Resolved Today" value="18" helpText="Today" />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Box p={6} bg={bgColor} borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4}>Ticket Trends</Heading>
          <Line data={lineData} />
        </Box>

        <Box p={6} bg={bgColor} borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4}>Issues by Category</Heading>
          <Bar data={barData} />
        </Box>

        <Box p={6} bg={bgColor} borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4}>Tickets by Status</Heading>
          <Doughnut data={doughnutData} />
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;
