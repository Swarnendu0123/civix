import React, { useState, useMemo, useEffect } from 'react';
import type { Ticket } from '../types';
import { ticketsAPI as apiTickets } from '../services/api';

interface TicketsTableProps { onViewticket: (ticket: Ticket) => void; }

const TicketsTable: React.FC<TicketsTableProps> = ({ onViewticket }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'opening_time' | 'votes' | 'urgency'>('opening_time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await apiTickets.getTickets();
        if (mounted) {
          const list: Ticket[] = response?.tickets || [];
          list.forEach(t => {
            // @ts-ignore
            if (t.opening_time && typeof t.opening_time === 'string') t.opening_time = new Date(t.opening_time) as any;
          });
          setTickets(list);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load tickets');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchTickets();
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach(t => t.ticket_category && set.add(t.ticket_category));
    return Array.from(set);
  }, [tickets]);

  const filteredAndSortedTickets = useMemo(() => {
    const urgencyRank: Record<string, number> = { critical: 3, moderate: 2, low: 1 };
    return tickets
      .filter(t => (
        (statusFilter === 'all' || t.status === statusFilter) &&
        (categoryFilter === 'all' || t.ticket_category === categoryFilter) &&
        (urgencyFilter === 'all' || t.urgency === urgencyFilter) &&
        (!searchQuery || [
          t.ticket_name,
          t.ticket_description,
          t.creator_name,
          `${t.location?.latitude ?? ''}`,
          `${t.location?.longitude ?? ''}`
        ].some(field => field?.toString().toLowerCase().includes(searchQuery.toLowerCase())))
      ))
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'opening_time') {
          cmp = new Date(a.opening_time).getTime() - new Date(b.opening_time).getTime();
        } else if (sortBy === 'votes') {
          const aScore = (a.votes?.upvotes || 0) - (a.votes?.downvotes || 0);
          const bScore = (b.votes?.upvotes || 0) - (b.votes?.downvotes || 0);
          cmp = aScore - bScore;
        } else if (sortBy === 'urgency') {
          cmp = (urgencyRank[a.urgency] || 0) - (urgencyRank[b.urgency] || 0);
        }
        return sortOrder === 'desc' ? -cmp : cmp;
      });
  }, [tickets, searchQuery, statusFilter, categoryFilter, urgencyFilter, sortBy, sortOrder]);

  const getStatusColor = (status: string) => ({
    resolved: 'bg-green-100 text-green-800',
    'in process': 'bg-blue-100 text-blue-800',
    open: 'bg-yellow-100 text-yellow-800'
  } as Record<string,string>)[status] || 'bg-gray-100 text-gray-800';

  const getUrgencyColor = (urgency: string) => ({
    critical: 'bg-red-100 text-red-800',
    moderate: 'bg-orange-100 text-orange-800',
    low: 'bg-green-100 text-green-800'
  } as Record<string,string>)[urgency] || 'bg-gray-100 text-gray-800';

  const handleSort = (col: 'opening_time' | 'votes' | 'urgency') => {
    if (sortBy === col) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortOrder('desc'); }
  };

  if (loading) return (
    <div className="flex justify-center py-10">
      <div className="text-sm text-gray-500 animate-pulse">Loading tickets...</div>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 rounded-md text-sm text-red-600">
      Failed to load tickets: {error}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select className="border rounded px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in process">In Process</option>
            <option value="resolved">Resolved</option>
          </select>
          <select className="border rounded px-3 py-2 text-sm" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="border rounded px-3 py-2 text-sm" value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)}>
            <option value="all">All Urgencies</option>
            <option value="critical">Critical</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
          <div className="flex gap-2 items-center">
            <label className="text-xs font-medium text-gray-500">Sort:</label>
            <select className="border rounded px-2 py-1 text-sm" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
              <option value="opening_time">Opened</option>
              <option value="votes">Votes</option>
              <option value="urgency">Urgency</option>
            </select>
            <button
              className="text-xs px-2 py-1 border rounded"
              onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            >{sortOrder === 'asc' ? 'Asc' : 'Desc'}</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Category</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600 cursor-pointer" onClick={() => handleSort('urgency')}>Urgency</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600 cursor-pointer" onClick={() => handleSort('votes')}>Votes</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600 cursor-pointer" onClick={() => handleSort('opening_time')}>Opened</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Location</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAndSortedTickets.map(t => {
                const voteScore = (t.votes?.upvotes || 0) - (t.votes?.downvotes || 0);
                return (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900 max-w-[220px] truncate">{t.ticket_name}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(t.status)}`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-700">{t.ticket_category}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getUrgencyColor(t.urgency)}`}>{t.urgency}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-700">{voteScore}</td>
                    <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{new Date(t.opening_time).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">{t.location ? `${t.location.latitude.toFixed(2)}, ${t.location.longitude.toFixed(2)}` : '-'}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => onViewticket(t)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                      >View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredAndSortedTickets.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">No tickets match your filters.</div>
        )}
      </div>
    </div>
  );
};

export default TicketsTable;