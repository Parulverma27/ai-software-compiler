export interface EvaluationPrompt {
  id: string;
  type: 'benchmark' | 'edge_case';
  category: 'normal' | 'vague' | 'conflicting' | 'incomplete';
  title: string;
  prompt: string;
  expectedTables: string[];
}

export const evaluationDataset: EvaluationPrompt[] = [
  // --- 10 Real Product Benchmarks ---
  {
    id: 'bench-1',
    type: 'benchmark',
    category: 'normal',
    title: 'Customer CRM Suite',
    prompt: 'Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics.',
    expectedTables: ['users', 'contacts', 'deals']
  },
  {
    id: 'bench-2',
    type: 'benchmark',
    category: 'normal',
    title: 'Enterprise Task Planner',
    prompt: 'Build a task management system. Tasks have priority, due date, and status. Users can manage tasks. Admins can view user list and task completion dashboards. Premium users can set task reminders.',
    expectedTables: ['users', 'tasks', 'reminders']
  },
  {
    id: 'bench-3',
    type: 'benchmark',
    category: 'normal',
    title: 'E-Commerce Marketplace',
    prompt: 'Build an e-commerce system with products, inventory, order processing, and a checkout flow. Customers can buy, vendors can update stock, admins see revenue charts.',
    expectedTables: ['users', 'products', 'orders']
  },
  {
    id: 'bench-4',
    type: 'benchmark',
    category: 'normal',
    title: 'SaaS CMS Platform',
    prompt: 'Build a blog management CMS with authors, posts, categories, and premium subscriber locks. Admins manage categories, authors write, subscribers read premium posts.',
    expectedTables: ['users', 'posts', 'categories']
  },
  {
    id: 'bench-5',
    type: 'benchmark',
    category: 'normal',
    title: 'IT Helpdesk Ticket System',
    prompt: 'Build a support ticketing system with tickets, priorities, agents, customer responses, and SLA times. Customers log tickets, agents update status, admins see resolution rates.',
    expectedTables: ['users', 'tickets', 'responses']
  },
  {
    id: 'bench-6',
    type: 'benchmark',
    category: 'normal',
    title: 'Gym Booking Portal',
    prompt: 'Build a gym membership portal with classes, schedules, bookings, member plans, and instructor checkins. Instructors manage classes, members book schedules, admins see capacity charts.',
    expectedTables: ['users', 'classes', 'bookings']
  },
  {
    id: 'bench-7',
    type: 'benchmark',
    category: 'normal',
    title: 'Real Estate DB & Leads',
    prompt: 'Build a real estate listing database with properties, agent profiles, user visits schedule, and VIP listings. Agents add properties, buyers book viewings, premium users see VIP items.',
    expectedTables: ['users', 'properties', 'bookings']
  },
  {
    id: 'bench-8',
    type: 'benchmark',
    category: 'normal',
    title: 'Restaurant Table Booker',
    prompt: 'Build a restaurant reservation system with tables, reservations, guest counts, and special VIP bookings. Customers request reservation, hosts assign tables, admins see seat turnovers.',
    expectedTables: ['users', 'tables', 'reservations']
  },
  {
    id: 'bench-9',
    type: 'benchmark',
    category: 'normal',
    title: 'LMS E-learning Platform',
    prompt: 'Build a course learning platform with courses, lectures, student enrollments, and premium course paywall gating. Instructors upload courses, students enroll, premium plans unlock items.',
    expectedTables: ['users', 'courses', 'enrollments']
  },
  {
    id: 'bench-10',
    type: 'benchmark',
    category: 'normal',
    title: 'Corporate Expense Approver',
    prompt: 'Build an expense tracker with receipts, category tags, amounts, approvals flow, and monthly limit alerts. Employees upload receipts, managers approve expenses, admins see budgets.',
    expectedTables: ['users', 'expenses', 'categories']
  },

  // --- 10 Edge Case Prompts ---
  {
    id: 'edge-1',
    type: 'edge_case',
    category: 'vague',
    title: 'Vague Social Copier',
    prompt: 'Make something like facebook.',
    expectedTables: ['users', 'posts', 'comments']
  },
  {
    id: 'edge-2',
    type: 'edge_case',
    category: 'vague',
    title: 'Vague Item Tracker',
    prompt: 'Build a tool to track stuff.',
    expectedTables: ['users', 'items']
  },
  {
    id: 'edge-3',
    type: 'edge_case',
    category: 'conflicting',
    title: 'Conflicting Permissions',
    prompt: 'Create a system where users can delete items in UI, but nobody has database delete permissions in auth rules.',
    expectedTables: ['users', 'items']
  },
  {
    id: 'edge-4',
    type: 'edge_case',
    category: 'conflicting',
    title: 'Conflicting Role Capabilities',
    prompt: 'Build a spreadsheet where only admins can edit, but guests can update columns.',
    expectedTables: ['users', 'columns']
  },
  {
    id: 'edge-5',
    type: 'edge_case',
    category: 'incomplete',
    title: 'Incomplete Inventory',
    prompt: 'Build an inventory app.',
    expectedTables: ['users', 'inventory']
  },
  {
    id: 'edge-6',
    type: 'edge_case',
    category: 'incomplete',
    title: 'Incomplete School Board',
    prompt: 'Create a dashboard for school.',
    expectedTables: ['users', 'classes']
  },
  {
    id: 'edge-7',
    type: 'edge_case',
    category: 'conflicting',
    title: 'Conflicting Page Layout',
    prompt: 'Make an app that has users and databases, but has no UI pages whatsoever.',
    expectedTables: ['users']
  },
  {
    id: 'edge-8',
    type: 'edge_case',
    category: 'vague',
    title: 'Vague Account App',
    prompt: 'I want an app that has users.',
    expectedTables: ['users']
  },
  {
    id: 'edge-9',
    type: 'edge_case',
    category: 'incomplete',
    title: 'Incomplete Message Box',
    prompt: 'Build a messaging inbox with contacts.',
    expectedTables: ['users', 'messages', 'contacts']
  },
  {
    id: 'edge-10',
    type: 'edge_case',
    category: 'conflicting',
    title: 'Conflicting Payment DB Flow',
    prompt: 'Build a payment processor where payment records are read-only, but customers can create payments.',
    expectedTables: ['users', 'payments']
  }
];
