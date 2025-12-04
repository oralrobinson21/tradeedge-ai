import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize client only if both URL and key are valid
let supabase: any = null;
let isSupabaseAvailable = false;

try {
  if (supabaseUrl && supabaseKey && supabaseUrl.includes('http')) {
    supabase = createClient(supabaseUrl, supabaseKey);
    isSupabaseAvailable = true;
  }
} catch (error) {
  console.warn('Supabase initialization error:', error);
  isSupabaseAvailable = false;
}

export { supabase, isSupabaseAvailable };

export async function initializeSupabase() {
  if (!isSupabaseAvailable || !supabase) {
    return false;
  }
  
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}

// Safe query wrappers with fallback
const safeQuery = async (fn: any) => {
  if (!isSupabaseAvailable || !supabase) {
    return { data: null, error: 'Supabase not available' };
  }
  try {
    return await fn();
  } catch (error) {
    console.error('Supabase query error:', error);
    return { data: null, error };
  }
};

export const userQueries = {
  async getUser(id: string) {
    return safeQuery(() => supabase.from('users').select('*').eq('id', id).single());
  },
  async getUserByEmail(email: string) {
    return safeQuery(() => supabase.from('users').select('*').eq('email', email).single());
  },
  async createUser(user: any) {
    return safeQuery(() => supabase.from('users').insert([user]).select().single());
  },
  async updateUser(id: string, updates: any) {
    return safeQuery(() => supabase.from('users').update(updates).eq('id', id).select().single());
  },
};

export const taskQueries = {
  async getTasks() {
    return safeQuery(() => supabase.from('tasks').select('*').order('createdAt', { ascending: false }));
  },
  async getTaskById(id: string) {
    return safeQuery(() => supabase.from('tasks').select('*').eq('id', id).single());
  },
  async getCustomerTasks(customerId: string) {
    return safeQuery(() => supabase.from('tasks').select('*').eq('customerId', customerId).order('createdAt', { ascending: false }));
  },
  async getAvailableTasks() {
    return safeQuery(() => supabase.from('tasks').select('*').eq('status', 'paid_waiting').order('createdAt', { ascending: false }));
  },
  async createTask(task: any) {
    return safeQuery(() => supabase.from('tasks').insert([task]).select().single());
  },
  async updateTask(id: string, updates: any) {
    return safeQuery(() => supabase.from('tasks').update(updates).eq('id', id).select().single());
  },
};

export const messageQueries = {
  async getTaskMessages(taskId: string) {
    return safeQuery(() => supabase.from('messages').select('*').eq('taskId', taskId).order('timestamp', { ascending: true }));
  },
  async sendMessage(message: any) {
    return safeQuery(() => supabase.from('messages').insert([message]).select().single());
  },
};

export const conversationQueries = {
  async getUserConversations(userId: string) {
    return safeQuery(() => supabase.from('conversations').select('*').or(`customerId.eq.${userId},workerId.eq.${userId}`).order('lastMessageTime', { ascending: false }));
  },
  async getConversation(taskId: string, userId: string) {
    return safeQuery(() => supabase.from('conversations').select('*').eq('taskId', taskId).or(`customerId.eq.${userId},workerId.eq.${userId}`).single());
  },
  async createConversation(conversation: any) {
    return safeQuery(() => supabase.from('conversations').insert([conversation]).select().single());
  },
  async updateConversation(id: string, updates: any) {
    return safeQuery(() => supabase.from('conversations').update(updates).eq('id', id).select().single());
  },
};

export const ratingQueries = {
  async createRating(rating: any) {
    return safeQuery(() => supabase.from('ratings').insert([rating]).select().single());
  },
  async getUserRatings(userId: string) {
    return safeQuery(() => supabase.from('ratings').select('*').eq('ratedUserId', userId));
  },
  async getTaskRating(taskId: string) {
    return safeQuery(() => supabase.from('ratings').select('*').eq('taskId', taskId).single());
  },
};

export const photoQueries = {
  async uploadPhoto(bucket: string, filePath: string, file: any) {
    return safeQuery(() => supabase.storage.from(bucket).upload(filePath, file));
  },
  async getPhotoUrl(bucket: string, filePath: string) {
    if (!supabase) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data?.publicUrl;
  },
};
