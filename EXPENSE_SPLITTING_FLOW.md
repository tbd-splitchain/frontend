# SplitChain: Complete Expense Splitting Flow with Groups

## End-to-End User Journey

### Phase 0: Group Management
```
Group Creation Flow:
├── User creates "SF Roommates" group
├── Adds members: Jimmy, Guy, Robert, You
├── Sets group settings (auto-approve, spending limits)
├── Smart Contract: Deploy group contract
└── Members receive group invitations

Group Types:
├── Roommates (rent, utilities, groceries)
├── Travel Groups (hotels, flights, meals)
├── Work Teams (lunch, office supplies)
└── Friend Groups (dinners, entertainment)
```

### Phase 1: Expense Creation (Within Group)
```
User A (Bill Creator) → Creates Expense in "SF Roommates"
├── Select Group: "SF Roommates" (4 members)
├── Input: Amount ($150.50)
├── Input: Description ("Coffee & Lunch")
├── Auto-populate: Group members as participants
├── Optional: Exclude some members
├── Smart Contract: Deploy new expense within group
└── Result: Group members auto-notified
```

### Phase 2: Group Approval Phase
```
Group Members Receive Notification
├── Jimmy Cooper → Reviews expense → Clicks "Approve" → Signs with wallet
├── Guy Hawkins → Reviews expense → Clicks "Approve" → Signs with wallet
├── Robert Fox → Reviews expense → Clicks "Approve" → Signs with wallet
├── Group Settings: Auto-approve if under $50 per person
└── Smart Contract: Records all approvals on-chain
```

### Phase 3: Group Settlement Execution
```
When All Group Members Approved (4/4)
├── Anyone in group can click "Execute Payment"
├── Smart Contract Calculates per group member:
│   ├── Jimmy owes: $37.63 → Transfer to User A
│   ├── Guy owes: $37.63 → Transfer to User A
│   ├── Robert owes: $37.63 → Transfer to User A
│   └── User A gets: $112.89 reimbursement
├── Group Blockchain Execution
└── Update group expense history
```

## Detailed Group + Payment Flow

### 1. Group Setup
**Who:** Group Admin/Creator
**Action:** Creates group, invites members
**Smart Contract:**
```solidity
createGroup(
    name: "SF Roommates",
    members: [userA.eth, jimmy.eth, guy.eth, robert.eth],
    settings: {
        autoApproveLimit: 50.00 USDC,
        requireAllApprovals: true,
        allowMemberInvites: true
    }
)
```

### 2. Group Expense Creation
**Within Group Context:**
```
Group Dashboard → "SF Roommates"
├── Recent Expenses: Rent ($2000), Utilities ($150)
├── Pending: Coffee & Lunch ($150.50)
├── Total Group Spending: $2300.50 this month
├── Your Balance: +$45.20 (others owe you)
└── Quick Actions: Add Expense, Settle All, Group Settings
```

### 3. Group Member Approval
**Each member sees:**
```
Group: "SF Roommates"
New Expense: "Coffee & Lunch" - $150.50
Your Share: $37.63
Added by: User A
Status: Needs your approval (3/4 approved)
```

### 4. Group Settlement
**Complex Group Balances:**
```
Group: "SF Roommates" - Monthly Settlement
├── User A: Paid $500 → Should pay $400 → Gets back $100
├── Jimmy: Paid $200 → Should pay $400 → Owes $200
├── Guy: Paid $300 → Should pay $400 → Owes $100
└── Robert: Paid $600 → Should pay $400 → Gets back $200

Net Transfers:
├── Jimmy → User A: $100
├── Jimmy → Robert: $100
├── Guy → User A: $0 (already settled)
└── Guy → Robert: $100
```

## Group Types & Scenarios

### 1. Roommate Groups
```
"SF Roommates" Group
├── Monthly Recurring:
│   ├── Rent: $2000 (split 4 ways = $500 each)
│   ├── Utilities: $200 (split 4 ways = $50 each)
│   └── Internet: $80 (split 4 ways = $20 each)
├── Variable Expenses:
│   ├── Groceries: $300 (whoever shops)
│   ├── Household items: $50-100
│   └── Repairs: As needed
└── Settlement: Monthly auto-execution
```

### 2. Travel Groups
```
"Europe Trip 2024" Group
├── Pre-Trip:
│   ├── Flights: $1200/person (book together)
│   ├── Hotels: $200/night (split rooms)
│   └── Car Rental: $400 (split 4 ways)
├── During Trip:
│   ├── Meals: Daily expenses
│   ├── Activities: Tours, museums
│   └── Transport: Taxis, trains
└── Settlement: End of trip execution
```

### 3. Work Teams
```
"Marketing Team Lunch" Group
├── Regular Expenses:
│   ├── Team Lunches: $200-400
│   ├── Coffee Runs: $20-50
│   └── Office Supplies: $100-200
├── Special Events:
│   ├── Team Building: $500+
│   └── Client Dinners: $300+
└── Settlement: Weekly execution
```

