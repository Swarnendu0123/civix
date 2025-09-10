import React, { useState } from 'react';
import TicketsTable from '../components/IssuesTable';
import TicketDetailModal from '../components/IssueDetailModal';
import type { Ticket } from '../types';

const TicketManagement: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <TicketsTable onViewticket={handleViewTicket} />

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default TicketManagement;