// Client API interface for SourceIt PostgreSQL database backend

export interface DbUser {
  id: number;
  uid: string;
  username?: string | null;
  password?: string | null;
  phone?: string | null;
  email?: string | null;
  name: string;
  role: string;
  avatar?: string | null;
  verified?: boolean | null;
  blocked?: boolean | null;
  skills?: string | null;
  hourlyRate?: string | null;
  dailyRate?: string | null;
  availability?: string | null;
  preferredRadius?: number | null;
  village?: string | null;
  walletBalance?: number | null;
  createdAt?: string;
}

export interface DbJob {
  id: number;
  category: string;
  description: string;
  workersNeeded: number;
  workType: string;
  date: string;
  time: string;
  radiusKm: number;
  budget: string;
  payAmount: number;
  customerName: string;
  customerPhone?: string | null;
  status: string;
  assignedWorkerName?: string | null;
  urgent: boolean;
  createdAt?: string;
}

export interface DbEquipment {
  id: number;
  type: string;
  name: string;
  description?: string | null;
  ownerName: string;
  dist: string;
  dayRate: string;
  hourlyRate?: string | null;
  deposit: string;
  rating: string;
  status: string;
  isOperatorMachine: boolean;
  createdAt?: string;
}

export interface DbProduce {
  id: number;
  name: string;
  category: string;
  sellerName: string;
  dist: string;
  price: string;
  priceNum: number;
  stock: string;
  stockQuantity: number;
  unit: string;
  rating: string;
  createdAt?: string;
}

export interface DbQAMessage {
  id: number;
  questionId: number;
  type: 'answer' | 'followup';
  authorName: string;
  isExpert?: boolean | null;
  price: number;
  unlocked: boolean;
  verified?: boolean | null;
  text: string;
  createdAt?: string;
}

export interface DbQuestion {
  id: number;
  category: string;
  text: string;
  askerName: string;
  createdAt?: string;
  messages: DbQAMessage[];
}

export interface DbTransaction {
  id: number;
  txnCode: string;
  label: string;
  amount: number;
  type: 'customer' | 'worker';
  status: string;
  createdAt?: string;
}

export interface DbSnippet {
  id: number;
  title: string;
  description?: string | null;
  code: string;
  language: string;
  authorName: string;
  tags?: string | null;
  createdAt?: string;
}

export const api = {
  // Users
  getUsers: async (): Promise<DbUser[]> => {
    const res = await fetch('/api/users');
    return res.json();
  },
  saveUser: async (user: Partial<DbUser>): Promise<DbUser> => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    return res.json();
  },
  loginUser: async (credentials: { userId: string; password?: string }): Promise<DbUser> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },
  verifyUser: async (id: number): Promise<DbUser> => {
    const res = await fetch(`/api/users/${id}/verify`, { method: 'PUT' });
    return res.json();
  },
  deleteUser: async (id: number): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    return res.json();
  },
  updateExpertise: async (data: {
    uid?: string;
    skills: string;
    availability: string;
    preferredRadius: number;
    hourlyRate?: string;
    dailyRate?: string;
  }): Promise<DbUser> => {
    const res = await fetch('/api/users/expertise', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Jobs
  getJobs: async (): Promise<DbJob[]> => {
    const res = await fetch('/api/jobs');
    return res.json();
  },
  createJob: async (job: Partial<DbJob>): Promise<DbJob> => {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });
    return res.json();
  },
  updateJobStatus: async (id: number, status: string, assignedWorkerName?: string): Promise<DbJob> => {
    const res = await fetch(`/api/jobs/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, assignedWorkerName }),
    });
    return res.json();
  },

  // Equipment
  getEquipment: async (): Promise<DbEquipment[]> => {
    const res = await fetch('/api/equipment');
    return res.json();
  },
  createEquipment: async (eq: Partial<DbEquipment>): Promise<DbEquipment> => {
    const res = await fetch('/api/equipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eq),
    });
    return res.json();
  },
  bookEquipment: async (booking: {
    equipmentId: number;
    userName: string;
    date: string;
    duration: string;
    quantity: number;
    unit: string;
    totalAmount: number;
  }) => {
    const res = await fetch('/api/equipment-bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });
    return res.json();
  },

  // Produce
  getProduce: async (): Promise<DbProduce[]> => {
    const res = await fetch('/api/produce');
    return res.json();
  },
  createProduce: async (item: Partial<DbProduce>): Promise<DbProduce> => {
    const res = await fetch('/api/produce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return res.json();
  },
  createOrder: async (order: {
    produceId: number;
    buyerName: string;
    quantity: number;
    deliveryType: string;
    totalAmount: number;
  }) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    return res.json();
  },

  // Q&A
  getQuestions: async (): Promise<DbQuestion[]> => {
    const res = await fetch('/api/questions');
    return res.json();
  },
  createQuestion: async (q: { category: string; text: string; askerName: string }): Promise<DbQuestion> => {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(q),
    });
    return res.json();
  },
  addQAMessage: async (
    questionId: number,
    msg: { type: 'answer' | 'followup'; authorName: string; isExpert?: boolean; price?: number; text: string }
  ): Promise<DbQAMessage> => {
    const res = await fetch(`/api/questions/${questionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });
    return res.json();
  },
  unlockAnswer: async (questionId: number, messageId: number): Promise<DbQAMessage> => {
    const res = await fetch(`/api/questions/${questionId}/messages/${messageId}/unlock`, {
      method: 'PUT',
    });
    return res.json();
  },
  verifyAnswer: async (questionId: number, messageId: number): Promise<DbQAMessage> => {
    const res = await fetch(`/api/questions/${questionId}/messages/${messageId}/verify`, {
      method: 'PUT',
    });
    return res.json();
  },
  deleteAnswer: async (questionId: number, messageId: number): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/questions/${questionId}/messages/${messageId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Transactions
  getTransactions: async (): Promise<DbTransaction[]> => {
    const res = await fetch('/api/transactions');
    return res.json();
  },
  createTransaction: async (txn: { label: string; amount: number; type: 'customer' | 'worker' }): Promise<DbTransaction> => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(txn),
    });
    return res.json();
  },

  // Snippets
  getSnippets: async (): Promise<DbSnippet[]> => {
    const res = await fetch('/api/snippets');
    return res.json();
  },
  createSnippet: async (snippet: {
    title: string;
    description: string;
    code: string;
    language: string;
    authorName: string;
    tags: string;
  }): Promise<DbSnippet> => {
    const res = await fetch('/api/snippets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snippet),
    });
    return res.json();
  },
  deleteSnippet: async (id: number): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/snippets/${id}`, { method: 'DELETE' });
    return res.json();
  },
};
