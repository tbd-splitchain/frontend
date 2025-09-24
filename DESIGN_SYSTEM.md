# SplitChain Design System

## Color Palette

### Primary Colors
- **Background**: `bg-gradient-to-br from-gray-50 to-blue-50/20`
- **Card Background**: `#FFFFFF` (white)
- **Text Primary**: `#1F2937` (gray-900)
- **Text Secondary**: `#6B7280` (gray-600)
- **Text Muted**: `#9CA3AF` (gray-500)

### Balance Card (ATM Style)
- **Background**: `bg-gradient-to-br from-gray-800 via-gray-900 to-black`
- **Text**: `#FFFFFF` (white)
- **Secondary Text**: `#9CA3AF` (gray-400)
- **Folder Tab**: `#374151` (gray-800)

### Status Colors

#### Approved/Success (Green)
- **Light Background**: `#F0FDF4` (green-50)
- **Medium**: `#22C55E` (green-500)
- **Dark**: `#16A34A` (green-600)
- **Darker**: `#15803D` (green-700)
- **Text**: `#166534` (green-700)

#### Pending/Warning (Yellow/Orange)
- **Light Background**: `#FFFBEB` (yellow-50) to `#FED7AA` (orange-200)
- **Medium**: `#F59E0B` (yellow-500)
- **Dark**: `#EA580C` (orange-600)
- **Text**: `#D97706` (yellow-600) / `#EA580C` (orange-600)

#### Action/Primary (Purple)
- **Light Background**: `#F3E8FF` (purple-100) to `#E9D5FF` (purple-200)
- **Medium**: `#7C3AED` (purple-600)
- **Dark**: `#6D28D9` (purple-700)
- **Darker**: `#5B21B6` (purple-800)
- **Text**: `#7C3AED` (purple-600)

#### Error/Danger (Red)
- **Light Background**: `#FEF2F2` (red-50)
- **Medium**: `#EF4444` (red-500)
- **Dark**: `#DC2626` (red-600)
- **Text**: `#DC2626` (red-600)

## Typography

### Font Sizes
- **Headline Large**: `text-4xl lg:text-5xl` (36px-48px)
- **Headline**: `text-2xl` (24px)
- **Title**: `text-lg` (18px)
- **Body**: `text-base` (16px)
- **Small**: `text-sm` (14px)
- **Extra Small**: `text-xs` (12px)

### Font Weights
- **Bold**: `font-bold` (700)
- **Semibold**: `font-semibold` (600)
- **Medium**: `font-medium` (500)
- **Normal**: `font-normal` (400)

## Layout & Spacing

### Container Sizes
- **Mobile**: `max-w-md` (448px)
- **Tablet**: `max-w-4xl` (896px)
- **Desktop**: `max-w-7xl` (1280px)

### Padding/Margin
- **Page**: `px-6 py-8`
- **Card**: `p-6` or `p-4`
- **Small Elements**: `p-2` or `p-3`

### Grid System
- **Homepage**: `grid lg:grid-cols-4 gap-8`
- **Split View**: `grid lg:grid-cols-3 gap-8`

## Component Styles

### Cards
- **Border Radius**: `rounded-3xl` (24px) for main cards, `rounded-2xl` (16px) for smaller
- **Shadow**: `shadow-sm` (subtle) or `shadow-xl` (prominent)
- **Border**: `border border-gray-100` (optional)
- **Hover**: `hover:shadow-xl transition-all duration-300`

### Buttons

#### Primary (Action Needed)
```css
bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-2xl font-semibold shadow-lg
```

#### Success (Ready to Execute)
```css
bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-semibold shadow-lg
```

#### Secondary (Neutral)
```css
bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-2xl font-semibold shadow-lg
```

#### Ghost (Minimal)
```css
hover:bg-gray-50 text-gray-600 p-3 rounded-lg transition-colors
```

### Profile Pictures
- **Sizes**:
  - Small: `w-8 h-8` (32px)
  - Medium: `w-10 h-10` (40px)
  - Large: `w-12 h-12` (48px)
