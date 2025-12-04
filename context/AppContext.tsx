import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Task, JobOffer, ChatThread, ChatMessage, UserMode, TaskStatus, SupportTicket, SupportTicketCategory, License, getMaxActiveJobsForUser, generateConfirmationCode, generateOTP } from "@/types";
import { API_BASE_URL } from "@/utils/api";

interface AppContextType {
  user: User | null;
  isLoading: boolean;
  userMode: UserMode;
  isHelperMode: boolean;
  tasks: Task[];
  jobOffers: JobOffer[];
  chatThreads: ChatThread[];
  chatMessages: Record<string, ChatMessage[]>;
  supportTickets: SupportTicket[];
  apiUrl: string;
  tasksNeedingPriceAdjustment: Task[];
  bannerDismissed: boolean;
  helperWaiverAccepted: boolean;
  // Auth methods
  sendOTPCode: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyOTPCode: (email: string, code: string) => Promise<{ success: boolean; user?: User; message: string }>;
  updateUserProfile: (phone?: string, defaultZipCode?: string) => Promise<void>;
  updateProfilePhoto: (photoUrl: string) => Promise<void>;
  hasProfilePhoto: () => Promise<boolean>;
  logout: () => Promise<void>;
  setUserMode: (mode: UserMode) => Promise<void>;
  // Phone verification methods
  updatePhone: (phone: string) => Promise<void>;
  verifyPhone: (code: string) => Promise<{ success: boolean; message: string }>;
  // License methods
  addLicense: (license: Omit<License, "id" | "createdAt">) => Promise<void>;
  removeLicense: (licenseId: string) => Promise<void>;
  // Banner and waiver methods
  dismissBanner: () => Promise<void>;
  acceptHelperWaiver: () => Promise<void>;
  // Job stacking helper
  getMaxActiveJobs: () => number;
  getActiveJobsCount: () => number;
  canAcceptMoreJobs: () => boolean;
  // Task methods
  createTask: (taskData: Omit<Task, "id" | "posterId" | "posterName" | "createdAt" | "confirmationCode" | "status">) => Promise<Task>;
  sendOffer: (taskId: string, note: string, proposedPrice?: number) => Promise<void>;
  chooseHelper: (taskId: string, offerId: string) => Promise<{ checkoutUrl?: string }>;
  initializeStripeConnect: () => Promise<{ url?: string }>;
  completeTask: (taskId: string) => Promise<void>;
  cancelTask: (taskId: string, canceledBy: "poster" | "helper") => Promise<void>;
  disputeTask: (taskId: string) => Promise<void>;
  sendChatMessage: (threadId: string, text?: string, imageUrl?: string, isProof?: boolean) => Promise<void>;
  createChatThread: (taskId: string, posterId: string, helperId: string) => Promise<ChatThread>;
  createSupportTicket: (category: SupportTicketCategory, subject: string, message: string, taskId?: string, photoUrls?: string[]) => Promise<void>;
  syncWithSupabase: () => Promise<void>;
  // Price adjustment methods
  adjustTaskPrice: (taskId: string, newPrice: number) => Promise<Task>;
  acknowledgePricePrompt: (taskId: string) => Promise<void>;
  fetchTasksNeedingPriceAdjustment: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: "@citytasks_user",
  TASKS: "@citytasks_tasks",
  JOB_OFFERS: "@citytasks_job_offers",
  CHAT_THREADS: "@citytasks_chat_threads",
  CHAT_MESSAGES: "@citytasks_chat_messages",
  SUPPORT_TICKETS: "@citytasks_support_tickets",
  USER_MODE: "@citytasks_user_mode",
  OTP_CODES: "@citytasks_otp_codes",
  BANNER_DISMISSED: "@citytasks_banner_dismissed",
  HELPER_WAIVER_ACCEPTED: "@citytasks_helper_waiver_accepted",
};

