export type AdminUser = {
  id: string;
  organizationId: string;
  username: string;
  fullName: string;
};

export type LoginResponse = {
  user: AdminUser;
};
