import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import * as dotenv from 'dotenv';
import { db } from './src/db/index.ts';
import {
  users,
  jobs,
  equipment,
  equipmentBookings,
  produceItems,
  orders,
  questions,
  qaMessages,
  transactions,
  snippets,
} from './src/db/schema.ts';
import { eq, desc, or } from 'drizzle-orm';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// -------------------------------------------------------------
// Database API Endpoints
// -------------------------------------------------------------

// --- Users ---
app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users).orderBy(users.id);
    res.json(allUsers);
  } catch (err: any) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { uid, username, password, phone, email, name, role, avatar, skills, hourlyRate, dailyRate, village } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const userUid = uid || `u_${Date.now()}`;
    const result = await db
      .insert(users)
      .values({
        uid: userUid,
        username: username || null,
        password: password || null,
        phone: phone || '',
        email: email || '',
        name,
        role: role || 'worker',
        avatar: avatar || null,
        skills: skills || '',
        hourlyRate: hourlyRate || '₹100/hr',
        dailyRate: dailyRate || '₹500/day',
        village: village || 'Village ABC',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          name,
          username: username || undefined,
          password: password || undefined,
          phone: phone || undefined,
          email: email || undefined,
          avatar: avatar || undefined,
          role: role || undefined,
        },
      })
      .returning();
    res.json(result[0]);
  } catch (err: any) {
    console.error('Error saving user:', err);
    res.status(500).json({ error: 'Failed to save user' });
  }
});

// User login endpoint with user ID (username/email/phone) and password
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      return res.status(400).json({ error: 'User ID and Password are required' });
    }
    
    // Find matching user by username, email, phone or uid
    const matched = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.username, userId),
          eq(users.email, userId),
          eq(users.uid, userId),
          eq(users.phone, userId)
        )
      );

    if (matched.length === 0) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const found = matched[0];
    if (found.password && found.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Success
    res.json(found);
  } catch (err: any) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
});

