export type IdResponse = {
  id: string;
};

export type ReceiptCreatedResponse = IdResponse & {
  receiptNumber: string;
};

export type IssueCreatedResponse = IdResponse & {
  issueNumber: string;
};
