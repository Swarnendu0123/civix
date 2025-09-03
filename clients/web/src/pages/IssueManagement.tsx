import React, { useState } from 'react';
import IssuesTable from '../components/IssuesTable';
import IssueDetailModal from '../components/IssueDetailModal';
import type { Ticket } from '../types';

const IssueManagement: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewIssue = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <IssuesTable onViewIssue={handleViewIssue} />
      
      {selectedTicket && (
        <IssueDetailModal
          ticket={selectedTicket}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default IssueManagement;