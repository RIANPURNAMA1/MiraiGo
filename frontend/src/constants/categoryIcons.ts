import {
  BookOpen,
  FileText,
  Headphones,
  Globe,
  Star,
  Sprout,
  Wheat,
  Flower2,
  Car,
  Bus,
  Home,
  Utensils,
  GraduationCap,
  Landmark,
  Briefcase,
  Wrench,
  Leaf,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CategoryIconOption {
  name: string;
  label: string;
  icon: LucideIcon;
}

export const CATEGORY_ICONS: CategoryIconOption[] = [
  { name: 'book', label: 'Buku', icon: BookOpen },
  { name: 'file', label: 'Dokumen', icon: FileText },
  { name: 'headphones', label: 'Headphone', icon: Headphones },
  { name: 'globe', label: 'Dunia', icon: Globe },
  { name: 'star', label: 'Bintang', icon: Star },
  { name: 'sprout', label: 'Tunas', icon: Sprout },
  { name: 'wheat', label: 'Gandum', icon: Wheat },
  { name: 'flower', label: 'Bunga', icon: Flower2 },
  { name: 'car', label: 'Mobil', icon: Car },
  { name: 'bus', label: 'Bus', icon: Bus },
  { name: 'home', label: 'Rumah', icon: Home },
  { name: 'utensils', label: 'Makanan', icon: Utensils },
  { name: 'graduation', label: 'Sekolah', icon: GraduationCap },
  { name: 'landmark', label: 'Bangunan', icon: Landmark },
  { name: 'briefcase', label: 'Kerja', icon: Briefcase },
  { name: 'wrench', label: 'Alat', icon: Wrench },
  { name: 'leaf', label: 'Daun', icon: Leaf },
];

const iconMap: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICONS.map((o) => [o.name, o.icon]),
);

export function getCategoryIcon(name?: string | null): LucideIcon {
  return iconMap[name ?? ''] ?? BookOpen;
}
