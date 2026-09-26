import {
  Zap, CircuitBoard, Cog, Wrench, Settings, Monitor, Layers, Hammer, Printer, Box,
} from 'lucide-react'
import { T } from './theme'
import MsLogo from '../../assets/ms_wbg_logo.png'
import HomeImage from '../../assets/home.png'

// Brand assets: logo used in every nav bar, home illustration used on hero sections.
export const LOGO_IMAGE = MsLogo
export const BROWSE_LANDING_IMAGE = HomeImage

// Makerspace team contact: shown when a student wants to top up credits in person.
export const TEAM_CONTACT = {
  email: 'Makerspace@cadt.edu.kh',
  telegram: 'https://t.me/ms_cadt',
}

// Only two physical rooms exist at the makerspace: Makerspace Room and
// Mechanic Room. Every category is assigned to whichever one actually
// houses that kind of equipment.
export const CATEGORIES = [
  { id: 'electronic_equipment', label: 'Electronic Equipment', Icon: Zap,           room: 'Makerspace Room', color: T.amberLight,  iconColor: T.amber  },
  { id: 'electronic_component', label: 'Electronic Components', Icon: CircuitBoard,  room: 'Makerspace Room', color: T.blueLight,   iconColor: T.blue   },
  { id: 'cnc_machines',         label: 'CNC Machines',          Icon: Cog,           room: 'Mechanic Room',   color: T.redLight,    iconColor: T.red    },
  { id: 'manual_mechanical',    label: 'Mechanical Tools',       Icon: Wrench,        room: 'Mechanic Room',   color: T.purpleLight, iconColor: T.purple },
  { id: 'mechanical_fasteners', label: 'Fasteners & Hardware',   Icon: Settings,      room: 'Mechanic Room',   color: T.tealLight,   iconColor: T.teal   },
  { id: 'digital_device',       label: 'Digital Devices',        Icon: Monitor,       room: 'Makerspace Room', color: T.greenLight,  iconColor: T.green  },
  { id: 'raw_material',         label: 'Raw Materials',          Icon: Layers,        room: 'Makerspace Room', color: '#F5F0E8',     iconColor: '#8B6914'},
  { id: 'electronic_tool',      label: 'Electronic Tools',       Icon: Hammer,        room: 'Makerspace Room', color: '#F0EBF8',     iconColor: '#7B3FA0'},
]

// Makerspace print services: document printing is charged per page up front;
// 3D printing weight isn't known until the job finishes, so staff weigh the print
// and enter the grams when fulfilling the request (see RequestsManager).
export const PRINT_SERVICES = [
  { id: 'printing',    label: 'Document Printing', Icon: Printer, color: T.blueLight,  iconColor: T.blue,
    rate: 2, unit: 'page', unitLabel: 'credits / page',
    desc: 'Black & white or color document printing at the makerspace front desk.' },
  { id: '3d_printing', label: '3D Printing',       Icon: Box,     color: T.purpleLight, iconColor: T.purple,
    rate: 4, unit: 'gram', unitLabel: 'credits / gram',
    desc: 'Submit your model, staff will print and weigh it. Credits are charged by filament weight used.' },
]

// The one physical printer at the front desk — not an inventory item, just
// a fixed info card for the Document Printing service view.
export const DOCUMENT_PRINTER = { name: 'Epson PX-M730F', type: 'Document Printer', status: 'Available' }

// Per-page rate by paper size × color mode. Not admin-managed data (no
// stock tracked here) — a plain rate table, same idea as PRINT_SERVICES'
// flat rate above, just split out by size/color instead of one flat number.
export const PAPER_PRICING = {
  A4: { label: 'A4', bw: 2, color: 4 },
  A3: { label: 'A3', bw: 4, color: 8 },
}

// Shared membership pricing: referenced by the Home page credits section and the
// staff in-person sale panel (Catalog) so the rate is defined in exactly one place.
export const MEMBERSHIP_PLAN = { price: 20, bonusCredits: 200 }
// Late-return penalty - credits deducted per day past the agreed return date.
// Shown to students before they confirm a borrow, and used to prefill the
// staff "deduct credits" action on overdue loans.
export const OVERDUE_RATE = 5
export const CREDIT_RATE = 40 // credits granted per $1 topped up
export const CREDIT_TIERS = [[40, 1], [200, 5], [400, 10], [1000, 25]]

// Fixed stock-status threshold: applies to every item regardless of its own
// Min Stock field (that field is no longer used for the Low Stock badge).
export const LOW_STOCK_THRESHOLD = 5
export const isLowStock = (stock) => stock > 0 && stock < LOW_STOCK_THRESHOLD
export const isOutOfStock = (stock) => stock <= 0
