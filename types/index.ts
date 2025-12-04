export type UserMode = "poster" | "helper";
export type TaskStatus = "requested" | "unpaid" | "paid_waiting" | "assigned" | "in_progress" | "worker_marked_done" | "completed" | "canceled" | "disputed";

// Final 15 categories for launch
export type TaskCategoryId = 
  | "junk_removal"
  | "moving_help"
  | "cleaning"
  | "handyman"
  | "plumbing"
  | "electrical"
  | "auto_towing"
  | "furniture_assembly"
  | "delivery_errands"
  | "yard_work"
  | "painting"
  | "repairs_general"
  | "tech_computer"
  | "emergency"
  | "other";

export type TaskCategory = TaskCategoryId;

export type SupportTicketStatus = "open" | "in_review" | "closed";
export type SupportTicketCategory = "payment" | "helper_issue" | "poster_issue" | "dispute" | "emergency" | "app_bug" | "other";
export type DisputeStatus = "pending" | "in_review" | "resolved_helper" | "resolved_poster" | "resolved_split";
export type JobOfferStatus = "pending" | "declined" | "accepted";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type ExtraWorkStatus = "pending" | "accepted" | "rejected" | "paid";

export interface License {
  id: string;
  type: string;
  imageUrl: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  isPhoneVerified?: boolean;
  defaultZipCode?: string;
  accountNumber: string;
  stripeAccountId?: string;
  payoutsEnabled?: boolean;
  profilePhotoUrl?: string;
  licenses?: License[];
  completedJobsCount?: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  zipCode: string;
  areaDescription: string | null;
  fullAddress: string | null;
  price: number;
  status: TaskStatus;
  posterId: string;
  posterName: string;
  posterEmail?: string;
  posterPhotoUrl?: string;
  posterPhone?: string;
  posterPhoneVerified?: boolean;
  helperId?: string;
  helperName?: string;
  helperEmail?: string;
  helperPhone?: string;
  helperPhoneVerified?: boolean;
  confirmationCode: string;
  photosRequired: boolean;
  toolsRequired: boolean;
  toolsProvided: boolean;
  licenseRequired: boolean;
  isEmergency?: boolean;
  photos: string[];
  taskPhotoUrl?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  platformFeeAmount?: number;
  helperAmount?: number;
  paymentStatus?: PaymentStatus;
  tipAmount?: number;
  tipStripePaymentIntentId?: string;
  tipCreatedAt?: string;
  extraAmountPaid?: number;
  createdAt: string;
  expiresAt?: string;
  acceptedAt?: string;
  completedAt?: string;
  canceledAt?: string;
  canceledBy?: "poster" | "helper";
  disputeId?: string;
  disputedAt?: string;
  disputedBy?: "poster" | "helper";
  priceAdjustPromptShown?: boolean;
}

export const TASK_EXPIRATION_DAYS = 5;
export const LOW_PAY_THRESHOLD_NORMAL = 20;
export const LOW_PAY_THRESHOLD_EMERGENCY = 120;

export function isTaskExpired(task: Task): boolean {
  if (!task.expiresAt) return false;
  return new Date() > new Date(task.expiresAt);
}

