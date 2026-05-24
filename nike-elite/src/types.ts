export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  specs?: string;
  tags?: string[];
  isExclusive?: boolean;
  isNew?: boolean;
}

export interface UnresolvedQuery {
  id: string;
  timeAgo: string;
  query: string;
  confidence: 'Low Confidence' | 'Failed Intent' | 'Needs Context' | 'Healthy';
  category: string;
  suggestedAnswer?: string;
  tags?: string[];
}

export interface RevenueData {
  name: string; // e.g. "Tuần 1", "Tuần 2", "Chi tiết"
  revenue: number; // in Millions of VND
}

export interface AdminStats {
  revenue: number; // in VND
  newOrders: number;
  newMembers: number;
  chatbotResponseRate: number;
}