interface StoredOTP {
  email: string;
  code: string;
  expiresAt: number;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userMode, setUserModeState] = useState<UserMode>("poster");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [storedOTPs, setStoredOTPs] = useState<StoredOTP[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [helperWaiverAccepted, setHelperWaiverAccepted] = useState(false);
  
  const isHelperMode = userMode === "helper";
  const [tasksNeedingPriceAdjustment, setTasksNeedingPriceAdjustment] = useState<Task[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, tasksData, offersData, threadsData, msgsData, ticketsData, modeData, otpData, bannerData, waiverData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(STORAGE_KEYS.JOB_OFFERS),
        AsyncStorage.getItem(STORAGE_KEYS.CHAT_THREADS),
        AsyncStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES),
        AsyncStorage.getItem(STORAGE_KEYS.SUPPORT_TICKETS),
        AsyncStorage.getItem(STORAGE_KEYS.USER_MODE),
        AsyncStorage.getItem(STORAGE_KEYS.OTP_CODES),
        AsyncStorage.getItem(STORAGE_KEYS.BANNER_DISMISSED),
        AsyncStorage.getItem(STORAGE_KEYS.HELPER_WAIVER_ACCEPTED),
      ]);

      if (userData) setUser(JSON.parse(userData));
      if (tasksData) setTasks(JSON.parse(tasksData));
      if (offersData) setJobOffers(JSON.parse(offersData));
      if (threadsData) setChatThreads(JSON.parse(threadsData));
      if (msgsData) setChatMessages(JSON.parse(msgsData));
      if (ticketsData) setSupportTickets(JSON.parse(ticketsData));
      if (modeData) setUserModeState(JSON.parse(modeData) as UserMode);
      if (otpData) setStoredOTPs(JSON.parse(otpData));
      if (bannerData) setBannerDismissed(JSON.parse(bannerData));
      if (waiverData) setHelperWaiverAccepted(JSON.parse(waiverData));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: User | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const saveOTPs = async (otps: StoredOTP[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OTP_CODES, JSON.stringify(otps));
    } catch (error) {
      console.error("Error saving OTPs:", error);
    }
  };

  const saveTasks = async (tasksData: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasksData));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  const saveJobOffers = async (offersData: JobOffer[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.JOB_OFFERS, JSON.stringify(offersData));
    } catch (error) {
      console.error("Error saving job offers:", error);
    }
  };

  const saveChatThreads = async (threadsData: ChatThread[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHAT_THREADS, JSON.stringify(threadsData));
    } catch (error) {
      console.error("Error saving chat threads:", error);
    }
  };

  const saveChatMessages = async (msgsData: Record<string, ChatMessage[]>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(msgsData));
    } catch (error) {
      console.error("Error saving chat messages:", error);
    }
  };

  const saveSupportTickets = async (ticketsData: SupportTicket[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(ticketsData));
    } catch (error) {
      console.error("Error saving support tickets:", error);
    }
  };

  const saveUserMode = async (mode: UserMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_MODE, JSON.stringify(mode));
    } catch (error) {
      console.error("Error saving user mode:", error);
    }
  };

  const sendOTPCode = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const API_URL = API_BASE_URL;
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.error || "Failed to send code" };
      }
      
      return { success: true, message: `Code sent to ${email}` };
    } catch (error) {
      console.error("sendOTPCode error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const verifyOTPCode = async (email: string, code: string): Promise<{ success: boolean; user?: User; message: string }> => {
    try {
      const API_URL = API_BASE_URL;
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.error || "Invalid or expired code" };
      }
      
      const data = await response.json();
      const newUser: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        phone: data.user.phone,
        defaultZipCode: data.user.defaultZipCode,
        accountNumber: data.user.id,
        createdAt: new Date().toISOString(),
      };
      
      setUser(newUser);
      await saveUser(newUser);
      
      return { success: true, user: newUser, message: "Logged in" };
    } catch (error) {
      console.error("verifyOTPCode error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const updateUserProfile = async (phone?: string, defaultZipCode?: string) => {
    if (!user) throw new Error("User not logged in");
    
    try {
      const API_URL = API_BASE_URL;
      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ name: user.name, phone, defaultZipCode }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      
      const data = await response.json();
      const updatedUser = { ...user, phone: data.phone, defaultZipCode: data.defaultZipCode };
      setUser(updatedUser);
      await saveUser(updatedUser);
    } catch (error) {
      console.error("updateUserProfile error:", error);
      throw error;
    }
  };

  const login = async (name: string, email: string, phone?: string, defaultZipCode?: string) => {
    const newUser: User = {
      id: generateId(),
      email,
      name,
      phone,
      defaultZipCode,
      accountNumber: generateId(),
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    await saveUser(newUser);
  };

  const updateProfilePhoto = async (photoUrl: string) => {
    if (!user) throw new Error("User not logged in");
    
    try {
      const API_URL = API_BASE_URL;
      const response = await fetch(`${API_URL}/api/users/${user.id}/photo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ profilePhotoUrl: photoUrl }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile photo");
      }
      
      const data = await response.json();
      const updatedUser = { ...user, profilePhotoUrl: data.profilePhotoUrl };
      setUser(updatedUser);
      await saveUser(updatedUser);
    } catch (error) {
      console.error("updateProfilePhoto error:", error);
      throw error;
    }
  };

  const hasProfilePhoto = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const API_URL = API_BASE_URL;
      const response = await fetch(`${API_URL}/api/users/${user.id}/has-photo`);
      
      if (!response.ok) {
        return !!user.profilePhotoUrl;
      }
      
      const data = await response.json();
      return data.hasPhoto;
    } catch (error) {
      console.error("hasProfilePhoto error:", error);
      return !!user.profilePhotoUrl;
    }
  };

  const logout = async () => {
    setUser(null);
    await saveUser(null);
  };

  const setUserMode = async (mode: UserMode) => {
    setUserModeState(mode);
    await saveUserMode(mode);
  };

  const createTask = async (taskData: Omit<Task, "id" | "posterId" | "posterName" | "createdAt" | "confirmationCode" | "status">): Promise<Task> => {
    if (!user) throw new Error("User not logged in");
    
    try {
      const API_URL = API_BASE_URL;
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create task");
      }

      const task = await response.json();
      const updatedTasks = [task, ...tasks];
      setTasks(updatedTasks);
      await saveTasks(updatedTasks);
      return task;
    } catch (err) {
      console.error("createTask error:", err);
      throw err;
    }
  };

  const sendOffer = async (taskId: string, note: string, proposedPrice?: number) => {
    if (!user) throw new Error("User not logged in");
    
    try {
      const API_URL = API_BASE_URL;
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ note, proposedPrice }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send offer");
      }

      const offer = await response.json();
      const updatedOffers = [...jobOffers, offer];
      setJobOffers(updatedOffers);
      await saveJobOffers(updatedOffers);
    } catch (err) {
      console.error("sendOffer error:", err);
      throw err;
    }
  };

  const chooseHelper = async (taskId: string, offerId: string): Promise<{ checkoutUrl?: string }> => {
    if (!user) throw new Error("User not logged in");

    const offer = jobOffers.find(o => o.id === offerId);
    if (!offer) throw new Error("Offer not found");

    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error("Task not found");

    try {
      const API_URL = API_BASE_URL;
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/choose-helper`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ helperId: offer.helperId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to choose helper");
      }

      const result = await response.json();
      return { checkoutUrl: result.checkoutUrl };
    } catch (err) {
      console.error("chooseHelper error:", err);
      throw err;
    }
  };

  const initializeStripeConnect = async (): Promise<{ url?: string }> => {
    if (!user) throw new Error("User not logged in");
    try {
      const API_URL = API_BASE_URL;
      const response = await fetch(`${API_URL}/api/stripe/connect/onboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to initialize Stripe");
      }

      return await response.json();
    } catch (err) {
      console.error("initializeStripeConnect error:", err);
      throw err;
    }
  };

  const completeTask = async (taskId: string) => {
    if (!user) throw new Error("User not logged in");
    
    try {
      const API_URL = API_BASE_URL;
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete task");
      }
      
      const updatedTask = await response.json();
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, status: "completed" as TaskStatus, completedAt: updatedTask.completed_at } : task
      );
      setTasks(updatedTasks);
      await saveTasks(updatedTasks);
    } catch (error) {
      console.error("completeTask error:", error);
      throw error;
    }
  };

  const cancelTask = async (taskId: string, canceledBy: "poster" | "helper") => {
    if (!user) throw new Error("User not logged in");
    
    try {
      const API_URL = API_BASE_URL;
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ canceledBy }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel task");
      }

      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, status: "canceled" as TaskStatus, canceledAt: new Date().toISOString(), canceledBy } : task
      );
      setTasks(updatedTasks);
      await saveTasks(updatedTasks);
    } catch (err) {
      console.error("cancelTask error:", err);
      throw err;
    }
  };

  const disputeTask = async (taskId: string) => {
    if (!user) throw new Error("User not logged in");
    
    try {
      const API_URL = API_BASE_URL;
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/dispute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to dispute task");
      }
      
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, status: "disputed" as TaskStatus } : task
      );
      setTasks(updatedTasks);
      await saveTasks(updatedTasks);
    } catch (error) {
      console.error("disputeTask error:", error);
      throw error;
    }
  };

  const sendChatMessage = async (threadId: string, text?: string, imageUrl?: string, isProof: boolean = false) => {
    if (!user) throw new Error("User not logged in");

    const newMessage: ChatMessage = {
      id: generateId(),
      threadId,
      senderId: user.id,
      senderName: user.name || "User",
      text,
      imageUrl,
      isProof,
      createdAt: new Date().toISOString(),
    };

    const threadMessages = chatMessages[threadId] || [];
    const updatedMessages = { ...chatMessages, [threadId]: [...threadMessages, newMessage] };
    setChatMessages(updatedMessages);
    await saveChatMessages(updatedMessages);
  };

  const createChatThread = async (taskId: string, posterId: string, helperId: string): Promise<ChatThread> => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    const newThread: ChatThread = {
      id: generateId(),
      taskId,
      posterId,
      helperId,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      isClosed: false,
    };

    const updatedThreads = [...chatThreads, newThread];
    setChatThreads(updatedThreads);
    await saveChatThreads(updatedThreads);
    return newThread;
  };

  const createSupportTicket = async (category: SupportTicketCategory, subject: string, message: string, taskId?: string, photoUrls?: string[]) => {
    if (!user) throw new Error("User not logged in");

    const newTicket: SupportTicket = {
      id: generateId(),
      userId: user.id,
      taskId,
      category,
      subject,
      message,
      photoUrls,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTickets = [...supportTickets, newTicket];
    setSupportTickets(updatedTickets);
    await saveSupportTickets(updatedTickets);
  };

  const syncWithSupabase = async () => {
    // TODO: Implement Supabase sync for new data model
  };

  const adjustTaskPrice = async (taskId: string, newPrice: number): Promise<Task> => {
    if (!user) throw new Error("User not logged in");
    
    try {
      const API_URL = API_BASE_URL;
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/price`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ newPrice }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to adjust price");
      }
      
      const data = await response.json();
      const updatedTask = data.task;
      
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, price: updatedTask.price, priceAdjustedAt: updatedTask.price_adjusted_at } : task
      );
      setTasks(updatedTasks);
      await saveTasks(updatedTasks);
      
      setTasksNeedingPriceAdjustment(prev => prev.filter(t => t.id !== taskId));
      
      return updatedTask;
    } catch (error) {
      console.error("adjustTaskPrice error:", error);
      throw error;
    }
  };

  const acknowledgePricePrompt = async (taskId: string): Promise<void> => {
    if (!user) throw new Error("User not logged in");
    
    try {
      const API_URL = API_BASE_URL;
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/price-adjustment/acknowledge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to acknowledge prompt");
      }
      
      setTasksNeedingPriceAdjustment(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("acknowledgePricePrompt error:", error);
      throw error;
    }
  };

  const fetchTasksNeedingPriceAdjustment = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const API_URL = API_BASE_URL;
      const response = await fetch(`${API_URL}/api/tasks/needing-price-adjustment`, {
        headers: {
          "x-user-id": user.id,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const tasksFromApi = data.tasks || [];
        const mappedTasks: Task[] = tasksFromApi.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          category: t.category,
          zipCode: t.zip_code,
          areaDescription: t.area_description,
          fullAddress: t.full_address,
          price: parseFloat(t.price),
          status: t.status,
          posterId: t.poster_id,
          posterName: t.poster_name || "",
          helperId: t.helper_id,
          helperName: t.helper_name,
          createdAt: t.created_at,
          photosRequired: t.photos_required,
          toolsRequired: t.tools_required,
          toolsProvided: t.tools_provided,
          priceAdjustPromptShown: t.price_adjust_prompt_shown,
          priceAdjustedAt: t.price_adjusted_at,
        }));
        setTasksNeedingPriceAdjustment(mappedTasks);
      } else {
        console.warn("fetchTasksNeedingPriceAdjustment: Non-OK response", response.status);
      }
    } catch (error) {
      console.error("fetchTasksNeedingPriceAdjustment error:", error);
    }
  };

  // Phone verification methods
  const updatePhone = async (phone: string) => {
    if (!user) throw new Error("User not logged in");
    const updatedUser = { ...user, phone, isPhoneVerified: false };
    setUser(updatedUser);
    await saveUser(updatedUser);
  };

  const verifyPhone = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: "User not logged in" };
    
    // Mock verification - in production this would hit an SMS API
    if (code === "123456") {
      const updatedUser = { ...user, isPhoneVerified: true };
      setUser(updatedUser);
      await saveUser(updatedUser);
      return { success: true, message: "Phone verified successfully" };
    }
    return { success: false, message: "Invalid verification code" };
  };

  // License methods
  const addLicense = async (licenseData: Omit<License, "id" | "createdAt">) => {
    if (!user) throw new Error("User not logged in");
    
    const newLicense: License = {
      ...licenseData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedLicenses = [...(user.licenses || []), newLicense];
    const updatedUser = { ...user, licenses: updatedLicenses };
    setUser(updatedUser);
    await saveUser(updatedUser);
  };

  const removeLicense = async (licenseId: string) => {
    if (!user) throw new Error("User not logged in");
    
    const updatedLicenses = (user.licenses || []).filter(l => l.id !== licenseId);
    const updatedUser = { ...user, licenses: updatedLicenses };
    setUser(updatedUser);
    await saveUser(updatedUser);
  };

  // Banner and waiver methods
  const dismissBanner = async () => {
    setBannerDismissed(true);
    await AsyncStorage.setItem(STORAGE_KEYS.BANNER_DISMISSED, JSON.stringify(true));
  };

  const acceptHelperWaiver = async () => {
    setHelperWaiverAccepted(true);
    await AsyncStorage.setItem(STORAGE_KEYS.HELPER_WAIVER_ACCEPTED, JSON.stringify(true));
  };

  // Job stacking helpers
  const getMaxActiveJobs = (): number => {
    if (!user) return 2;
    return getMaxActiveJobsForUser(user.completedJobsCount || 0);
  };

  const getActiveJobsCount = (): number => {
    if (!user) return 0;
    const activeStatuses: TaskStatus[] = ["assigned", "in_progress", "worker_marked_done"];
    return tasks.filter(t => t.helperId === user.id && activeStatuses.includes(t.status)).length;
  };

  const canAcceptMoreJobs = (): boolean => {
    return getActiveJobsCount() < getMaxActiveJobs();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        userMode,
        isHelperMode,
        tasks,
        jobOffers,
        chatThreads,
        chatMessages,
        supportTickets,
        apiUrl: API_BASE_URL,
        tasksNeedingPriceAdjustment,
        bannerDismissed,
        helperWaiverAccepted,
        sendOTPCode,
        verifyOTPCode,
        updateUserProfile,
        updateProfilePhoto,
        hasProfilePhoto,
        logout,
        setUserMode,
        updatePhone,
        verifyPhone,
        addLicense,
        removeLicense,
        dismissBanner,
        acceptHelperWaiver,
        getMaxActiveJobs,
        getActiveJobsCount,
        canAcceptMoreJobs,
        createTask,
        sendOffer,
        chooseHelper,
        initializeStripeConnect,
        completeTask,
        cancelTask,
        disputeTask,
        sendChatMessage,
        createChatThread,
        createSupportTicket,
        syncWithSupabase,
        adjustTaskPrice,
        acknowledgePricePrompt,
        fetchTasksNeedingPriceAdjustment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