app.put('/api/users/:id/verify', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await db
      .update(users)
      .set({ verified: true })
      .where(eq(users.id, id))
      .returning();
    res.json(updated[0]);
  } catch (err: any) {
    console.error('Error verifying user:', err);
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

app.delete('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(users).where(eq(users.id, id));
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.put('/api/users/expertise', async (req: Request, res: Response) => {
  try {
    const { uid, skills, availability, preferredRadius, hourlyRate, dailyRate } = req.body;
    const updated = await db
      .update(users)
      .set({
        skills,
        availability,
        preferredRadius,
        hourlyRate,
        dailyRate,
      })
      .where(eq(users.uid, uid || 'u_ramesh'))
      .returning();
    res.json(updated[0]);
  } catch (err: any) {
    console.error('Error updating expertise:', err);
    res.status(500).json({ error: 'Failed to update expertise' });
  }
});

// --- Jobs ---
app.get('/api/jobs', async (_req: Request, res: Response) => {
  try {
    const allJobs = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
    res.json(allJobs);
  } catch (err: any) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.post('/api/jobs', async (req: Request, res: Response) => {
  try {
    const { category, description, workersNeeded, workType, date, time, radiusKm, budget, payAmount, customerName, urgent } = req.body;
    const result = await db
      .insert(jobs)
      .values({
        category: category || 'Farm Labour',
        description: description || 'Farm assistance needed',
        workersNeeded: workersNeeded || 1,
        workType: workType || 'Full Day',
        date: date || 'Tomorrow',
        time: time || '8:00 AM',
        radiusKm: radiusKm || 5,
        budget: budget || '₹500 per worker',
        payAmount: payAmount || 500,
        customerName: customerName || 'Ramesh',
        status: 'Requested',
        urgent: urgent || false,
      })
      .returning();
    res.json(result[0]);
  } catch (err: any) {
    console.error('Error creating job:', err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

app.put('/api/jobs/:id/status', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, assignedWorkerName } = req.body;
    const updateData: any = { status };
    if (assignedWorkerName) {
      updateData.assignedWorkerName = assignedWorkerName;
    }
    const updated = await db
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.id, id))
      .returning();
    res.json(updated[0]);
  } catch (err: any) {
    console.error('Error updating job status:', err);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});

// --- Equipment ---
app.get('/api/equipment', async (_req: Request, res: Response) => {
  try {
    const allEq = await db.select().from(equipment).orderBy(equipment.id);
    res.json(allEq);
  } catch (err: any) {
    console.error('Error fetching equipment:', err);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

app.post('/api/equipment', async (req: Request, res: Response) => {
  try {
    const { type, name, description, ownerName, dist, dayRate, hourlyRate, deposit, isOperatorMachine } = req.body;
    const result = await db
      .insert(equipment)
      .values({
        type: type || 'tractor',
        name: name || 'Equipment',
        description: description || '',
        ownerName: ownerName || 'You',
        dist: dist || '0.5 km',
        dayRate: dayRate || '₹700/day',
        hourlyRate: hourlyRate || '₹100/hr',
        deposit: deposit || '₹2,000',
        rating: 'New',
        status: 'Available',
        isOperatorMachine: isOperatorMachine || false,
      })
      .returning();
    res.json(result[0]);
  } catch (err: any) {
    console.error('Error listing equipment:', err);
    res.status(500).json({ error: 'Failed to list equipment' });
  }
});

app.post('/api/equipment-bookings', async (req: Request, res: Response) => {
  try {
    const { equipmentId, userName, date, duration, quantity, unit, totalAmount } = req.body;
    const result = await db
      .insert(equipmentBookings)
      .values({
        equipmentId,
        userName: userName || 'Customer',
        date: date || 'Tomorrow',
        duration: duration || '1 day',
        quantity: quantity || 1,
        unit: unit || 'day',
        totalAmount: totalAmount || 735,
        status: 'Booked',
      })
      .returning();
    res.json(result[0]);
  } catch (err: any) {
    console.error('Error booking equipment:', err);
    res.status(500).json({ error: 'Failed to book equipment' });
  }
});

app.put('/api/equipment-bookings/:id/status', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    const updated = await db
      .update(equipmentBookings)
      .set({ status })
      .where(eq(equipmentBookings.id, id))
      .returning();
    res.json(updated[0]);
  } catch (err: any) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// --- Marketplace Produce ---
app.get('/api/produce', async (_req: Request, res: Response) => {
  try {
    const items = await db.select().from(produceItems).orderBy(produceItems.id);
    res.json(items);
  } catch (err: any) {
    console.error('Error fetching produce:', err);
    res.status(500).json({ error: 'Failed to fetch produce' });
  }
});

app.post('/api/produce', async (req: Request, res: Response) => {
  try {
    const { name, category, sellerName, dist, price, priceNum, stock, stockQuantity, unit } = req.body;
    const result = await db
      .insert(produceItems)
      .values({
        name,
        category: category || 'vegetables',
        sellerName: sellerName || 'You',
        dist: dist || '0.5 km',
        price: price || '₹20/kg',
        priceNum: priceNum || 20,
        stock: stock || '50 kg available',
        stockQuantity: stockQuantity || 50,
        unit: unit || 'kg',
        rating: 'New',
      })
      .returning();
    res.json(result[0]);
  } catch (err: any) {
    console.error('Error adding produce item:', err);
    res.status(500).json({ error: 'Failed to add produce item' });
  }
});

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const { produceId, buyerName, quantity, deliveryType, totalAmount } = req.body;
    const result = await db
      .insert(orders)
      .values({
        produceId,
        buyerName: buyerName || 'Customer',
        quantity: quantity || 1,
        deliveryType: deliveryType || 'Self Pickup',
        totalAmount,
        status: 'Ordered',
      })
      .returning();
    res.json(result[0]);
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.put('/api/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    const updated = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    res.json(updated[0]);
  } catch (err: any) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// --- Q&A ---
app.get('/api/questions', async (_req: Request, res: Response) => {
  try {
    const qList = await db.select().from(questions).orderBy(desc(questions.createdAt));
    const allMsgs = await db.select().from(qaMessages).orderBy(qaMessages.createdAt);

    // Group messages by questionId
    const questionsWithMsgs = qList.map((q) => ({
      ...q,
      messages: allMsgs.filter((m) => m.questionId === q.id),
    }));

    res.json(questionsWithMsgs);
  } catch (err: any) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.post('/api/questions', async (req: Request, res: Response) => {
  try {
    const { category, text, askerName } = req.body;
    const result = await db
      .insert(questions)
      .values({
        category: category || 'farm',
        text,
        askerName: askerName || 'You',
      })
      .returning();
    res.json({ ...result[0], messages: [] });
  } catch (err: any) {
    console.error('Error creating question:', err);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

app.post('/api/questions/:id/messages', async (req: Request, res: Response) => {
  try {
    const questionId = parseInt(req.params.id, 10);
    const { type, authorName, isExpert, price, unlocked, text } = req.body;
    const result = await db
      .insert(qaMessages)
      .values({
        questionId,
        type: type || 'answer',
        authorName: authorName || 'You',
        isExpert: isExpert || false,
        price: price || 0,
        unlocked: unlocked !== undefined ? unlocked : price === 0,
        verified: false,
        text,
      })
      .returning();
    res.json(result[0]);
  } catch (err: any) {
    console.error('Error creating message:', err);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

app.put('/api/questions/:questionId/messages/:messageId/unlock', async (req: Request, res: Response) => {
  try {
    const messageId = parseInt(req.params.messageId, 10);
    const updated = await db
      .update(qaMessages)
      .set({ unlocked: true })
      .where(eq(qaMessages.id, messageId))
      .returning();
    res.json(updated[0]);
  } catch (err: any) {
    console.error('Error unlocking answer:', err);
    res.status(500).json({ error: 'Failed to unlock answer' });
  }
});

app.put('/api/questions/:questionId/messages/:messageId/verify', async (req: Request, res: Response) => {
  try {
    const messageId = parseInt(req.params.messageId, 10);
    const updated = await db
      .update(qaMessages)
      .set({ verified: true })
      .where(eq(qaMessages.id, messageId))
      .returning();
    res.json(updated[0]);
  } catch (err: any) {
    console.error('Error verifying answer:', err);
    res.status(500).json({ error: 'Failed to verify answer' });
  }
});

app.delete('/api/questions/:questionId/messages/:messageId', async (req: Request, res: Response) => {
  try {
    const messageId = parseInt(req.params.messageId, 10);
    await db.delete(qaMessages).where(eq(qaMessages.id, messageId));
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting answer:', err);
    res.status(500).json({ error: 'Failed to delete answer' });
  }
});

// --- Transactions ---
app.get('/api/transactions', async (_req: Request, res: Response) => {
  try {
    const txns = await db.select().from(transactions).orderBy(desc(transactions.createdAt));
    res.json(txns);
  } catch (err: any) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', async (req: Request, res: Response) => {
  try {
    const { label, amount, type } = req.body;
    const result = await db
      .insert(transactions)
      .values({
        txnCode: `TXN${Math.floor(1000 + Math.random() * 9000)}`,
        label,
        amount,
        type: type || 'customer',
        status: 'Completed',
      })
      .returning();
    res.json(result[0]);
  } catch (err: any) {
    console.error('Error adding transaction:', err);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

// --- Snippets (source code snippets & developer tools) ---
app.get('/api/snippets', async (_req: Request, res: Response) => {
  try {
    const allSnippets = await db.select().from(snippets).orderBy(desc(snippets.createdAt));
    res.json(allSnippets);
  } catch (err: any) {
    console.error('Error fetching snippets:', err);
    res.status(500).json({ error: 'Failed to fetch snippets' });
  }
});

app.post('/api/snippets', async (req: Request, res: Response) => {
  try {
    const { title, description, code, language, authorName, tags } = req.body;
    if (!title || !code) {
      return res.status(400).json({ error: 'Title and code are required' });
    }
    const result = await db
      .insert(snippets)
      .values({
        title,
        description: description || '',
        code,
        language: language || 'typescript',
        authorName: authorName || 'Community Contributor',
        tags: tags || 'general',
      })
      .returning();
    res.json(result[0]);
  } catch (err: any) {
    console.error('Error adding snippet:', err);
    res.status(500).json({ error: 'Failed to add snippet' });
  }
});

app.delete('/api/snippets/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(snippets).where(eq(snippets.id, id));
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting snippet:', err);
    res.status(500).json({ error: 'Failed to delete snippet' });
  }
});

// -------------------------------------------------------------
// Vite Middleware Mounting (Dev and Production)
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  }

  app.listen(port, () => {
    console.log(`SourceIt full-stack application running on port ${port}`);
  });
}

startServer();
