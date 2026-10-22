// src/data/userComplaintsData.js

export const userComplaints = [
  {
    id: 1,
    category: "Harassment", // Added to match the UI's 'Category' display
    title: "Harassment by Senior",
    description: "Facing inappropriate behavior at workplace.",
    submittedDate: "20/11/2025", // Renamed 'date' to 'submittedDate' for clarity and UI format
    status: "OPEN", // Changed to uppercase to match the UI's status text
    submittedBy: "Anmol Aggarwal", // Added for the 'Information' section
    email: "abcd@gmail.com", // Added for the 'Information' section
    lastUpdated: "20/11/2025, 19:52:22", // Added for the 'Information' section
  },
  {
    id: 2,
    category: "System Failure",
    title: "System Failure Issue",
    description: "Computer shuts down automatically during work.",
    submittedDate: "24/11/2025",
    status: "IN PROGRESS", // Adjusted status format
    submittedBy: "Jane Doe",
    email: "jane.doe@example.com",
    lastUpdated: "24/11/2025, 10:00:00",
  },
  {
    id: 3,
    category: "Salary Issue",
    title: "Salary Delay",
    description: "Salary is not credited for the last two months.",
    submittedDate: "20/11/2025",
    status: "RESOLVED", // Adjusted status format
    submittedBy: "John Smith",
    email: "john.smith@example.com",
    lastUpdated: "21/11/2025, 15:30:00",
  },
];