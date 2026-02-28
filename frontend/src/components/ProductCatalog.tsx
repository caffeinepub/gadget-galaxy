import { useState, useMemo } from 'react';
import { ShoppingCart, Star, Search, X, SlidersHorizontal } from 'lucide-react';
import { CartItem } from '../App';

export type ProductCategory =
  | 'Audio'
  | 'Wearables'
  | 'Accessories'
  | 'Smart Home'
  | 'Gaming'
  | 'Tablets'
  | 'Cameras'
  | 'Laptops'
  | 'Phones'
  | 'Networking';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
  description: string;
  category: ProductCategory;
}

export const PRODUCTS: Product[] = [
  // ── Audio ──────────────────────────────────────────────────────────────────
  {
    id: 1,
    name: 'SoundWave Pro X Wireless Headphones',
    price: 349.99,
    image: '/assets/generated/speaker-product.dim_400x400.png',
    rating: 4.8,
    reviews: 3241,
    badge: 'Best Seller',
    description: 'Over-ear ANC headphones with 40-hour battery, Hi-Res Audio certification, and plush memory-foam earcups.',
    category: 'Audio',
  },
  {
    id: 2,
    name: 'BassCore True Wireless Earbuds',
    price: 129.99,
    image: '/assets/generated/earbuds-hero.dim_800x600.png',
    rating: 4.6,
    reviews: 5812,
    badge: 'New',
    description: 'IPX5-rated earbuds with 8mm dynamic drivers, 32-hour total playtime, and multipoint Bluetooth 5.3.',
    category: 'Audio',
  },
  {
    id: 3,
    name: 'AuraSound 360 Portable Speaker',
    price: 199.99,
    image: '/assets/generated/speaker-product.dim_400x400.png',
    rating: 4.7,
    reviews: 2108,
    description: '360° omnidirectional sound, IP67 waterproof, 24-hour battery, and built-in power bank for charging devices.',
    category: 'Audio',
  },
  {
    id: 4,
    name: 'StudioMix USB-C DAC Amplifier',
    price: 89.99,
    image: '/assets/generated/speaker-product.dim_400x400.png',
    rating: 4.5,
    reviews: 987,
    description: 'Compact desktop DAC/amp with 32-bit/384kHz support, balanced 4.4mm output, and zero-latency monitoring.',
    category: 'Audio',
  },
  {
    id: 5,
    name: 'NeckBand Pro Sport Earphones',
    price: 59.99,
    image: '/assets/generated/earbuds-hero.dim_800x600.png',
    rating: 4.3,
    reviews: 1456,
    description: 'Magnetic neckband design with aptX HD codec, 12-hour battery, and sweat-resistant IPX4 rating for workouts.',
    category: 'Audio',
  },

  // ── Wearables ──────────────────────────────────────────────────────────────
  {
    id: 6,
    name: 'Apex Ultra Smartwatch Series 5',
    price: 449.99,
    image: '/assets/generated/smartwatch-hero.dim_800x600.png',
    rating: 4.9,
    reviews: 7823,
    badge: 'Top Rated',
    description: 'Always-on AMOLED display, ECG & blood-oxygen monitoring, 18-day battery, and built-in GPS with offline maps.',
    category: 'Wearables',
  },
  {
    id: 7,
    name: 'FitBand Slim Health Tracker',
    price: 79.99,
    image: '/assets/generated/smartwatch-hero.dim_800x600.png',
    rating: 4.4,
    reviews: 4321,
    description: 'Ultra-thin fitness band with 24/7 heart rate, sleep scoring, stress tracking, and 14-day battery life.',
    category: 'Wearables',
  },
  {
    id: 8,
    name: 'VisionAR Smart Glasses Lite',
    price: 299.99,
    image: '/assets/generated/smartwatch-hero.dim_800x600.png',
    rating: 4.2,
    reviews: 892,
    badge: 'New',
    description: 'Open-ear audio glasses with micro-LED HUD, UV400 lenses, voice assistant, and 8-hour battery.',
    category: 'Wearables',
  },
  {
    id: 9,
    name: 'RunPulse GPS Sports Watch',
    price: 249.99,
    image: '/assets/generated/smartwatch-hero.dim_800x600.png',
    rating: 4.7,
    reviews: 3102,
    description: 'Dedicated running watch with multi-band GPS, VO2 max estimation, recovery advisor, and 30-day battery.',
    category: 'Wearables',
  },
  {
    id: 10,
    name: 'SmartRing Health Monitor',
    price: 349.99,
    image: '/assets/generated/smartwatch-hero.dim_800x600.png',
    rating: 4.5,
    reviews: 1678,
    badge: 'Trending',
    description: 'Titanium smart ring tracking sleep stages, HRV, body temperature, and activity with 7-day battery.',
    category: 'Wearables',
  },

  // ── Accessories ────────────────────────────────────────────────────────────
  {
    id: 11,
    name: 'MagCharge 3-in-1 Wireless Charging Station',
    price: 89.99,
    image: '/assets/generated/charger-hero.dim_800x600.png',
    rating: 4.6,
    reviews: 2987,
    badge: 'Best Seller',
    description: 'Simultaneously charge phone, watch, and earbuds with 15W fast wireless charging and foldable design.',
    category: 'Accessories',
  },
  {
    id: 12,
    name: 'ProStand Adjustable Laptop Stand',
    price: 49.99,
    image: '/assets/generated/laptop-stand-product.dim_400x400.png',
    rating: 4.7,
    reviews: 5643,
    description: 'Aluminum ergonomic laptop stand with 6 height levels, foldable design, and universal compatibility up to 17".',
    category: 'Accessories',
  },
  {
    id: 13,
    name: 'MechType Pro Wireless Keyboard',
    price: 149.99,
    image: '/assets/generated/keyboard-product.dim_400x400.png',
    rating: 4.8,
    reviews: 4102,
    badge: 'Editor\'s Choice',
    description: 'Compact TKL mechanical keyboard with hot-swap switches, per-key RGB, Bluetooth 5.0 + USB-C, and 6000mAh battery.',
    category: 'Accessories',
  },
  {
    id: 14,
    name: 'PrecisionGlide Ergonomic Mouse',
    price: 79.99,
    image: '/assets/generated/gaming-mouse-product.dim_400x400.png',
    rating: 4.5,
    reviews: 3218,
    description: 'Vertical ergonomic mouse with 4000 DPI optical sensor, 6 programmable buttons, and silent click switches.',
    category: 'Accessories',
  },
  {
    id: 15,
    name: 'NanoHub USB-C 12-in-1 Dock',
    price: 119.99,
    image: '/assets/generated/charger-hero.dim_800x600.png',
    rating: 4.6,
    reviews: 1876,
    description: 'Thunderbolt 4 hub with dual 4K HDMI, 100W PD, 10Gbps USB-A/C ports, SD card reader, and Ethernet.',
    category: 'Accessories',
  },
  {
    id: 16,
    name: 'LumiDesk LED Desk Lamp Pro',
    price: 69.99,
    image: '/assets/generated/desk-lamp-product.dim_400x400.png',
    rating: 4.4,
    reviews: 2341,
    description: 'Architect-style LED lamp with 5 color temperatures, wireless charging base, USB-A port, and touch dimmer.',
    category: 'Accessories',
  },
  {
    id: 17,
    name: 'CableFlow Magnetic Cable Organizer Kit',
    price: 24.99,
    image: '/assets/generated/charger-hero.dim_800x600.png',
    rating: 4.3,
    reviews: 6712,
    description: '20-piece magnetic cable management set with adhesive clips, velcro ties, and desk cable tray for a clean workspace.',
    category: 'Accessories',
  },
  {
    id: 18,
    name: 'PowerVault 26800mAh Power Bank',
    price: 64.99,
    image: '/assets/generated/charger-hero.dim_800x600.png',
    rating: 4.7,
    reviews: 4521,
    badge: 'Popular',
    description: '26800mAh power bank with 65W USB-C PD, dual USB-A 18W QC, and simultaneous 3-device charging.',
    category: 'Accessories',
  },

  // ── Smart Home ─────────────────────────────────────────────────────────────
  {
    id: 19,
    name: 'HomeHub AI Smart Display 10"',
    price: 229.99,
    image: '/assets/generated/smarthome-product.dim_400x400.png',
    rating: 4.6,
    reviews: 3102,
    badge: 'New',
    description: '10" touchscreen smart home hub with built-in AI assistant, Matter/Thread support, and video calling.',
    category: 'Smart Home',
  },
  {
    id: 20,
    name: 'LumiSmart Color Bulb Pack (4-pack)',
    price: 49.99,
    image: '/assets/generated/smarthome-product.dim_400x400.png',
    rating: 4.5,
    reviews: 8934,
    description: 'RGBW smart bulbs with 16M colors, 1100 lumens, Zigbee + Wi-Fi dual protocol, and music sync mode.',
    category: 'Smart Home',
  },
  {
    id: 21,
    name: 'GuardCam Pro 4K Outdoor Camera',
    price: 149.99,
    image: '/assets/generated/smarthome-product.dim_400x400.png',
    rating: 4.7,
    reviews: 2876,
    description: '4K HDR outdoor security camera with color night vision, AI person/vehicle detection, and local NVR storage.',
    category: 'Smart Home',
  },
  {
    id: 22,
    name: 'ThermoSmart AI Thermostat',
    price: 179.99,
    image: '/assets/generated/smarthome-product.dim_400x400.png',
    rating: 4.8,
    reviews: 5421,
    badge: 'Best Seller',
    description: 'Learning thermostat with occupancy sensing, energy reports, geofencing, and compatibility with 95% of HVAC systems.',
    category: 'Smart Home',
  },
  {
    id: 23,
    name: 'DoorSense Smart Lock Pro',
    price: 199.99,
    image: '/assets/generated/smarthome-product.dim_400x400.png',
    rating: 4.5,
    reviews: 1987,
    description: 'Fingerprint + PIN + app smart lock with auto-lock, access logs, guest codes, and Matter compatibility.',
    category: 'Smart Home',
  },
  {
    id: 24,
    name: 'AirPure Smart Air Purifier',
    price: 259.99,
    image: '/assets/generated/smarthome-product.dim_400x400.png',
    rating: 4.6,
    reviews: 1432,
    description: 'HEPA H13 + activated carbon purifier covering 500 sq ft with real-time AQI display and auto mode.',
    category: 'Smart Home',
  },

  // ── Gaming ─────────────────────────────────────────────────────────────────
  {
    id: 25,
    name: 'HyperClick Pro Gaming Mouse',
    price: 89.99,
    image: '/assets/generated/gaming-mouse-product.dim_400x400.png',
    rating: 4.9,
    reviews: 9821,
    badge: 'Top Rated',
    description: '26000 DPI optical sensor, 90-hour wireless battery, 5 programmable buttons, and ultra-lightweight 61g design.',
    category: 'Gaming',
  },
  {
    id: 26,
    name: 'TactilePro 60% Gaming Keyboard',
    price: 129.99,
    image: '/assets/generated/keyboard-product.dim_400x400.png',
    rating: 4.7,
    reviews: 4312,
    description: 'Compact 60% layout with optical switches (0.2ms actuation), per-key RGB, and aircraft-grade aluminum frame.',
    category: 'Gaming',
  },
  {
    id: 27,
    name: 'ImmersaSound 7.1 Gaming Headset',
    price: 119.99,
    image: '/assets/generated/speaker-product.dim_400x400.png',
    rating: 4.6,
    reviews: 6234,
    description: 'Virtual 7.1 surround sound headset with 50mm drivers, detachable noise-cancelling mic, and RGB earcups.',
    category: 'Gaming',
  },
  {
    id: 28,
    name: 'ControlMax Pro Wireless Gamepad',
    price: 69.99,
    image: '/assets/generated/gaming-mouse-product.dim_400x400.png',
    rating: 4.5,
    reviews: 3876,
    badge: 'New',
    description: 'Hall-effect thumbsticks, adaptive triggers, 40-hour battery, and cross-platform support for PC, mobile, and cloud gaming.',
    category: 'Gaming',
  },
  {
    id: 29,
    name: 'StreamDeck XL Macro Controller',
    price: 199.99,
    image: '/assets/generated/keyboard-product.dim_400x400.png',
    rating: 4.8,
    reviews: 2987,
    description: '32 customizable LCD keys for streaming, editing, and productivity with drag-and-drop profile builder.',
    category: 'Gaming',
  },
  {
    id: 30,
    name: 'GlowPad XXL Extended Mouse Pad',
    price: 39.99,
    image: '/assets/generated/gaming-mouse-product.dim_400x400.png',
    rating: 4.6,
    reviews: 7123,
    description: '900×400mm desk mat with addressable RGB edge lighting, stitched edges, and non-slip rubber base.',
    category: 'Gaming',
  },

  // ── Tablets ────────────────────────────────────────────────────────────────
  {
    id: 31,
    name: 'SlateX Pro 12.9" Tablet',
    price: 799.99,
    image: '/assets/generated/laptop-stand-product.dim_400x400.png',
    rating: 4.8,
    reviews: 4521,
    badge: 'Editor\'s Choice',
    description: 'Mini-LED ProMotion display, octa-core chip, 16GB RAM, USB4 port, and optional 5G connectivity.',
    category: 'Tablets',
  },
  {
    id: 32,
    name: 'DrawPad Artist 11" Tablet',
    price: 549.99,
    image: '/assets/generated/laptop-stand-product.dim_400x400.png',
    rating: 4.7,
    reviews: 2134,
    description: 'OLED display tablet with 8192-level stylus pressure, 120Hz refresh, and 12-hour battery for creative professionals.',
    category: 'Tablets',
  },
  {
    id: 33,
    name: 'KidSafe Tab 8" Learning Tablet',
    price: 149.99,
    image: '/assets/generated/laptop-stand-product.dim_400x400.png',
    rating: 4.4,
    reviews: 3876,
    description: 'Rugged kids tablet with shockproof case, parental controls, 50+ educational apps, and 10-hour battery.',
    category: 'Tablets',
  },

  // ── Cameras ────────────────────────────────────────────────────────────────
  {
    id: 34,
    name: 'PixelMaster 4K Action Camera',
    price: 299.99,
    image: '/assets/generated/smarthome-product.dim_400x400.png',
    rating: 4.7,
    reviews: 5432,
    badge: 'Best Seller',
    description: '4K/120fps action camera with 6-axis HorizonSteady stabilization, 10m waterproof, and 2" touch screen.',
    category: 'Cameras',
  },
  {
    id: 35,
    name: 'LensCraft Mirrorless Camera Kit',
    price: 1299.99,
    image: '/assets/generated/smarthome-product.dim_400x400.png',
    rating: 4.9,
    reviews: 1876,
    badge: 'Pro Pick',
    description: '26MP APS-C sensor, in-body 5-axis stabilization, 4K/60fps video, and kit 18-55mm f/3.5-5.6 lens.',
    category: 'Cameras',
  },
  {
    id: 36,
    name: 'SkyDrone Mini 4K Foldable',
    price: 499.99,
    image: '/assets/generated/smarthome-product.dim_400x400.png',
    rating: 4.6,
    reviews: 2341,
    badge: 'New',
    description: '4K/30fps drone with 3-axis gimbal, 34-min flight time, obstacle avoidance, and 10km transmission range.',
    category: 'Cameras',
  },
  {
    id: 37,
    name: 'InstaPrint Pocket Photo Printer',
    price: 89.99,
    image: '/assets/generated/smarthome-product.dim_400x400.png',
    rating: 4.5,
    reviews: 4123,
    description: 'Bluetooth pocket printer producing 2×3" ZINK sticky-back photos in 30 seconds with 10-year fade resistance.',
    category: 'Cameras',
  },

  // ── Laptops ────────────────────────────────────────────────────────────────
  {
    id: 38,
    name: 'UltraBook Air 14" Laptop',
    price: 1099.99,
    image: '/assets/generated/laptop-stand-product.dim_400x400.png',
    rating: 4.8,
    reviews: 6234,
    badge: 'Best Seller',
    description: '14" 2.8K OLED display, 12-core processor, 16GB LPDDR5, 512GB NVMe SSD, and 18-hour battery life.',
    category: 'Laptops',
  },
  {
    id: 39,
    name: 'PowerStation 16" Creator Laptop',
    price: 1799.99,
    image: '/assets/generated/laptop-stand-product.dim_400x400.png',
    rating: 4.7,
    reviews: 2987,
    badge: 'Pro Pick',
    description: '16" Mini-LED 240Hz display, RTX 4070 GPU, 32GB DDR5, 1TB SSD, and Thunderbolt 4 with MUX switch.',
    category: 'Laptops',
  },
  {
    id: 40,
    name: 'ChronoBook 2-in-1 Convertible',
    price: 849.99,
    image: '/assets/generated/laptop-stand-product.dim_400x400.png',
    rating: 4.5,
    reviews: 3421,
    description: '13.5" 3:2 touchscreen convertible with 360° hinge, stylus support, 12-core CPU, and 20-hour battery.',
    category: 'Laptops',
  },
  {
    id: 41,
    name: 'BudgetPro 15.6" Student Laptop',
    price: 499.99,
    image: '/assets/generated/laptop-stand-product.dim_400x400.png',
    rating: 4.3,
    reviews: 8712,
    description: 'Full HD IPS display, 8-core processor, 8GB RAM, 256GB SSD, and backlit keyboard for everyday computing.',
    category: 'Laptops',
  },

  // ── Phones ─────────────────────────────────────────────────────────────────
  {
    id: 42,
    name: 'NovaPeak X Pro Smartphone',
    price: 1099.99,
    image: '/assets/generated/charger-hero.dim_800x600.png',
    rating: 4.9,
    reviews: 12341,
    badge: 'Top Rated',
    description: '6.7" 120Hz LTPO AMOLED, 200MP periscope camera, Snapdragon 8 Gen 3, 5000mAh with 100W fast charging.',
    category: 'Phones',
  },
  {
    id: 43,
    name: 'MidRange Ace 5G Phone',
    price: 449.99,
    image: '/assets/generated/charger-hero.dim_800x600.png',
    rating: 4.6,
    reviews: 7823,
    badge: 'Best Value',
    description: '6.5" 90Hz AMOLED, 64MP triple camera, 5G connectivity, 5000mAh battery, and 33W fast charging.',
    category: 'Phones',
  },
  {
    id: 44,
    name: 'CompactPro Mini Smartphone',
    price: 699.99,
    image: '/assets/generated/charger-hero.dim_800x600.png',
    rating: 4.7,
    reviews: 4312,
    description: '5.4" Super Retina display in a compact form factor with flagship chip, 48MP camera, and MagSafe charging.',
    category: 'Phones',
  },
  {
    id: 45,
    name: 'Rugged Shield Outdoor Phone',
    price: 549.99,
    image: '/assets/generated/charger-hero.dim_800x600.png',
    rating: 4.5,
    reviews: 2134,
    description: 'MIL-STD-810H certified phone with IP68 rating, thermal camera, 15000mAh battery, and satellite messaging.',
    category: 'Phones',
  },

  // ── Networking ─────────────────────────────────────────────────────────────
  {
    id: 46,
    name: 'MeshWave Pro 6E Tri-Band Router',
    price: 349.99,
    image: '/assets/generated/smarthome-product.dim_400x400.png',
    rating: 4.8,
    reviews: 3421,
    badge: 'Best Seller',
    description: 'Wi-Fi 6E tri-band router with 10Gbps WAN, 4×4 MIMO, 160MHz channels, and covers up to 5000 sq ft.',
    category: 'Networking',
  },
  {
    id: 47,
    name: 'MeshNode Satellite Extender',
    price: 149.99,
    image: '/assets/generated/smarthome-product.dim_400x400.png',
    rating: 4.6,
    reviews: 2187,
    description: 'Wi-Fi 6 mesh node with seamless roaming, wired backhaul support, and easy app-based setup.',
    category: 'Networking',
  },
  {
    id: 48,
    name: 'GigaSwitch 8-Port Managed Switch',
    price: 89.99,
    image: '/assets/generated/smarthome-product.dim_400x400.png',
    rating: 4.5,
    reviews: 1234,
    description: '8-port 2.5GbE managed switch with VLAN, QoS, link aggregation, and fanless silent operation.',
    category: 'Networking',
  },
  {
    id: 49,
    name: 'TravelRouter Pocket Wi-Fi 6',
    price: 79.99,
    image: '/assets/generated/smarthome-product.dim_400x400.png',
    rating: 4.4,
    reviews: 3876,
    badge: 'New',
    description: 'Palm-sized travel router with Wi-Fi 6, VPN client, USB tethering, and 5-minute hotel network setup.',
    category: 'Networking',
  },
  {
    id: 50,
    name: 'SecureNAS 4-Bay Network Storage',
    price: 499.99,
    image: '/assets/generated/smarthome-product.dim_400x400.png',
    rating: 4.7,
    reviews: 987,
    description: '4-bay NAS with 2.5GbE dual LAN, hardware encryption, Docker support, and RAID 0/1/5/6 configurations.',
    category: 'Networking',
  },
  {
    id: 51,
    name: 'PoE+ Outdoor Access Point',
    price: 129.99,
    image: '/assets/generated/smarthome-product.dim_400x400.png',
    rating: 4.6,
    reviews: 1543,
    description: 'IP67 outdoor Wi-Fi 6 access point with PoE+ power, 1200Mbps throughput, and 360° antenna coverage.',
    category: 'Networking',
  },
];

const ALL_CATEGORIES: ProductCategory[] = [
  'Audio',
  'Wearables',
  'Accessories',
  'Smart Home',
  'Gaming',
  'Tablets',
  'Cameras',
  'Laptops',
  'Phones',
  'Networking',
];

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating';

interface ProductCatalogProps {
  onAddToCart: (item: CartItem) => void;
}

export default function ProductCatalog({ onAddToCart }: ProductCatalogProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [sort, setSort] = useState<SortOption>('featured');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return list;
  }, [search, selectedCategory, sort]);

  return (
    <section id="products" className="py-16 bg-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-2">Our Products</h2>
          <p className="text-muted-foreground">Discover our curated selection of premium tech gadgets</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm hover:bg-muted transition-colors sm:w-auto"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Category Filter */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-background rounded-2xl border border-border overflow-hidden flex flex-col hover:shadow-lg transition-shadow group"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-xs text-primary font-medium mb-1">{product.category}</span>
                  <h3 className="font-semibold text-foreground text-sm leading-snug mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                    {product.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-foreground">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews.toLocaleString()})</span>
                  </div>

                  {/* Price + Add to Cart */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg font-bold text-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() =>
                        onAddToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          quantity: 1,
                        })
                      }
                      className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
