import React, { useState } from 'react';
import ticketsTable from '../components/ticketsTable';
import ticketDetailModal from '../components/ticketDetailModal';
import type { Ticket } from '../types';

const ticketManagement: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewticket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <ticketsTable onViewticket={handleViewticket} />
      
      {selectedTicket && (
        <ticketDetailModal
          ticket={selectedTicket}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ticketManagement;