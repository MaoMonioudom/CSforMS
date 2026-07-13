import {
  Zap, CircuitBoard, Cog, Wrench, Settings, Monitor, Layers, Hammer, Printer, Box,
} from 'lucide-react'
import { T } from './theme'
import MsLogo from '../../assets/ms_wbg_logo.png'
import HomeImage from '../../assets/home.png'

// Brand assets — logo used in every nav bar, home illustration used on hero sections.
// Items deliberately have no shared photo: reusing one image across every card made
// the catalog grid look like duplicated tiles, so item cards fall back to their
// category icon/color instead (see ItemImage in Catalog.jsx).
export const LOGO_IMAGE = MsLogo
export const BROWSE_LANDING_IMAGE = HomeImage
export const SAMPLE_ITEM_IMAGE = null

// Makerspace team contact — shown when a student wants to top up credits in person.
export const TEAM_CONTACT = {
  email: 'maker@makervault.io',
  telegram: 'https://t.me/cadtmakerspace',
}

export const CATEGORIES = [
  { id: 'electronic_equipment', label: 'Electronic Equipment', Icon: Zap,           room: 'Makerspace Room', color: T.amberLight,  iconColor: T.amber  },
  { id: 'electronic_component', label: 'Electronic Components', Icon: CircuitBoard,  room: 'Makerspace Room', color: T.blueLight,   iconColor: T.blue   },
  { id: 'cnc_machines',         label: 'CNC Machines',          Icon: Cog,           room: 'Fabrication Lab', color: T.redLight,    iconColor: T.red    },
  { id: 'manual_mechanical',    label: 'Mechanical Tools',       Icon: Wrench,        room: 'Mechanic Room',   color: T.purpleLight, iconColor: T.purple },
  { id: 'mechanical_fasteners', label: 'Fasteners & Hardware',   Icon: Settings,      room: 'Mechanic Room',   color: T.tealLight,   iconColor: T.teal   },
  { id: 'digital_device',       label: 'Digital Devices',        Icon: Monitor,       room: 'Digital Lab',     color: T.greenLight,  iconColor: T.green  },
  { id: 'raw_material',         label: 'Raw Materials',          Icon: Layers,        room: 'Storage Room',    color: '#F5F0E8',     iconColor: '#8B6914'},
  { id: 'electronic_tool',      label: 'Electronic Tools',       Icon: Hammer,        room: 'Makerspace Room', color: '#F0EBF8',     iconColor: '#7B3FA0'},
]

