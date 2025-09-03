import React, { createContext, useContext, useState, useCallback } from 'react';
import { Worker } from '../types/schemas';

interface WorkerContextType {
  workers: Worker[];
  addWorker: (worker: Worker) => void;
  updateWorker: (id: string, updates: Partial<Worker>) => void;
  assignIssue: (workerId: string, issueId: string) => void;
}

const WorkerContext = createContext<WorkerContextType | null>(null);

export const WorkerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workers, setWorkers] = useState<Worker[]>([]);

  const addWorker = useCallback((worker: Worker) => {
    setWorkers(prev => [...prev, worker]);
  }, []);

  const updateWorker = useCallback((id: string, updates: Partial<Worker>) => {
    setWorkers(prev => prev.map(worker => 
      worker._id === id ? { ...worker, ...updates } : worker
    ));
  }, []);

  const assignIssue = useCallback((workerId: string, issueId: string) => {
    setWorkers(prev => prev.map(worker => 
      worker._id === workerId 
        ? { ...worker, issues_assigned: [...worker.issues_assigned, issueId] }
        : worker
    ));
  }, []);

  return (
    <WorkerContext.Provider value={{ workers, addWorker, updateWorker, assignIssue }}>
      {children}
    </WorkerContext.Provider>
  );
};

export const useWorkers = () => {
  const context = useContext(WorkerContext);
  if (!context) {
    throw new Error('useWorkers must be used within a WorkerProvider');
  }
  return context;
};
