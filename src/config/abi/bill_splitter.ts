export const BillSplitterABI = [
  { "inputs": [], "name": "BillNotFoundError", "type": "error" },
  { "inputs": [], "name": "ERC20CallFailedError", "type": "error" },
  { "inputs": [], "name": "GroupNotFoundError", "type": "error" },
  { "inputs": [], "name": "InsufficientAllowanceError", "type": "error" },
  { "inputs": [], "name": "InsufficientDebtError", "type": "error" },
  { "inputs": [], "name": "InsufficientMembersError", "type": "error" },
  { "inputs": [], "name": "MismatchedArraysError", "type": "error" },
  { "inputs": [], "name": "NoDebtError", "type": "error" },
  { "inputs": [], "name": "NotGroupMemberError", "type": "error" },
  { "inputs": [], "name": "TransferFailedError", "type": "error" },
  {
    "inputs": [
      { "internalType": "uint256", "name": "group_id", "type": "uint256" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      {
        "internalType": "address[]",
        "name": "participant_addresses",
        "type": "address[]"
      }
    ],
    "name": "addBill",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "address", "name": "token", "type": "address" },
      {
        "internalType": "string[]",
        "name": "member_names",
        "type": "string[]"
      },
      {
        "internalType": "address[]",
        "name": "member_addresses",
        "type": "address[]"
      }
    ],
    "name": "createGroup",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "group_id", "type": "uint256" },
      { "internalType": "uint32", "name": "bill_index", "type": "uint32" }
    ],
    "name": "getBillAmount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "group_id", "type": "uint256" },
      { "internalType": "uint32", "name": "bill_index", "type": "uint32" }
    ],
    "name": "getBillCreator",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "group_id", "type": "uint256" },
      { "internalType": "uint32", "name": "bill_index", "type": "uint32" }
    ],
    "name": "getBillDescription",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "group_id", "type": "uint256" },
      { "internalType": "uint32", "name": "bill_index", "type": "uint32" },
      {
        "internalType": "uint32",
        "name": "participant_index",
        "type": "uint32"
      }
    ],
    "name": "getBillParticipant",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "group_id", "type": "uint256" },
      { "internalType": "uint32", "name": "bill_index", "type": "uint32" }
    ],
    "name": "getBillParticipantCount",
    "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "group_id", "type": "uint256" },
      { "internalType": "address", "name": "debtor", "type": "address" },
      { "internalType": "address", "name": "creditor", "type": "address" }
    ],
    "name": "getDebt",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "group_id", "type": "uint256" }
    ],
    "name": "getGroupInfo",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint64", "name": "", "type": "uint64" },
      { "internalType": "uint64", "name": "", "type": "uint64" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "group_id", "type": "uint256" },
      { "internalType": "uint32", "name": "member_index", "type": "uint32" }
    ],
    "name": "getMemberAddress",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "group_id", "type": "uint256" }
    ],
    "name": "getMemberCount",
    "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "group_id", "type": "uint256" },
      { "internalType": "address", "name": "member", "type": "address" }
    ],
    "name": "getMemberTotalOwed",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "group_id", "type": "uint256" },
      { "internalType": "address", "name": "member", "type": "address" }
    ],
    "name": "getMemberTotalOwedByOthers",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "group_id", "type": "uint256" },
      { "internalType": "address", "name": "creditor", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "settleDebt",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]