export function getDaysUntilExpiration(task: Task): number {
  if (!task.expiresAt) return TASK_EXPIRATION_DAYS;
  const now = new Date();
  const expires = new Date(task.expiresAt);
  const diffMs = expires.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export interface JobOffer {
  id: string;
  taskId: string;
  helperId: string;
  helperName: string;
  note: string;
  proposedPrice?: number;
  status: JobOfferStatus;
  createdAt: string;
}

export interface ExtraWorkRequest {
  id: string;
  taskId: string;
  helperId: string;
  amount: number;
  reason: string;
  photoUrls?: string[];
  status: ExtraWorkStatus;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  respondedAt?: string;
  paidAt?: string;
}

export interface ChatThread {
  id: string;
  taskId: string;
  posterId: string;
  helperId: string;
  createdAt: string;
  expiresAt: string;
  isClosed: boolean;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  text?: string;
  imageUrl?: string;
  isProof: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  taskId?: string;
  category: SupportTicketCategory;
  subject: string;
  message: string;
  photoUrls?: string[];
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Dispute {
  id: string;
  taskId: string;
  initiatorId: string;
  initiatorRole: "poster" | "helper";
  reason: string;
  posterPhotoUrls: string[];
  helperPhotoUrls: string[];
  status: DisputeStatus;
  resolution?: string;
  amountReleased?: number;
  amountRefunded?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface Conversation {
  id: string;
  taskId: string;
  threadId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatarIndex: number;
  unreadCount: number;
  lastMessageTime: string;
  taskTitle: string;
  lastMessage: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isProof?: boolean;
}

export interface CategoryInfo {
  id: TaskCategoryId;
  label: string;
  icon: string;
  minPrice?: number;
  isEmergency?: boolean;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "junk_removal", label: "Junk Removal", icon: "trash-2" },
  { id: "moving_help", label: "Moving Help", icon: "truck" },
  { id: "cleaning", label: "Cleaning", icon: "home" },
  { id: "handyman", label: "Handyman", icon: "tool" },
  { id: "plumbing", label: "Plumbing", icon: "droplet" },
  { id: "electrical", label: "Electrical", icon: "zap" },
  { id: "auto_towing", label: "Automotive / Towing", icon: "truck" },
  { id: "furniture_assembly", label: "Furniture Assembly", icon: "box" },
  { id: "delivery_errands", label: "Delivery & Errands", icon: "package" },
  { id: "yard_work", label: "Yard Work", icon: "scissors" },
  { id: "painting", label: "Painting", icon: "edit-3" },
  { id: "repairs_general", label: "Repairs", icon: "settings" },
  { id: "tech_computer", label: "Tech / Computer Help", icon: "monitor" },
  { id: "emergency", label: "Emergency (3-Hour)", icon: "alert-circle", minPrice: 100, isEmergency: true },
  { id: "other", label: "Other", icon: "more-horizontal" },
];

export const CATEGORY_MAP: Record<TaskCategoryId, CategoryInfo> = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat;
  return acc;
}, {} as Record<TaskCategoryId, CategoryInfo>);

export function getCategoryLabel(categoryId: TaskCategoryId): string {
  return CATEGORY_MAP[categoryId]?.label || categoryId;
}
export const PLATFORM_FEE_PERCENT = 0.15;
export const MIN_JOB_PRICE = 7;
export const PHONE_VERIFICATION_THRESHOLD = 40;
export const EMERGENCY_MIN_PRICE = 100;

// Job stacking limits based on completed jobs
export const JOB_STACKING_LIMITS = {
  DEFAULT: 2,
  AFTER_20_JOBS: 3,
  AFTER_100_JOBS: 5,
};

export function getMaxActiveJobsForUser(completedJobsCount: number): number {
  if (completedJobsCount >= 100) return JOB_STACKING_LIMITS.AFTER_100_JOBS;
  if (completedJobsCount >= 20) return JOB_STACKING_LIMITS.AFTER_20_JOBS;
  return JOB_STACKING_LIMITS.DEFAULT;
}

export const NEIGHBORHOODS = [
  "Bronx - 170th & Grand Concourse",
  "Bronx - Fordham",
  "Bronx - Hunts Point",
  "Bronx - Mott Haven",
  "Harlem",
  "Washington Heights",
  "Inwood",
  "Lower East Side",
  "East Village",
  "Chelsea",
  "Midtown",
  "Upper West Side",
  "Upper East Side",
  "Brooklyn - Williamsburg",
  "Brooklyn - Bushwick",
  "Brooklyn - Bedford-Stuyvesant",
  "Brooklyn - Crown Heights",
  "Brooklyn - Park Slope",
  "Brooklyn - Downtown Brooklyn",
  "Queens - Astoria",
  "Queens - Long Island City",
  "Queens - Jackson Heights",
  "Queens - Flushing",
  "Queens - Jamaica",
  "Staten Island - St. George",
  "Staten Island - New Dorp",
];

function generateConfirmationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export { generateConfirmationCode, generateOTP };
