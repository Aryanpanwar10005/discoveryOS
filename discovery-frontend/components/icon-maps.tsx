import {
  FolderKanban,
  Sparkles,
  Layers3,
  Target,
  Gauge,
  ShoppingCart,
  UserCheck,
  Truck,
  CreditCard,
  RotateCcw,
  Lightbulb,
  MessageSquareWarning,
  MessageSquarePlus,
  MessageSquareHeart,
  HelpCircle,
  Database,
  Brain,
  Boxes,
  ListOrdered,
  FileText,
  type LucideIcon,
} from "lucide-react";

export const statIconMap: Record<string, { icon: LucideIcon; bg: string; fg: string }> = {
  research: { icon: FolderKanban, bg: "bg-brand-100", fg: "text-brand-600" },
  insights: { icon: Sparkles, bg: "bg-info-50", fg: "text-info-600" },
  themes: { icon: Layers3, bg: "bg-success-50", fg: "text-success-600" },
  opportunities: { icon: Target, bg: "bg-warning-50", fg: "text-warning-600" },
  confidence: { icon: Gauge, bg: "bg-brand-100", fg: "text-brand-600" },
};

export const opportunityIconMap: Record<string, { icon: LucideIcon; bg: string; fg: string }> = {
  checkout: { icon: ShoppingCart, bg: "bg-info-50", fg: "text-info-600" },
  guest: { icon: UserCheck, bg: "bg-danger-50", fg: "text-danger-600" },
  delivery: { icon: Truck, bg: "bg-warning-50", fg: "text-warning-600" },
  payment: { icon: CreditCard, bg: "bg-success-50", fg: "text-success-600" },
  returns: { icon: RotateCcw, bg: "bg-brand-100", fg: "text-brand-600" },
  generic: { icon: Lightbulb, bg: "bg-ink-100", fg: "text-ink-600" },
};

export const insightTypeIconMap: Record<string, { icon: LucideIcon; bg: string; fg: string; label: string }> = {
  pain_point: { icon: MessageSquareWarning, bg: "bg-danger-50", fg: "text-danger-500", label: "Pain Point" },
  feature_request: { icon: MessageSquarePlus, bg: "bg-info-50", fg: "text-info-600", label: "Feature Request" },
  praise: { icon: MessageSquareHeart, bg: "bg-success-50", fg: "text-success-600", label: "Praise" },
  question: { icon: HelpCircle, bg: "bg-brand-100", fg: "text-brand-600", label: "Question" },
};

export const agentIconMap: Record<string, LucideIcon> = {
  ingestion: Database,
  insight: Brain,
  theme: Boxes,
  prioritization: ListOrdered,
  report: FileText,
};
