export const loans = [
  {
    id: 1,
    loanId: "LN-2026-001",
    bookId: 2, // References '1984'
    bookTitle: "1984",
    memberId: 3, // References 'Tareq'
    memberName: "Tareq",
    borrowDate: "2026-07-15",
    dueDate: "2026-08-15",
    returnDate: null, // Null means currently checked out
    status: "Active", // Active, Returned, Overdue
    fineAmount: 0.0,
  },
  {
    id: 2,
    loanId: "LN-2026-002",
    bookId: 1, // References 'To Kill a Mockingbird'
    bookTitle: "To Kill a Mockingbird",
    memberId: 5, // References 'Yehya'
    memberName: "Yehya",
    borrowDate: "2026-06-01",
    dueDate: "2026-07-01",
    returnDate: "2026-06-28",
    status: "Returned",
    fineAmount: 0.0,
  },
  {
    id: 3,
    loanId: "LN-2026-003",
    bookId: 3, // References 'Dune'
    bookTitle: "Dune",
    memberId: 3, // References 'Tareq'
    memberName: "Tareq",
    borrowDate: "2026-06-20",
    dueDate: "2026-07-20",
    returnDate: null,
    status: "Overdue",
    fineAmount: 5.50,
  },
  {
    id: 4,
    loanId: "LN-2026-004",
    bookId: 5, // References 'The Hobbit'
    bookTitle: "The Hobbit",
    memberId: 6, // References 'Karem'
    memberName: "Karem",
    borrowDate: "2026-08-01",
    dueDate: "2026-09-01",
    returnDate: null,
    status: "Active",
    fineAmount: 0.0,
  },
];

export default loans;