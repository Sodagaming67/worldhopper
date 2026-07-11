import {
  Fish, Compass, Palette, Footprints, Waves, Ear, Sunset, TrainFront, Rainbow,
  Map, HeartHandshake, BookHeart, Wrench, Sparkles, Shell, MapPinned, Star,
  TreePalm, Bot, Sparkle, Radio, Lock, Check, ArrowLeft, ArrowUp, ArrowDown, X,
  Volume2, VolumeX, Eye, Settings, BookOpen, Backpack, RotateCcw, Download,
  Upload, PartyPopper, HelpCircle, type LucideIcon,
} from 'lucide-react';

// Explicit registry keyed by the kebab-case names used in game data. Keeps the
// bundle tree-shakeable and avoids lucide alias surprises.
const REGISTRY: Record<string, LucideIcon> = {
  fish: Fish, compass: Compass, palette: Palette, footprints: Footprints,
  waves: Waves, ear: Ear, sunset: Sunset, 'train-front': TrainFront,
  rainbow: Rainbow, map: Map, 'heart-handshake': HeartHandshake,
  'book-heart': BookHeart, wrench: Wrench, sparkles: Sparkles, shell: Shell,
  'map-pinned': MapPinned, star: Star, 'tree-palm': TreePalm, bot: Bot,
  sparkle: Sparkle, radio: Radio, lock: Lock, check: Check,
  'arrow-left': ArrowLeft, 'arrow-up': ArrowUp, 'arrow-down': ArrowDown, x: X,
  'volume-2': Volume2, 'volume-x': VolumeX, eye: Eye, settings: Settings,
  'book-open': BookOpen, backpack: Backpack, 'rotate-ccw': RotateCcw,
  download: Download, upload: Upload, 'party-popper': PartyPopper,
};

type Props = {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
};

export function Icon({ name, size = 24, className, strokeWidth = 2.25, ...rest }: Props) {
  const Cmp = REGISTRY[name] ?? HelpCircle;
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} aria-hidden {...rest} />;
}
