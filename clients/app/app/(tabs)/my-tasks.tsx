import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

export default function MyTasksScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'assigned' | 'in_progress' | 'completed'>('all');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is a technician - get from backend/auth context
  const isTechnician = user?.role === 'technician';

  useEffect(() => {
    const fetchAssignedTasks = async () => {
      if (!user || !isTechnician) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Fetch tasks from backend API
        const tasks = await api.technicians.getTechnicianTasks(user._id);
        const mobileTasks = tasks.map((task: any) => api.transformers.taskToMobileFormat(task));
        setAssignedTasks(mobileTasks);
        
        console.log('Fetched tasks from backend:', mobileTasks.length);
      } catch (error) {
        console.log('Failed to fetch assigned tasks from backend, using demo data');
        // Fallback to demo data if backend is unavailable
        const userAssignedTasks = getSampleAssignedTasks(user.email);
        setAssignedTasks(userAssignedTasks);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTasks();
    
    // Set up periodic refresh to check for new assignments
    const refreshInterval = setInterval(() => {
      if (user && isTechnician) {
        fetchAssignedTasks();
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [user, isTechnician]);

  // Sample assigned tasks based on user email
  const getSampleAssignedTasks = (userEmail: string) => {
    // In a real app, tasks would be filtered by assigned technician email on backend
    const allTasks = [
      {
        id: 'TASK-001',
        ticketId: 'TICK-001',
        title: 'Fix pothole near MMM College',
        description: 'Large pothole causing traffic issues and vehicle damage',
        category: 'Roads',
        status: 'assigned',
        priority: 'high',
        location: 'Main Street, Sector 12',
        assignedAt: '2024-01-15T10:30:00Z',
        dueDate: '2024-01-17T17:00:00Z',
        reportedBy: 'John Doe',
        estimatedTime: '4 hours',
        requiredMaterials: ['Asphalt', 'Tools', 'Safety cones'],
        assignedTo: userEmail
      },
      {
        id: 'TASK-002',
        ticketId: 'TICK-003',
        title: 'Repair street lights on Park Avenue',
        description: 'Multiple street lights not functioning properly',
        category: 'Electricity',
        status: 'in_progress',
        priority: 'medium',
        location: 'Park Avenue, Block A',
        assignedAt: '2024-01-14T14:20:00Z',
        dueDate: '2024-01-16T16:00:00Z',
        reportedBy: 'Sarah Smith',
        estimatedTime: '6 hours',
        requiredMaterials: ['LED bulbs', 'Electrical tools', 'Ladder'],
        startedAt: '2024-01-15T09:00:00Z',
        progress: 60,
        assignedTo: userEmail
      },
      {
        id: 'TASK-003',
        ticketId: 'TICK-005',
        title: 'Water pipe leak repair',
        description: 'Underground water pipe leak causing road damage',
        category: 'Water Supply',
        status: 'completed',
        priority: 'high',
        location: 'Green Lane, Colony 3',
        assignedAt: '2024-01-10T08:15:00Z',
        dueDate: '2024-01-12T12:00:00Z',
        reportedBy: 'Mike Johnson',
        estimatedTime: '8 hours',
        requiredMaterials: ['Pipes', 'Fittings', 'Excavation tools'],
        startedAt: '2024-01-10T10:00:00Z',
        completedAt: '2024-01-11T16:30:00Z',
        proofOfWork: 'photo_evidence.jpg',
        assignedTo: userEmail
      }
    ];

    // Return only tasks assigned to this user
    return allTasks.filter(task => task.assignedTo === userEmail);
  };

  const filteredTasks = assignedTasks.filter(task => 
    selectedFilter === 'all' || task.status === selectedFilter
  );

  const handleTaskPress = (task: any) => {
    setSelectedTask(task);
    setIsModalVisible(true);
  };

  const handleUpdateStatus = (taskId: string, newStatus: string) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to mark this task as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            Alert.alert('Success', `Task status updated to ${newStatus}`);
            setIsModalVisible(false);
          }
        }
      ]
    );
  };

  const handleUploadProof = () => {
    Alert.alert(
      'Upload Proof of Work',
      'Select how you want to upload proof',
      [
        { text: 'Camera', onPress: () => Alert.alert('Camera', 'Would open camera') },
        { text: 'Gallery', onPress: () => Alert.alert('Gallery', 'Would open gallery') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'assigned': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#84CC16';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const styles = createStyles(colorScheme);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Tasks</Text>
          <Text style={styles.subtitle}>Manage your assigned work</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          <Text style={styles.loadingText}>Loading your tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isTechnician) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notTechnicianContainer}>
          <IconSymbol name="exclamationmark.triangle" size={64} color="#F59E0B" />
          <Text style={styles.notTechnicianTitle}>Access Restricted</Text>
          <Text style={styles.notTechnicianText}>
            This section is only available for technicians. Contact your administrator if you believe this is an error.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <Text style={styles.subtitle}>Manage your assigned work</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['all', 'assigned', 'in_progress', 'completed'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.filterTextActive
            ]}>
              {filter === 'in_progress' ? 'In Progress' : 
               filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tasks Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          {selectedFilter !== 'all' && ` (${selectedFilter.replace('_', ' ')})`}
        </Text>
      </View>

      {/* Tasks List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="briefcase" size={64} color="#6B7280" />
            <Text style={styles.emptyTitle}>No tasks found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'all' 
                ? "No tasks assigned to you yet"
                : `No ${selectedFilter.replace('_', ' ')} tasks`}
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => handleTaskPress(task)}
            >
              {/* Task Header */}
              <View style={styles.taskHeader}>
                <View style={styles.taskHeaderLeft}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskId}>#{task.ticketId}</Text>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(task.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                    {task.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>

              {/* Task Description */}
              <Text style={styles.taskDescription} numberOfLines={2}>
                {task.description}
              </Text>

              {/* Task Meta */}
              <View style={styles.taskMeta}>
                <View style={styles.metaRow}>
                  <IconSymbol name="location" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{task.location}</Text>
                </View>
                <View style={styles.metaRow}>
                  <IconSymbol name="clock" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>Due: {formatDate(task.dueDate)}</Text>
                </View>
              </View>

              {/* Progress Bar (for in-progress tasks) */}
              {task.status === 'in_progress' && task.progress && (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>Progress: {task.progress}%</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${task.progress}%` }]} />
                  </View>
                </View>
              )}

              {/* Task Footer */}
              <View style={styles.taskFooter}>
                <View style={styles.footerLeft}>
                  <View style={styles.priorityBadge}>
                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                    <Text style={styles.priorityText}>{task.priority} priority</Text>
                  </View>
                </View>
                <View style={styles.footerRight}>
                  <Text style={styles.estimatedTime}>{task.estimatedTime}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Task Detail Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        {selectedTask && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTask.title}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <IconSymbol name="xmark" size={24} color={Colors[colorScheme].text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Task Details */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailText}>{selectedTask.description}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailText}>{selectedTask.location}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Reported By</Text>
                <Text style={styles.detailText}>{selectedTask.reportedBy}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Required Materials</Text>
                {selectedTask.requiredMaterials.map((material: string, index: number) => (
                  <Text key={index} style={styles.materialItem}>• {material}</Text>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {selectedTask.status === 'assigned' && (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => handleUpdateStatus(selectedTask.id, 'in_progress')}
                  >
                    <IconSymbol name="play.fill" size={20} color="white" />
                    <Text style={styles.startButtonText}>Start Work</Text>
                  </TouchableOpacity>
                )}

                {selectedTask.status === 'in_progress' && (
                  <>
                    <TouchableOpacity
                      style={styles.proofButton}
                      onPress={handleUploadProof}
                    >
                      <IconSymbol name="camera.fill" size={20} color="#3B82F6" />
                      <Text style={styles.proofButtonText}>Upload Proof</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={() => handleUpdateStatus(selectedTask.id, 'completed')}
                    >
                      <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
                      <Text style={styles.completeButtonText}>Mark Complete</Text>
                    </TouchableOpacity>
                  </>
                )}

                {selectedTask.status === 'completed' && selectedTask.proofOfWork && (
                  <View style={styles.completedInfo}>
                    <IconSymbol name="checkmark.circle.fill" size={24} color="#10B981" />
                    <Text style={styles.completedText}>
                      Completed on {formatDate(selectedTask.completedAt)}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colorScheme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[colorScheme].background,
  },
  notTechnicianContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notTechnicianTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors[colorScheme].text,
    marginTop: 20,
    marginBottom: 12,
  },
  notTechnicianText: {
    fontSize: 16,
    color: Colors[colorScheme].tabIconDefault,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors[colorScheme].background,
    borderBottomWidth: 1,
    borderBottomColor: Colors[colorScheme].tabIconDefault + '20',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors[colorScheme].text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors[colorScheme].tabIconDefault,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
  },
  filterButtonActive: {
    backgroundColor: Colors[colorScheme].tint,
    borderColor: Colors[colorScheme].tint,
  },
  filterText: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  countText: {
    fontSize: 16,
    color: Colors[colorScheme].tabIconDefault,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors[colorScheme].text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors[colorScheme].tabIconDefault,
    textAlign: 'center',
    marginTop: 8,
  },
  taskCard: {
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors[colorScheme].text,
    marginBottom: 4,
  },
  taskId: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
    fontFamily: 'monospace',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  taskDescription: {
    fontSize: 16,
    color: Colors[colorScheme].text,
    lineHeight: 22,
    marginBottom: 12,
  },
  taskMeta: {
    gap: 6,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: Colors[colorScheme].text,
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors[colorScheme].tabIconDefault + '30',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flex: 1,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 12,
    color: Colors[colorScheme].tabIconDefault,
    textTransform: 'capitalize',
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  estimatedTime: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors[colorScheme].background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors[colorScheme].tabIconDefault + '20',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors[colorScheme].text,
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  detailSection: {
    marginTop: 20,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors[colorScheme].text,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: Colors[colorScheme].text,
    lineHeight: 22,
  },
  materialItem: {
    fontSize: 16,
    color: Colors[colorScheme].text,
    marginLeft: 8,
    marginBottom: 4,
  },
  actionButtons: {
    marginTop: 32,
    marginBottom: 32,
    gap: 12,
  },
  startButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  proofButton: {
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 2,
    borderColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  proofButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#10B981' + '20',
    borderRadius: 12,
  },
  completedText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors[colorScheme].text,
  },
});