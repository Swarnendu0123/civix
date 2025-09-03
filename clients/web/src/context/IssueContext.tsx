import React, { createContext, useContext, useState, useCallback } from 'react';
import { Ticket } from '../types/schemas';

interface IssueContextType {
  issues: Ticket[];
  addIssue: (issue: Ticket) => void;
  updateIssue: (id: string, updates: Partial<Ticket>) => void;
  getIssue: (id: string) => Ticket | undefined;
}

const IssueContext = createContext<IssueContextType | null>(null);

export const IssueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Ticket[]>([]);

  const addIssue = useCallback((issue: Ticket) => {
    setIssues(prev => [...prev, issue]);
  }, []);

  const updateIssue = useCallback((id: string, updates: Partial<Ticket>) => {
    setIssues(prev => prev.map(issue => 
      issue._id === id ? { ...issue, ...updates } : issue
    ));
  }, []);

  const getIssue = useCallback((id: string) => {
    return issues.find(issue => issue._id === id);
  }, [issues]);

  return (
    <IssueContext.Provider value={{ issues, addIssue, updateIssue, getIssue }}>
      {children}
    </IssueContext.Provider>
  );
};

export const useIssues = () => {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
};