## Group Insufficient Funds Scenarios

### Scenario 1: Group Member Has No USDC
```
Group: "SF Roommates"
Jimmy's Wallet: 0 USDC (owes $200 this month)

Group Options:
├── "Cover Jimmy" → Other members split his portion temporarily
├── "Jimmy Payment Plan" → Break into smaller payments
├── "Exclude from Settlement" → Jimmy settles manually later
├── "Group Loan" → Group treasury covers (if exists)
└── Settlement pauses for Jimmy's portion only
```

### Scenario 2: Multiple Group Members Short
```
Group: "Europe Trip" - $3000 total settlement needed
├── Jimmy: Has $500, owes $750 (short $250)
├── Guy: Has $600, owes $750 (short $150)
├── Others: Fully funded

Group Settlement Options:
├── Partial Settlement: Execute what's available now
├── Group Credit: Robert covers shortfall temporarily
├── Modify Split: Redistribute based on ability to pay
└── Postpone Settlement: Wait for all to be funded
```

### Scenario 3: Group Treasury System
```
"SF Roommates" Group Treasury
├── Each member deposits $100 monthly
├── Auto-pay recurring expenses (rent, utilities)
├── Buffer for emergencies/shortfalls
├── Excess returns to members quarterly
└── Smart contract manages treasury balance
```

## Group Management Pages & Features

### Group Dashboard
```
"SF Roommates" Overview
├── Members (4): Show avatars + balances
├── This Month: $2,500 total expenses
├── Pending Settlements: $345.50
├── Recent Activity: Last 10 expenses
├── Quick Actions: Add Expense, Settle All, Invite Member
└── Settings: Group preferences, limits
```

### Group Transaction History
```
"SF Roommates" - All Time
├── Filter: This month, Last 3 months, All time
├── Category: Rent, Food, Utilities, Other
├── Status: Completed, Pending, Failed
├── Export: CSV, PDF for taxes/records
└── Analytics: Spending trends, member contributions
```

### Group Settings
```
"SF Roommates" Settings
├── Auto-Approval Limits: <$50 per person
├── Settlement Frequency: Monthly/Weekly
├── Member Permissions: Who can add expenses
├── Notification Preferences: Email, Push, SMS
├── Integration: Calendar reminders, Slack bot
└── Emergency Contacts: For failed payments
```

## Advanced Group Features

### 1. Recurring Expenses
```
"SF Roommates" - Recurring Setup
├── Rent: $2000 every 1st of month
├── Utilities: $150-200 every 15th
├── Internet: $80 every 10th
├── Auto-create expenses + notify group
└── Auto-execute if all pre-approved
```

### 2. Group Credit System
```
Group Internal Credit
├── Jimmy owes group: -$200 (red balance)
├── Robert has credit: +$150 (green balance)
├── Net settlement calculations
├── Interest on overdue amounts (optional)
└── Credit limits per member
```

### 3. Group Analytics
```
"SF Roommates" - Monthly Report
├── Total Spending: $2,500
├── Per Person Average: $625
├── Highest Spender: User A ($800)
├── Most Frequent: Coffee expenses (15x)
├── Category Breakdown: Food 40%, Utilities 30%, Other 30%
└── Prediction: Next month estimate $2,600
```

## Group Error Handling

### 1. Member Leaves Group
```
Robert Leaves "SF Roommates"
├── Settle all pending expenses first
├── Calculate final balance owed/owed to Robert
├── Execute final settlement
├── Remove from future expenses
├── Archive Robert's transaction history
└── Update group member count
```

### 2. Group Dissolution
```
"Europe Trip 2024" - Trip Complete
├── Final settlement of all expenses
├── Return any group treasury funds
├── Archive all transaction history
├── Export final expense report
├── Dissolve smart contract
└── Send final summary to all members
```

### 3. Disputed Expenses
```
Expense Dispute Process
├── Member flags expense as "Disputed"
├── Pause settlement execution
├── Group discussion period (7 days)
├── Admin/majority vote resolution
├── Modify or cancel expense
└── Resume settlement process
```

## Integration with Individual Expenses

### Mixed Expense Types
```
User Dashboard Shows:
├── Individual Expenses: Coffee with Alex ($20)
├── Group Expenses: "SF Roommates" pending ($150)
├── Work Expenses: "Marketing Team" lunch ($45)
└── Total Pending: $215 across all contexts
```

### Cross-Group Settlements
```
Monthly Settlement Summary:
├── "SF Roommates": You owe $200
├── "Work Team": You're owed $50
├── Individual expenses: You owe $75
├── Net Position: You owe $125 total
└── One-click settle all groups + individuals
```

This comprehensive flow covers all aspects of group-based expense splitting, from creation to settlement, including edge cases and advanced features that make group expense management seamless and transparent.