- **Border Radius**: `rounded-full`
- **API**: DiceBear Adventurer style
- **URL**: `https://api.dicebear.com/9.x/adventurer/svg?seed={name}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`

### Progress Bars
- **Container**: `w-full bg-gray-200 rounded-full h-2`
- **Fill**: `h-2 rounded-full` with status color
- **Colors**: Green for complete, Purple for in-progress

### Status Indicators
- **Approved**: Green background (`bg-green-50`), green text
- **Pending**: Yellow background (`bg-yellow-50`), yellow text
- **Ready**: Green indicator, "Execute Payment" button

## Card Types

### Balance Card (ATM Style)
- **Background**: Dark gradient with folder tab
- **Tab**: Top-left with angled notch
- **Pointer**: Bottom center arrow
- **Content**: White text on dark background
- **Hover**: `hover:shadow-2xl transform hover:-translate-y-1`

### Settlement Cards
- **Approved**: Purple gradient background (`from-purple-100 to-purple-200`)
- **Pending**: Yellow/Orange gradient (`from-yellow-100 to-orange-200`)
- **Content**: Dark text on light gradient background
- **Button**: Full width, rounded-2xl

### Detail Cards
- **Background**: White with subtle border
- **Participants**: Individual cards with status-colored backgrounds
- **Transaction Details**: Simple key-value pairs

## Animation & Transitions

### Page Transitions
- **Duration**: `duration-300` (300ms) or `duration-500` (500ms)
- **Easing**: `ease-out` or custom `[0.4, 0.0, 0.2, 1]`
- **Properties**: `transition-all`, `transition-colors`, `transition-shadow`

### Hover Effects
- **Cards**: `hover:shadow-xl transition-all duration-300`
- **Buttons**: `hover:bg-{color}-700 transition-colors duration-200`
- **Transform**: `transform hover:-translate-y-1` for cards

### Framer Motion
- **Initial**: `{ opacity: 0, y: 20 }`
- **Animate**: `{ opacity: 1, y: 0 }`
- **Transition**: `{ duration: 0.6, delay: 0.1 }`
- **Stagger**: Increase delay by 0.1s for each element

## Iconography

### Icons Used
- **Lucide React**: Primary icon library
- **Sizes**: `w-4 h-4`, `w-5 h-5`, `w-6 h-6`
- **Colors**: Match text colors (`text-gray-400`, `text-white`, etc.)

### Common Icons
- **Navigation**: ArrowLeft, ArrowRight, Settings, MoreVertical
- **Actions**: Plus, Camera, User, Home, Bell
- **Status**: CheckCircle, Clock, AlertCircle

## Blockchain Integration

### Transaction Details Display
```
Created: 2024-09-23
Currency: USDC
Network: Arbitrum
Contract: 0x742d...8D32 (truncated format)
```

### Status Flow
1. **Pending** → Orange/Yellow colors, "Approve" actions
2. **All Approved** → Green colors, "Execute Payment"
3. **Executed** → Success state, transaction hash display

## Mobile Responsiveness

### Breakpoints
- **Mobile**: `< 768px` - Single column, smaller text
- **Tablet**: `768px - 1024px` - Adjusted grid, medium spacing
- **Desktop**: `> 1024px` - Full layout, large spacing

### Grid Adjustments
- **Mobile**: Single column stack
- **Tablet**: `lg:grid-cols-2`
- **Desktop**: `lg:grid-cols-3` or `lg:grid-cols-4`

---

## Usage Examples

### Creating a Settlement Card
```tsx
<div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
  <p className="text-purple-600 text-sm font-medium">Pending Bill</p>
  <h3 className="font-bold text-gray-900 text-2xl">$150.50</h3>
  <p className="text-green-600 text-sm font-medium">3 of 3 approved</p>
</div>
```

### Progress Bar
```tsx
<div className="w-full bg-gray-200 rounded-full h-2">
  <div className="bg-purple-600 h-2 rounded-full" style={{width: '66.7%'}}></div>
</div>
```

This design system ensures consistency across your SplitChain crypto expense splitting application.