import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import Modal from '../components/Modal';
import { ArrowUp, ArrowDown, Minus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Run } from '../types';

type SortKey = 'date' | 'distance_m' | 'avg_speed_kmh';
type SortDirection = 'asc' | 'desc';

const RunsHistorySkeleton: React.FC = () => (
    <div className="space-y-6">
        <Skeleton className="h-9 w-1/3" />
        <Card>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 w-1/5"><Skeleton className="h-5" /></th>
                            <th className="px-6 py-3 w-1/5"><Skeleton className="h-5" /></th>
                            <th className="px-6 py-3 w-1/5"><Skeleton className="h-5" /></th>
                            <th className="px-6 py-3 w-1/5"><Skeleton className="h-5" /></th>
                             <th className="px-6 py-3 w-1/5"><Skeleton className="h-5" /></th>
                            <th className="px-6 py-3 w-1/5"><Skeleton className="h-5" /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(8)].map((_, i) => (
                            <tr key={i} className="border-t border-gray-700">
                                <td className="px-6 py-4"><Skeleton className="h-5" /></td>
                                <td className="px-6 py-4"><Skeleton className="h-5" /></td>
                                <td className="px-6 py-4"><Skeleton className="h-5" /></td>
                                <td className="px-6 py-4"><Skeleton className="h-5" /></td>
                                <td className="px-6 py-4"><Skeleton className="h-5" /></td>
                                <td className="px-6 py-4"><Skeleton className="h-5" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
);


const RunsHistory: React.FC = () => {
    const { runs, deleteRun, loading } = useAppContext();
    const navigate = useNavigate();
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [runToDelete, setRunToDelete] = useState<Run | null>(null);

    const sortedRuns = useMemo(() => {
        const sorted = [...runs].sort((a, b) => {
            if (a[sortKey] < b[sortKey]) return -1;
            if (a[sortKey] > b[sortKey]) return 1;
            return 0;
        });
        return sortDirection === 'desc' ? sorted.reverse() : sorted;
    }, [runs, sortKey, sortDirection]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
    };

    const handleDeleteConfirm = () => {
        if (runToDelete) {
            deleteRun(runToDelete.id);
            setRunToDelete(null);
        }
    };

    const SortableHeader: React.FC<{ sortKeyId: SortKey; children: React.ReactNode }> = ({ sortKeyId, children }) => (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort(sortKeyId)}>
            <div className="flex items-center">
                {children}
                {sortKey === sortKeyId && (
                    <span className="ml-2">{sortDirection === 'desc' ? '▼' : '▲'}</span>
                )}
            </div>
        </th>
    );

    const TrendIndicator: React.FC<{ current: number, previous: number }> = ({ current, previous }) => {
        if (current > previous) {
            return <ArrowUp className="w-4 h-4 text-green-400" />;
        }
        if (current < previous) {
            return <ArrowDown className="w-4 h-4 text-red-400" />;
        }
        return <Minus className="w-4 h-4 text-gray-400" />;
    };
    
    if (loading) {
        return <RunsHistorySkeleton />;
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Run History</h1>
            
            {/* Desktop Table View */}
            <div className="hidden md:block">
                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-800">
                                <tr>
                                    <SortableHeader sortKeyId="date">Date</SortableHeader>
                                    <SortableHeader sortKeyId="distance_m">Distance</SortableHeader>
                                    <SortableHeader sortKeyId="avg_speed_kmh">Avg Speed</SortableHeader>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Notes</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-dark-card divide-y divide-gray-700">
                                {sortedRuns.map((run, index) => {
                                    const prevRun = sortedRuns[index + 1];
                                    return (
                                        <tr key={run.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{new Date(run.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                <div className="flex items-center">
                                                    {(run.distance_m / 1000).toFixed(2)} km
                                                    {prevRun && <span className="ml-2"><TrendIndicator current={run.distance_m} previous={prevRun.distance_m} /></span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                <div className="flex items-center">
                                                    {run.avg_speed_kmh.toFixed(2)} km/h
                                                    {prevRun && <span className="ml-2"><TrendIndicator current={run.avg_speed_kmh} previous={prevRun.avg_speed_kmh} /></span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{Math.floor(run.total_time_sec / 60)}m {run.total_time_sec % 60}s</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 max-w-xs truncate" title={run.notes}>{run.notes}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-4">
                                                    <button onClick={() => navigate(`/edit-run/${run.id}`)} className="text-blue-400 hover:text-blue-300 transition-colors">
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => setRunToDelete(run)} className="text-red-400 hover:text-red-300 transition-colors">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {runs.length === 0 && <p className="text-center p-8 text-gray-400">No runs found. Go for a run!</p>}
                </Card>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {sortedRuns.map((run, index) => {
                    const prevRun = sortedRuns[index + 1];
                    return (
                        <Card key={run.id}>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="text-white font-medium">{new Date(run.date).toLocaleDateString()}</div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => navigate(`/edit-run/${run.id}`)} className="text-blue-400 hover:text-blue-300 transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setRunToDelete(run)} className="text-red-400 hover:text-red-300 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <div className="text-gray-400">Distance</div>
                                        <div className="flex items-center text-white">
                                            {(run.distance_m / 1000).toFixed(2)} km
                                            {prevRun && <span className="ml-1"><TrendIndicator current={run.distance_m} previous={prevRun.distance_m} /></span>}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400">Avg Speed</div>
                                        <div className="flex items-center text-white">
                                            {run.avg_speed_kmh.toFixed(2)} km/h
                                            {prevRun && <span className="ml-1"><TrendIndicator current={run.avg_speed_kmh} previous={prevRun.avg_speed_kmh} /></span>}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400">Time</div>
                                        <div className="text-white">{Math.floor(run.total_time_sec / 60)}m {run.total_time_sec % 60}s</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400">Notes</div>
                                        <div className="text-gray-300 truncate" title={run.notes}>{run.notes || 'No notes'}</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
                {runs.length === 0 && (
                    <Card>
                        <p className="text-center p-8 text-gray-400">No runs found. Go for a run!</p>
                    </Card>
                )}
            </div>
            {runToDelete && (
                <Modal
                    isOpen={!!runToDelete}
                    onClose={() => setRunToDelete(null)}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Run"
                >
                    Are you sure you want to delete this run from {new Date(runToDelete.date).toLocaleDateString()}? This action cannot be undone.
                </Modal>
            )}
        </div>
    );
};

export default RunsHistory;