export const SAMPLE_ITEMS = [
  { id: 1,  name: 'Arduino UNO R3',         category: 'electronic_component', type: 'Returnable',  credits: 4,  zone: 'A1', room: 'Makerspace Room', status: 'available',    description: 'Microcontroller board based on ATmega328P. Perfect for prototyping projects.', usage: 'Connect via USB-B, power up to 5 boards per session. Return with all jumper wires removed.', stock: 12, minStock: 3,  condition: 'Good',        borrowCount: 45,  image: SAMPLE_ITEM_IMAGE },
  { id: 2,  name: 'ESP32 DevKit',            category: 'electronic_component', type: 'Returnable',  credits: 4,  zone: 'A2', room: 'Makerspace Room', status: 'available',    description: 'WiFi + Bluetooth microcontroller. Ideal for IoT projects.',                   usage: 'Flash via USB-C with Arduino IDE or PlatformIO. Do not exceed 3.3V on GPIO pins.',            stock: 8,  minStock: 2,  condition: 'Good',        borrowCount: 32,  image: SAMPLE_ITEM_IMAGE },
  { id: 3,  name: 'Soldering Iron Station',  category: 'electronic_tool',      type: 'Returnable',  credits: 5,  zone: 'B1', room: 'Makerspace Room', status: 'available',    description: 'Temperature-controlled soldering station for PCB work.',                     usage: 'Set to 350°C for lead-free solder. Always use the stand and sponge; never leave unattended while hot.', stock: 6,  minStock: 2,  condition: 'Excellent',   borrowCount: 120, image: SAMPLE_ITEM_IMAGE },
  { id: 4,  name: 'Oscilloscope 100MHz',     category: 'electronic_equipment', type: 'Returnable',  credits: 20, zone: 'C1', room: 'Makerspace Room', status: 'borrowed',     description: '4-channel digital oscilloscope for signal analysis.',                       usage: 'Ground probes before connecting. Staff sign-off required for off-site use.',                  stock: 3,  minStock: 1,  condition: 'Good',        borrowCount: 67,  image: SAMPLE_ITEM_IMAGE },
  { id: 5,  name: 'Solder Wire 60/40',       category: 'electronic_tool',      type: 'Consumable',  credits: 10, zone: 'B2', room: 'Makerspace Room', status: 'available',    description: '60/40 tin/lead solder wire, 0.8mm diameter, 100g spool.',                  usage: 'Use in a ventilated area. Wash hands after handling — contains lead.',                          stock: 2,  minStock: 5,  condition: 'New',         borrowCount: 0,   image: SAMPLE_ITEM_IMAGE },
  { id: 6,  name: 'Laser Cutter',            category: 'cnc_machines',         type: 'Returnable',  credits: 50, zone: 'D1', room: 'Fabrication Lab', status: 'maintenance',  description: 'CO2 laser cutter for wood, acrylic, and fabric. Max 600×400 mm.',          usage: 'Requires safety briefing certification. Never cut PVC or unknown materials.',                  stock: 1,  minStock: 1,  condition: 'Maintenance', borrowCount: 89,  image: SAMPLE_ITEM_IMAGE },
  { id: 7,  name: '3D Printer Filament PLA', category: 'raw_material',         type: 'Consumable',  credits: 40, zone: 'E1', room: 'Storage Room',    status: 'available',    description: 'PLA filament 1.75 mm, 1 kg spool. Available in multiple colors.',           usage: 'Print at 190–210°C nozzle / 50–60°C bed. Store in a dry box between uses.',                     stock: 15, minStock: 4,  condition: 'New',         borrowCount: 0,   image: SAMPLE_ITEM_IMAGE },
  { id: 8,  name: 'Raspberry Pi 4B',         category: 'digital_device',       type: 'Returnable',  credits: 12, zone: 'F1', room: 'Digital Lab',     status: 'available',    description: '4 GB RAM single-board computer for computing and prototyping.',             usage: 'Use the official 5V/3A USB-C supply only. Safely shut down before unplugging.',                stock: 5,  minStock: 2,  condition: 'Good',        borrowCount: 28,  image: SAMPLE_ITEM_IMAGE },
  { id: 9,  name: 'Digital Multimeter',      category: 'electronic_tool',      type: 'Returnable',  credits: 5,  zone: 'B3', room: 'Makerspace Room', status: 'available',    description: 'Auto-ranging digital multimeter for voltage, current, resistance.',         usage: 'Set probes to the correct mode before contact. Replace fuse if it reads 0 unexpectedly.',      stock: 10, minStock: 3,  condition: 'Good',        borrowCount: 156, image: SAMPLE_ITEM_IMAGE },
  { id: 10, name: 'M3 Bolt Set',             category: 'mechanical_fasteners', type: 'Consumable',  credits: 5,  zone: 'G1', room: 'Mechanic Room',   status: 'available',    description: 'M3 stainless steel bolt assortment, 100 pcs, various lengths.',            usage: 'Match bolt length to material thickness; over-tightening strips the thread.',                  stock: 3,  minStock: 10, condition: 'New',         borrowCount: 0,   image: SAMPLE_ITEM_IMAGE },
  { id: 11, name: 'Drill Press',             category: 'manual_mechanical',    type: 'Returnable',  credits: 15, zone: 'H1', room: 'Mechanic Room',   status: 'available',    description: 'Benchtop drill press with variable speed. Max 13 mm chuck.',              usage: 'Clamp the workpiece before drilling. Eye protection required at all times.',                   stock: 2,  minStock: 1,  condition: 'Good',        borrowCount: 44,  image: SAMPLE_ITEM_IMAGE },
  { id: 12, name: 'Jumper Wires Kit',        category: 'electronic_component', type: 'Consumable',  credits: 8,  zone: 'A3', room: 'Makerspace Room', status: 'available',    description: 'Assorted jumper wires M/M, M/F, F/F for breadboard projects.',            usage: 'Check wire ends are not frayed before reuse. Sort by length when returning extras.',           stock: 30, minStock: 8,  condition: 'New',         borrowCount: 0,   image: SAMPLE_ITEM_IMAGE },
]

