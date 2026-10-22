// src/data/complaintsData.js
import { FileText, Clock, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

export const complaintStats = [
  {
    id: 'total',
    label: 'Total',
    count: 7,
    icon: FileText,
    bgColor: 'bg-blue-600',
    iconBgColor: 'bg-blue-700',
  },
  {
    id: 'open',
    label: 'Open',
    count: 3,
    icon: Clock,
    bgColor: 'bg-blue-500',
    iconBgColor: 'bg-blue-600',
  },
  {
    id: 'in_progress',
    label: 'In Progress',
    count: 0,
    icon: ArrowRight,
    bgColor: 'bg-orange-500',
    iconBgColor: 'bg-orange-600',
  },
  {
    id: 'resolved',
    label: 'Resolved',
    count: 3,
    icon: CheckCircle,
    bgColor: 'bg-green-600',
    iconBgColor: 'bg-green-700',
  },
  {
    id: 'closed',
    label: 'Closed',
    count: 1,
    icon: XCircle,
    bgColor: 'bg-gray-600',
    iconBgColor: 'bg-gray-700',
  },
];

// src/data/adminComplaintsData.js

export const complaints = [
  // ... (Complaints 1-4 remain as provided, adding email and lastUpdated)
  // Complaint 5 data is tailored to match the UI image content
  {
    id: 5,
    title: 'fdvhnm', // Title from the image
    status: 'closed',
    statusLabel: 'CLOSED',
    category: 'Harassment', // Category from the image
    employee: 'Nandini sharma', // Submitted By from the image
    email: 'nandini09@gmail.com', // Email from the image
    description: 'cftgvbhnbjmm', // Description from the image
    date: '11/20/2025', // Submitted date
    lastUpdated: '11/20/2025, 8:01:46 PM', // Last Updated time from the image
  },
  // ... other complaints
  {
    id: 1,
    title: 'No',
    status: 'open',
    statusLabel: 'OPEN',
    category: 'Harassment',
    employee: 'Mohit kumar',
    email: 'mohit.k@example.com',
    description: 'being a black guy felt leftout and people push me down',
    date: '11/20/2025',
    lastUpdated: '11/20/2025, 9:00:00 AM',
  },
  {
    id: 2,
    title: 'Test Safety Violation with Evidence',
    status: 'open',
    statusLabel: 'OPEN',
    category: 'Safety Violation',
    employee: 'Yash vardhan',
    email: 'yash.v@example.com',
    description: 'Safety violation with photographic evidence attached.',
    date: '11/20/2025',
    lastUpdated: '11/20/2025, 9:30:00 AM',
  },
  {
    id: 3,
    title: 'Test Safety Violation with Evidence',
    status: 'open',
    statusLabel: 'OPEN',
    category: 'Safety Violation',
    employee: 'Hemant singh kanwal',
    email: 'hemant.s@example.com',
    description: 'Safety violation with photographic evidence attached.',
    date: '11/20/2025',
    lastUpdated: '11/20/2025, 10:00:00 AM',
  },
  {
    id: 4,
    title: 'Resolved Complaint Example',
    status: 'resolved',
    statusLabel: 'RESOLVED',
    category: 'Misconduct',
    employee:'Akash sharma',
    email: 'akash.s@example.com',
    description: 'Issue has been resolved successfully.',
    date: '11/18/2025',
    lastUpdated: '11/19/2025, 11:00:00 AM',
  },
];
