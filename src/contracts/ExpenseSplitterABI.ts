export const ExpenseSplitterABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "create_group",
    "inputs": [
      {
        "name": "name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "token",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "member_names",
        "type": "string[]",
        "internalType": "string[]"
      },
      {
        "name": "member_addresses",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "add_bill",
    "inputs": [
      {
        "name": "group_id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "description",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "participant_addresses",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "settle_debt",
    "inputs": [
      {
        "name": "group_id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "creditor",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "get_debt",
    "inputs": [
      {
        "name": "group_id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "debtor",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "creditor",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_member_total_owed",
    "inputs": [
      {
        "name": "group_id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "member",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_member_total_owed_by_others",
    "inputs": [
      {
        "name": "group_id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "member",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_group_info",
    "inputs": [
      {
        "name": "group_id",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      },
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_member_address",
    "inputs": [
      {
        "name": "group_id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "member_index",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_bill_amount",
    "inputs": [
      {
        "name": "group_id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "bill_index",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_bill_creator",
    "inputs": [
      {
        "name": "group_id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "bill_index",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_bill_participant_count",
    "inputs": [
      {
        "name": "group_id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "bill_index",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_bill_participant",
    "inputs": [
      {
        "name": "group_id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "bill_index",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "participant_index",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_member_count",
    "inputs": [
      {
        "name": "group_id",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_member_name",
    "inputs": [
      {
        "name": "group_id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "member_index",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_bill_description",
    "inputs": [
      {
        "name": "group_id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "bill_index",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "error",
    "name": "InsufficientMembersError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MismatchedArraysError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "GroupNotFoundError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotGroupMemberError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InsufficientAllowanceError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "BillNotFoundError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ERC20CallFailedError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TransferFailedError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NoDebtError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InsufficientDebtError",
    "inputs": []
  }
] as const;