// Makerspace print services — document printing is charged per page up front;
// 3D printing weight isn't known until the job finishes, so staff weigh the print
// and enter the grams when fulfilling the request (see RequestsManager).
export const PRINT_SERVICES = [
  { id: 'printing',    label: 'Document Printing', Icon: Printer, color: T.blueLight,  iconColor: T.blue,
    rate: 2, unit: 'page', unitLabel: 'credits / page',
    desc: 'Black & white or color document printing at the makerspace front desk.' },
  { id: '3d_printing', label: '3D Printing',       Icon: Box,     color: T.purpleLight, iconColor: T.purple,
    rate: 4, unit: 'gram', unitLabel: 'credits / gram',
    desc: 'Submit your model, staff will print and weigh it — credits are charged by filament weight used.' },
]

// Default filament inventory — admin/staff can add, edit, and restock these.
// Each filament carries its own credit-per-gram rate so pricing can differ by material.
export const INITIAL_FILAMENTS = [
  { id: 1, name: 'PLA', color: 'White',  hex: '#F8FAFC', stockGrams: 1000, rate: 4 },
  { id: 2, name: 'PLA', color: 'Black',  hex: '#0F172A', stockGrams: 800,  rate: 4 },
  { id: 3, name: 'PETG', color: 'Clear', hex: '#CBD5E1', stockGrams: 500,  rate: 5 },
  { id: 4, name: 'ABS', color: 'Red',    hex: '#E11D48', stockGrams: 350,  rate: 5 },
]

// Shared membership pricing — referenced by the Home page credits section and the
// staff in-person sale panel (Catalog) so the rate is defined in exactly one place.
export const MEMBERSHIP_PLAN = { price: 20, bonusCredits: 200 }
// Late-return penalty - credits deducted per day past the agreed return date.
// Shown to students before they confirm a borrow, and used to prefill the
// staff "deduct credits" action on overdue loans.
export const OVERDUE_RATE = 5
export const CREDIT_RATE = 40 // credits granted per $1 topped up
export const CREDIT_TIERS = [[40, 1], [200, 5], [400, 10], [1000, 25]]

export const INITIAL_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@cadt.edu.kh',              role: 'admin', studentId: null,          membership: null,     credits: 999, permissions: [] },
  { id: 2, name: 'Lab Staff',  email: 'staff@cadt.edu.kh',              role: 'staff', studentId: null,          membership: null,     credits: 0,   permissions: ['manage_items','track_borrows','view_dashboard','approve_borrows'] },
  { id: 3, name: 'Sophea Kim', email: 'sophea@student.cadt.edu.kh',     role: 'user',  studentId: 'CADT2024001', membership: 'active', credits: 175, joinDate: '2024-01-15' },
]

export const INITIAL_BORROWS = [
  { id: 1, userId: 3, itemId: 3, itemName: 'Soldering Iron Station', action: 'borrowed',  date: '2024-06-01', returnDate: null,         status: 'active',    approvedBy: 2 },
  { id: 2, userId: 3, itemId: 9, itemName: 'Digital Multimeter',     action: 'returned',  date: '2024-05-28', returnDate: '2024-05-30', status: 'completed', condition: 'Good', approvedBy: 2 },
]

export const INITIAL_REQUESTS = [
  { id: 101, userId: 3, itemId: 4, itemName: 'Oscilloscope 100MHz', type: 'borrow', status: 'pending', date: '2024-06-10', note: 'Need for ECE lab project' },
]

// Only students have a notification center — every entry here is student-facing
// (targeted at a specific userId), never broadcast to staff/admin.
export const INITIAL_NOTIFICATIONS = [
  { id: 4, type: 'approved', message: 'Your borrowing request for Soldering Iron Station has been approved.', read: false, date: '2024-06-01', userId: 3 },
]
