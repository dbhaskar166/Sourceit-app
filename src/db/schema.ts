import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (SourceIt profiles, workers, customers, admins)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Unique identifier or user ID
  username: text('username'), // For User ID login
  password: text('password'), // For Password login (hashed or stored password)
  phone: text('phone'),
  email: text('email'),
  name: text('name').notNull(),
  role: text('role').notNull().default('worker'), // 'worker' | 'customer' | 'both' | 'admin'
  avatar: text('avatar'),
  verified: boolean('verified').default(false),
  blocked: boolean('blocked').default(false),
  skills: text('skills'), // Comma-separated or JSON list
  hourlyRate: text('hourly_rate'),
  dailyRate: text('daily_rate'),
  availability: text('availability').default('Available'), // 'Available' | 'Busy' | 'Not Available'
  preferredRadius: integer('preferred_radius').default(10),
  village: text('village').default('Village ABC'),
  walletBalance: integer('wallet_balance').default(1240),
  createdAt: timestamp('created_at').defaultNow(),
});

// Code Snippets table (as explicitly requested: source code snippets)
export const snippets = pgTable('snippets', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  code: text('code').notNull(),
  language: text('language').default('typescript'),
  authorId: integer('author_id').references(() => users.id),
  authorName: text('author_name').notNull().default('Community Contributor'),
  tags: text('tags'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Jobs table
export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  workersNeeded: integer('workers_needed').default(1),
  workType: text('work_type').default('Full Day'),
  date: text('date').default('Tomorrow'),
  time: text('time').default('8:00 AM'),
  radiusKm: integer('radius_km').default(5),
  budget: text('budget').default('₹500 per worker'),
  payAmount: integer('pay_amount').default(500),
  customerId: integer('customer_id').references(() => users.id),
  customerName: text('customer_name').notNull().default('Ramesh'),
  customerPhone: text('customer_phone'),
  status: text('status').default('Requested'), // Requested | Accepted | Started | Completed | Paid | Cancelled
  assignedWorkerId: integer('assigned_worker_id').references(() => users.id),
  assignedWorkerName: text('assigned_worker_name'),
  urgent: boolean('urgent').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Equipment table
export const equipment = pgTable('equipment', {
  id: serial('id').primaryKey(),
  type: text('type').notNull().default('tractor'),
  name: text('name').notNull(),
  description: text('description'),
  ownerId: integer('owner_id').references(() => users.id),
  ownerName: text('owner_name').notNull().default('Suresh'),
  dist: text('dist').default('2 km'),
  dayRate: text('day_rate').notNull().default('₹700/day'),
  hourlyRate: text('hourly_rate'),
  deposit: text('deposit').notNull().default('₹2,000'),
  rating: text('rating').default('4.8'),
  status: text('status').default('Available'),
  isOperatorMachine: boolean('is_operator_machine').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Equipment Bookings table
export const equipmentBookings = pgTable('equipment_bookings', {
  id: serial('id').primaryKey(),
  equipmentId: integer('equipment_id').references(() => equipment.id),
  userId: integer('user_id').references(() => users.id),
  userName: text('user_name').notNull(),
  date: text('date').default('Tomorrow'),
  duration: text('duration').default('1 day'),
  quantity: integer('quantity').default(1),
  unit: text('unit').default('day'),
  status: text('status').default('Booked'), // Booked | Collected | Returned | Paid
  totalAmount: integer('total_amount').default(735),
  createdAt: timestamp('created_at').defaultNow(),
});

// Marketplace Produce items
export const produceItems = pgTable('produce_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'vegetables' | 'fruits' | 'grains' | 'bamboo'
  sellerId: integer('seller_id').references(() => users.id),
  sellerName: text('seller_name').notNull().default('Sunita'),
  dist: text('dist').default('2 km'),
  price: text('price').notNull().default('₹20/kg'),
  priceNum: integer('price_num').default(20),
  stock: text('stock').notNull().default('80 kg available'),
  stockQuantity: integer('stock_quantity').default(80),
  unit: text('unit').default('kg'),
  rating: text('rating').default('4.6'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Marketplace Orders
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  produceId: integer('produce_id').references(() => produceItems.id),
  buyerId: integer('buyer_id').references(() => users.id),
  buyerName: text('buyer_name').notNull(),
  quantity: integer('quantity').notNull().default(1),
  deliveryType: text('delivery_type').default('Self Pickup'),
  totalAmount: integer('total_amount').notNull(),
  status: text('status').default('Ordered'), // Ordered | Confirmed | Ready | Paid
  createdAt: timestamp('created_at').defaultNow(),
});

// Q&A Questions
export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  category: text('category').notNull().default('farm'),
  text: text('text').notNull(),
  askerId: integer('asker_id').references(() => users.id),
  askerName: text('asker_name').notNull().default('Ramesh'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Q&A Messages (Answers and Follow-ups)
export const qaMessages = pgTable('qa_messages', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id').references(() => questions.id).notNull(),
  type: text('type').notNull().default('answer'), // 'answer' | 'followup'
  authorId: integer('author_id').references(() => users.id),
  authorName: text('author_name').notNull(),
  isExpert: boolean('is_expert').default(false),
  price: integer('price').default(0),
  unlocked: boolean('unlocked').default(true),
  verified: boolean('verified').default(false),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Wallet Transactions
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  txnCode: text('txn_code').notNull(),
  userId: integer('user_id').references(() => users.id),
  label: text('label').notNull(),
  amount: integer('amount').notNull(),
  type: text('type').notNull().default('customer'), // 'customer' | 'worker'
  status: text('status').default('Completed'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  jobsPosted: many(jobs, { relationName: 'customerJobs' }),
  snippets: many(snippets),
  equipment: many(equipment),
  produce: many(produceItems),
  questions: many(questions),
  transactions: many(transactions),
}));

export const questionsRelations = relations(questions, ({ many, one }) => ({
  messages: many(qaMessages),
  asker: one(users, {
    fields: [questions.askerId],
    references: [users.id],
  }),
}));

export const qaMessagesRelations = relations(qaMessages, ({ one }) => ({
  question: one(questions, {
    fields: [qaMessages.questionId],
    references: [questions.id],
  }),
}));

export const snippetsRelations = relations(snippets, ({ one }) => ({
  author: one(users, {
    fields: [snippets.authorId],
    references: [users.id],
  }),
}));
