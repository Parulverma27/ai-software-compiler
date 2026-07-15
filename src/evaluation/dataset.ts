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

  // --- 50 New Product Benchmarks ---
  {
    id: 'bench-11',
    type: 'benchmark',
    category: 'normal',
    title: 'Clinic Patient Scheduler',
    prompt: 'Build a doctor-patient appointment system. Patients can register, browse doctors by specialty, and book appointments. Doctors can view their schedules and add consultation notes. System admins can manage the doctor directory.',
    expectedTables: ['users', 'doctors', 'appointments', 'consultation_notes']
  },
  {
    id: 'bench-12',
    type: 'benchmark',
    category: 'normal',
    title: 'Logistics Fleet Tracker',
    prompt: 'Create a fleet management dashboard. Drivers can update their location and report vehicle status. Dispatchers can assign shipments to drivers and monitor routes. Admins can register new trucks and view analytical reports on fuel consumption.',
    expectedTables: ['users', 'vehicles', 'shipments', 'route_logs']
  },
  {
    id: 'bench-13',
    type: 'benchmark',
    category: 'normal',
    title: 'Community Forum Platform',
    prompt: 'We need a forum app. Standard users can create posts, join public groups, and comment on other users posts. Group moderators can approve posts and ban users from their group. System administrators can delete groups, manage global policies, and access user report dashboards.',
    expectedTables: ['users', 'groups', 'posts', 'comments', 'moderation_logs']
  },
  {
    id: 'bench-14',
    type: 'benchmark',
    category: 'normal',
    title: 'Concert Ticket Portal',
    prompt: 'Please make an event booking system. Event organizers can create concerts, specify ticket tiers, and view sales reports. Customers can browse concerts, buy tickets, and access their purchase history. Support staff can check ticket validity.',
    expectedTables: ['users', 'events', 'tickets', 'payments']
  },
  {
    id: 'bench-15',
    type: 'benchmark',
    category: 'normal',
    title: 'Corporate HR & Payroll Hub',
    prompt: 'Design an HR portal. Employees can view pay stubs, request leaves, and edit personal info. Managers can approve leaves and edit salaries for their direct reports. HR admins can onboard users, run monthly payroll, and view company salary reports. Auditors have read-only access to payroll history.',
    expectedTables: ['users', 'leave_requests', 'pay_stubs', 'salaries', 'audit_logs']
  },
  {
    id: 'bench-16',
    type: 'benchmark',
    category: 'normal',
    title: 'Warehouse Stock Manager',
    prompt: 'Build a warehouse inventory system. Staff can scan items in and out, updating quantities. Managers can set low-stock alert thresholds and view supplier lists. Admins can generate monthly audit records.',
    expectedTables: ['users', 'inventory_items', 'stock_movements', 'suppliers']
  },
  {
    id: 'bench-17',
    type: 'benchmark',
    category: 'normal',
    title: 'Personal Budgeting App',
    prompt: 'Create a budgeting app. Users can log their expenses, set monthly spending category limits, and view visual graphs of their savings. Premium tier users can connect virtual accounts.',
    expectedTables: ['users', 'expenses', 'budget_limits', 'accounts']
  },
  {
    id: 'bench-18',
    type: 'benchmark',
    category: 'normal',
    title: 'Commercial Property Brokerage',
    prompt: 'Build a commercial real estate marketplace. Property owners can list offices for rent. Tenants can request virtual tours and submit offers. Agents manage matching contracts.',
    expectedTables: ['users', 'properties', 'tour_requests', 'offers']
  },
  {
    id: 'bench-19',
    type: 'benchmark',
    category: 'normal',
    title: 'Boutique Hotel Booking Suite',
    prompt: 'Develop a hotel management system. Guests can search available rooms, select check-in dates, and reserve rooms. Front desk staff can check guests in/out and assign room keys. Managers can adjust room pricing seasonal tiers, and clean staff updates room statuses.',
    expectedTables: ['users', 'rooms', 'bookings', 'room_statuses', 'payments']
  },
  {
    id: 'bench-20',
    type: 'benchmark',
    category: 'normal',
    title: 'Law Firm Case Tracker',
    prompt: 'Make a legal case manager. Attorneys can log billable hours, upload document templates, and link cases to clients. Clients can view case updates and message their attorneys. Admin staff can send invoices.',
    expectedTables: ['users', 'cases', 'billable_hours', 'documents']
  },
  {
    id: 'bench-21',
    type: 'benchmark',
    category: 'normal',
    title: 'IoT Smart Home Monitor',
    prompt: 'Build a smart home dashboard. Devices publish temperature, status, and alerts. Homeowners can register devices, set custom trigger rules, and view real-time status charts. Technical support agents can run diagnostics. Admin users manage hardware profiles.',
    expectedTables: ['users', 'devices', 'telemetry_data', 'alert_rules', 'diagnostics']
  },
  {
    id: 'bench-22',
    type: 'benchmark',
    category: 'normal',
    title: 'RecruitFlow ATS',
    prompt: 'Build a candidate recruitment pipeline. Recruiters can post jobs and move candidates through stages. Candidates can apply and submit resumes. Hiring managers can leave review scores.',
    expectedTables: ['users', 'jobs', 'applications', 'reviews']
  },
  {
    id: 'bench-23',
    type: 'benchmark',
    category: 'normal',
    title: 'Monthly Subscription Box',
    prompt: 'Design a subscription service. Customers subscribe to monthly themes, update preferences, and view shipping history. Fulfillment team views pending boxes. Admins manage themes and prices.',
    expectedTables: ['users', 'subscriptions', 'box_themes', 'shipments']
  },
  {
    id: 'bench-24',
    type: 'benchmark',
    category: 'normal',
    title: 'GigWorks Freelance Market',
    prompt: 'Create a gig booking marketplace. Clients can post jobs and deposit milestone payments. Freelancers can apply, submit completed work, and request payouts. Dispute managers can resolve complaints and release escrow funds. Admins run compliance reports.',
    expectedTables: ['users', 'jobs', 'milestones', 'submissions', 'payouts']
  },
  {
    id: 'bench-25',
    type: 'benchmark',
    category: 'normal',
    title: 'ByteBites Food Delivery',
    prompt: 'Build a food delivery platform. Customers order food from restaurant menus. Restaurant partners accept orders and prepare food. Courier drivers claim deliveries and mark them complete. Admins oversee payouts, dispute tickets, and platform settings.',
    expectedTables: ['users', 'restaurants', 'menu_items', 'orders', 'deliveries']
  },
  {
    id: 'bench-26',
    type: 'benchmark',
    category: 'normal',
    title: 'Smart City Parking Portal',
    prompt: 'Build a parking permit system. Drivers register cars and purchase monthly zone permits. Parking wardens query plate numbers to verify active permits.',
    expectedTables: ['users', 'vehicles', 'permits', 'patrol_checks']
  },
  {
    id: 'bench-27',
    type: 'benchmark',
    category: 'normal',
    title: 'Community Library Catalog',
    prompt: 'Build a library catalogue and loan tracker. Library members can search books, place holds, and check out items. Librarians can add new books, record returns, and assess overdue fines.',
    expectedTables: ['users', 'books', 'loans', 'fines']
  },
  {
    id: 'bench-28',
    type: 'benchmark',
    category: 'normal',
    title: 'Pawsitive Pet Care Salon',
    prompt: 'Build a pet grooming appointment app. Pet owners register pets and schedule grooming slots. Groomers update appointments and mark tasks complete.',
    expectedTables: ['users', 'pets', 'appointments', 'grooming_tasks']
  },
  {
    id: 'bench-29',
    type: 'benchmark',
    category: 'normal',
    title: 'CoSpace Office Booking',
    prompt: 'Build a co-working reservation app. Members can book hot desks, conference rooms, and buy print credits. Office managers approve bookings and update room availability.',
    expectedTables: ['users', 'rooms', 'bookings', 'transactions']
  },
  {
    id: 'bench-30',
    type: 'benchmark',
    category: 'normal',
    title: 'SureCover Insurance Portal',
    prompt: 'Build an insurance claims engine. Customers file claims and upload damage photos. Claims adjusters review policies, assign liability percentages, and approve payouts. Managers authorize claims over ten thousand dollars. Admins manage policy rules.',
    expectedTables: ['users', 'policies', 'claims', 'documents', 'payouts']
  },
  {
    id: 'bench-31',
    type: 'benchmark',
    category: 'normal',
    title: 'SurveyMaker Feedback Engine',
    prompt: 'Build a survey constructor. Creators build surveys, add custom questions, and send invitations. Respondents fill out surveys. Creators view response dashboard analytics.',
    expectedTables: ['users', 'surveys', 'questions', 'responses']
  },
  {
    id: 'bench-32',
    type: 'benchmark',
    category: 'normal',
    title: 'DriveShare Car Rental',
    prompt: 'Create a car rental app. Customers rent cars, upload driver licenses, and make payments. Fleet managers track vehicle mileage, maintenance logs, and check rental returns.',
    expectedTables: ['users', 'vehicles', 'rentals', 'maintenance_logs']
  },
  {
    id: 'bench-33',
    type: 'benchmark',
    category: 'normal',
    title: 'KindGiver Charity Platform',
    prompt: 'Build a fundraising portal. Donors choose campaigns, make donations, and download tax receipts. Campaign managers create fundraising targets and post updates.',
    expectedTables: ['users', 'campaigns', 'donations', 'updates']
  },
  {
    id: 'bench-34',
    type: 'benchmark',
    category: 'normal',
    title: 'VetCare Clinic Suite',
    prompt: 'Build a veterinary management platform. Vets record diagnosis details, prescribe medications, and order lab tests for animals. Pet owners view pet medical history and schedule visits. Receptionists issue invoice receipts.',
    expectedTables: ['users', 'patients', 'medical_records', 'prescriptions', 'invoices']
  },
  {
    id: 'bench-35',
    type: 'benchmark',
    category: 'normal',
    title: 'LabResearch Project Hub',
    prompt: 'Build a lab portal. Researchers log experiment steps, upload datasets, and record lab equipment bookings. Principal investigators review results and approve grant budgets.',
    expectedTables: ['users', 'experiments', 'datasets', 'equipment_bookings']
  },
  {
    id: 'bench-36',
    type: 'benchmark',
    category: 'normal',
    title: 'StreamBox Video Streaming',
    prompt: 'Build a video subscription site. Viewers search videos, create watchlists, and pay subscription fees. Content creators upload videos and check views. Admins check copyright compliance and revenue shares.',
    expectedTables: ['users', 'videos', 'watchlists', 'subscriptions', 'royalties']
  },
  {
    id: 'bench-37',
    type: 'benchmark',
    category: 'normal',
    title: 'CaterEase Event Planner',
    prompt: 'Build a catering platform. Event planners request menus, list dietary constraints, and sign proposals. Caterers prepare menus and send custom price quotes.',
    expectedTables: ['users', 'events', 'menu_proposals', 'quotes']
  },
  {
    id: 'bench-38',
    type: 'benchmark',
    category: 'normal',
    title: 'DormLife Student Portal',
    prompt: 'Build a student dorm booking system. Students apply for rooms, report maintenance issues, and pay rent. Resident advisors organize events. Housing admins assign rooms.',
    expectedTables: ['users', 'rooms', 'applications', 'maintenance_issues']
  },
  {
    id: 'bench-39',
    type: 'benchmark',
    category: 'normal',
    title: 'PharmaDirect Order Flow',
    prompt: 'Build a pharmacy store app. Customers upload prescriptions and place medicine orders. Pharmacists verify prescriptions and pack medicine boxes. Delivery drivers deliver items. System admins track dangerous drug quotas.',
    expectedTables: ['users', 'prescriptions', 'orders', 'inventory', 'delivery_logs']
  },
  {
    id: 'bench-40',
    type: 'benchmark',
    category: 'normal',
    title: 'AssetFlow Stock Portfolio',
    prompt: 'Build a stock portfolio manager. Investors link accounts, record stock purchases, and track asset distribution. Financial advisors propose model portfolios to investors.',
    expectedTables: ['users', 'portfolios', 'transactions', 'portfolio_models']
  },
  {
    id: 'bench-41',
    type: 'benchmark',
    category: 'normal',
    title: 'FitPulse Gym Schedules',
    prompt: 'Build a fitness class dashboard. Members search fitness schedules, RSVP for classes, and buy class packs. Trainers view attendee registration check-ins.',
    expectedTables: ['users', 'classes', 'registrations', 'packs']
  },
  {
    id: 'bench-42',
    type: 'benchmark',
    category: 'normal',
    title: 'TranslateGo Project Suite',
    prompt: 'Build a translation platform. Clients upload document projects and pay quotes. Translators translate files, submit drafts, and log words translated. Proofreaders verify quality. Managers assign linguists.',
    expectedTables: ['users', 'projects', 'tasks', 'submissions', 'invoices']
  },
  {
    id: 'bench-43',
    type: 'benchmark',
    category: 'normal',
    title: 'Glamour beauty scheduling',
    prompt: 'Build a beauty salon scheduler. Clients reserve service times, choose stylists, and leave feedback. Stylists update services and block off vacation times.',
    expectedTables: ['users', 'services', 'bookings', 'reviews']
  },
  {
    id: 'bench-44',
    type: 'benchmark',
    category: 'normal',
    title: 'AutoFix Mechanic Portal',
    prompt: 'Build an auto mechanic repair system. Car owners submit repair requests and review estimates. Mechanics log repair actions and list parts used. Admins compile invoices.',
    expectedTables: ['users', 'vehicles', 'repair_orders', 'parts_used']
  },
  {
    id: 'bench-45',
    type: 'benchmark',
    category: 'normal',
    title: 'TourGuide Booking Hub',
    prompt: 'Build a travel booking site. Guides list custom local tours. Tourists book guides, select tour dates, and pay. Guides update itinerary schedules.',
    expectedTables: ['users', 'tours', 'bookings', 'itineraries']
  },
  {
    id: 'bench-46',
    type: 'benchmark',
    category: 'normal',
    title: 'BugTracker Dev Suite',
    prompt: 'Build a software issue dashboard. Developers create bug reports, assign priorities, and link commits. Project managers assign bug tickets to developers. Admins manage project roles and generate sprint status reports.',
    expectedTables: ['users', 'projects', 'issues', 'comments', 'sprint_logs']
  },
  {
    id: 'bench-47',
    type: 'benchmark',
    category: 'normal',
    title: 'Renovation Quote Hub',
    prompt: 'Build a home renovation app. Homeowners submit quote requests and upload property pictures. Contractors send project estimates and payment schedules.',
    expectedTables: ['users', 'projects', 'estimates', 'documents']
  },
  {
    id: 'bench-48',
    type: 'benchmark',
    category: 'normal',
    title: 'AudioStudio Booking Suite',
    prompt: 'Build a recording studio scheduler. Musicians book sound rooms and request audio engineers. Sound engineers set equipment requests. Studio managers track bills.',
    expectedTables: ['users', 'rooms', 'bookings', 'equipment_requests']
  },
  {
    id: 'bench-49',
    type: 'benchmark',
    category: 'normal',
    title: 'DentalOffice Treatment System',
    prompt: 'Build a dental management suite. Dentists record tooth charts, log dental treatments, and write patient prescriptions. Patients schedule dental checkups. Receptionists process billing details.',
    expectedTables: ['users', 'patients', 'appointments', 'treatments', 'prescriptions']
  },
  {
    id: 'bench-50',
    type: 'benchmark',
    category: 'normal',
    title: 'ApparelDesign Order Desk',
    prompt: 'Build a custom apparel platform. Customers select clothing bases, upload custom graphics, and place design orders. Designers review design specs. Printers print orders.',
    expectedTables: ['users', 'designs', 'orders', 'printing_status']
  },
  {
    id: 'bench-51',
    type: 'benchmark',
    category: 'normal',
    title: 'AgriSensor Smart Farm',
    prompt: 'Build an agricultural tracking system. IoT sensors transmit soil moisture, temperature, and sun levels. Farmers register sensor devices, configure custom trigger levels, and set water valve times. Agronomists inspect fields.',
    expectedTables: ['users', 'devices', 'sensor_readings', 'watering_schedules', 'agronomist_reports']
  },
  {
    id: 'bench-52',
    type: 'benchmark',
    category: 'normal',
    title: 'ArtGallery Exhibition Manager',
    prompt: 'Build an art gallery archive. Artists list artworks, set prices, and list exhibition statuses. Gallery curators organize gallery collections. Buyers request private viewings.',
    expectedTables: ['users', 'artworks', 'exhibitions', 'viewing_requests']
  },
  {
    id: 'bench-53',
    type: 'benchmark',
    category: 'normal',
    title: 'VolunteerMatch Hub',
    prompt: 'Build a volunteer coordination system. Organizers list volunteering events. Volunteers sign up for shifts and log their community hours.',
    expectedTables: ['users', 'events', 'shifts', 'logged_hours']
  },
  {
    id: 'bench-54',
    type: 'benchmark',
    category: 'normal',
    title: 'Tenancy Maintenance Portal',
    prompt: 'Build a rental maintenance manager. Tenants submit work orders, describe issues, and set entry instructions. Landlords assign tasks to service technicians.',
    expectedTables: ['users', 'work_orders', 'assignments', 'maintenance_notes']
  },
  {
    id: 'bench-55',
    type: 'benchmark',
    category: 'normal',
    title: 'BidBlast Auction House',
    prompt: 'Build an auction platform. Sellers list auction items, set reserve prices, and set end dates. Bidders place bids and pay deposit payments. Auctioneers monitor compliance rules. Admins distribute payouts.',
    expectedTables: ['users', 'items', 'bids', 'payments', 'payouts']
  },
  {
    id: 'bench-56',
    type: 'benchmark',
    category: 'normal',
    title: 'EcoWaste Dump Tracker',
    prompt: 'Build a waste disposal monitoring system. Truck drivers record dump weights, category types, and drop times. Site inspectors verify hazardous levels. Billing admins invoice customers.',
    expectedTables: ['users', 'disposal_logs', 'inspections', 'invoices']
  },
  {
    id: 'bench-57',
    type: 'benchmark',
    category: 'normal',
    title: 'ConfMeet Virtual Event',
    prompt: 'Build an online conference hub. Speakers upload presentations, attendees join virtual sessions, and sponsors customize display booths. Event organizers manage slot timetables and process ticket sales.',
    expectedTables: ['users', 'sessions', 'registrations', 'presentations', 'booths']
  },
  {
    id: 'bench-58',
    type: 'benchmark',
    category: 'normal',
    title: 'LingoTutor Class Network',
    prompt: 'Build a language tutoring app. Students choose tutors, select lesson times, and buy tutoring points. Tutors set lesson slots.',
    expectedTables: ['users', 'tutors', 'lessons', 'transactions']
  },
  {
    id: 'bench-59',
    type: 'benchmark',
    category: 'normal',
    title: 'CruiseSail Voyage Manager',
    prompt: 'Build a cruise vacation reservation platform. Customers choose cabins, book cruises, and book dining times. Ship agents update sailing timetables.',
    expectedTables: ['users', 'cruises', 'cabins', 'bookings']
  },
  {
    id: 'bench-60',
    type: 'benchmark',
    category: 'normal',
    title: 'HeavyRent Machinery Tracker',
    prompt: 'Build an industrial machine rental service. Clients reserve excavators, select rental periods, and sign safety waivers. Technicians log safety inspections, maintenance tasks, and check returns. Admins calculate rental bills.',
    expectedTables: ['users', 'machinery', 'rentals', 'inspections', 'invoices']
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
  },

  // --- 30 New Edge Case Prompts ---
  // Vague
  {
    id: 'edge-11',
    type: 'edge_case',
    category: 'vague',
    title: 'Vague Business App',
    prompt: 'Build an app for my new business venture.',
    expectedTables: ['users', 'leads', 'deals']
  },
  {
    id: 'edge-12',
    type: 'edge_case',
    category: 'vague',
    title: 'Vague Store Platform',
    prompt: 'Make a web shop that sells stuff online.',
    expectedTables: ['users', 'products', 'orders']
  },
  {
    id: 'edge-13',
    type: 'edge_case',
    category: 'vague',
    title: 'Vague Social Network',
    prompt: 'Build an app to connect people with other people.',
    expectedTables: ['users', 'connections', 'messages']
  },
  {
    id: 'edge-14',
    type: 'edge_case',
    category: 'vague',
    title: 'Vague Tracking Dashboard',
    prompt: 'Create a visual tool for tracking metrics.',
    expectedTables: ['users', 'metrics', 'logs']
  },
  {
    id: 'edge-15',
    type: 'edge_case',
    category: 'vague',
    title: 'Vague Booking System',
    prompt: 'Make a booking system.',
    expectedTables: ['users', 'bookings']
  },
  {
    id: 'edge-16',
    type: 'edge_case',
    category: 'vague',
    title: 'Vague Event App',
    prompt: 'Create a system for events.',
    expectedTables: ['users', 'events', 'attendees']
  },
  {
    id: 'edge-17',
    type: 'edge_case',
    category: 'vague',
    title: 'Vague Portal',
    prompt: 'I need a portal with data pages.',
    expectedTables: ['users', 'records']
  },
  {
    id: 'edge-18',
    type: 'edge_case',
    category: 'vague',
    title: 'Vague Workspace',
    prompt: 'Build a shared workspace database.',
    expectedTables: ['users', 'documents']
  },
  {
    id: 'edge-19',
    type: 'edge_case',
    category: 'vague',
    title: 'Vague Listing site',
    prompt: 'Make an app to list and see items.',
    expectedTables: ['users', 'listings']
  },
  {
    id: 'edge-20',
    type: 'edge_case',
    category: 'vague',
    title: 'Vague Service Engine',
    prompt: 'Create a platform to order tasks.',
    expectedTables: ['users', 'tasks']
  },

  // Conflicting
  {
    id: 'edge-21',
    type: 'edge_case',
    category: 'conflicting',
    title: 'Conflicting Admin Rights',
    prompt: 'Build a blog where only admins can edit posts, but also all users must be able to edit any posts.',
    expectedTables: ['users', 'posts']
  },
  {
    id: 'edge-22',
    type: 'edge_case',
    category: 'conflicting',
    title: 'Conflicting Visibility Settings',
    prompt: 'Make a medical app where doctors cannot see patient files, but doctors must write notes in those patient files.',
    expectedTables: ['users', 'patients', 'medical_files']
  },
  {
    id: 'edge-23',
    type: 'edge_case',
    category: 'conflicting',
    title: 'Conflicting Database Deletion',
    prompt: 'Build an inventory tool where users cannot delete items from the database, but let them permanently delete stock records.',
    expectedTables: ['users', 'stock']
  },
  {
    id: 'edge-24',
    type: 'edge_case',
    category: 'conflicting',
    title: 'Conflicting Subscription Access',
    prompt: 'Create an e-learning platform where only paid members can view courses, but guests have full free access to all course contents.',
    expectedTables: ['users', 'courses']
  },
  {
    id: 'edge-25',
    type: 'edge_case',
    category: 'conflicting',
    title: 'Conflicting Account Role',
    prompt: 'Create a dashboard where regular users have no access roles, but they must be assigned the manager role upon login.',
    expectedTables: ['users']
  },
  {
    id: 'edge-26',
    type: 'edge_case',
    category: 'conflicting',
    title: 'Conflicting Payment Gating',
    prompt: 'Build an app where all features require a premium subscription, but users can access everything without a payment plan.',
    expectedTables: ['users', 'payments']
  },
  {
    id: 'edge-27',
    type: 'edge_case',
    category: 'conflicting',
    title: 'Conflicting User Creation',
    prompt: 'Build an app where only registered users can sign up for new accounts.',
    expectedTables: ['users']
  },
  {
    id: 'edge-28',
    type: 'edge_case',
    category: 'conflicting',
    title: 'Conflicting Project Scope',
    prompt: 'Create a project manager where a task can belong to multiple projects, but every task must belong to exactly one project.',
    expectedTables: ['users', 'projects', 'tasks']
  },
  {
    id: 'edge-29',
    type: 'edge_case',
    category: 'conflicting',
    title: 'Conflicting Auth System',
    prompt: 'Make a secure portal with no login credentials, but password authentication is required for all data endpoints.',
    expectedTables: ['users']
  },
  {
    id: 'edge-30',
    type: 'edge_case',
    category: 'conflicting',
    title: 'Conflicting Data Status',
    prompt: 'Build a ticket system where support tickets are always open, but agents can mark tickets as fully closed.',
    expectedTables: ['users', 'tickets']
  },

  // Incomplete
  {
    id: 'edge-31',
    type: 'edge_case',
    category: 'incomplete',
    title: 'Incomplete Task Tracker',
    prompt: 'Create an app with a database.',
    expectedTables: ['users', 'data']
  },
  {
    id: 'edge-32',
    type: 'edge_case',
    category: 'incomplete',
    title: 'Incomplete Booking App',
    prompt: 'Build a system to reservation.',
    expectedTables: ['users', 'reservations']
  },
  {
    id: 'edge-33',
    type: 'edge_case',
    category: 'incomplete',
    title: 'Incomplete Customer Hub',
    prompt: 'Make a dashboard with database tables for customer lists.',
    expectedTables: ['users', 'customers']
  },
  {
    id: 'edge-34',
    type: 'edge_case',
    category: 'incomplete',
    title: 'Incomplete Job Board',
    prompt: 'Build a page to search for openings.',
    expectedTables: ['users', 'jobs']
  },
  {
    id: 'edge-35',
    type: 'edge_case',
    category: 'incomplete',
    title: 'Incomplete School Platform',
    prompt: 'Build a student dashboard.',
    expectedTables: ['users', 'students']
  },
  {
    id: 'edge-36',
    type: 'edge_case',
    category: 'incomplete',
    title: 'Incomplete Food App',
    prompt: 'Create a restaurant page.',
    expectedTables: ['users', 'restaurants']
  },
  {
    id: 'edge-37',
    type: 'edge_case',
    category: 'incomplete',
    title: 'Incomplete Medical App',
    prompt: 'Build a clinic management database.',
    expectedTables: ['users', 'appointments']
  },
  {
    id: 'edge-38',
    type: 'edge_case',
    category: 'incomplete',
    title: 'Incomplete Expense App',
    prompt: 'Create a corporate tool to log budgets.',
    expectedTables: ['users', 'budgets']
  },
  {
    id: 'edge-39',
    type: 'edge_case',
    category: 'incomplete',
    title: 'Incomplete Library App',
    prompt: 'Make a book search tool.',
    expectedTables: ['users', 'books']
  },
  {
    id: 'edge-40',
    type: 'edge_case',
    category: 'incomplete',
    title: 'Incomplete Fleet App',
    prompt: 'Create a driver delivery portal.',
    expectedTables: ['users', 'deliveries']
  }
];
