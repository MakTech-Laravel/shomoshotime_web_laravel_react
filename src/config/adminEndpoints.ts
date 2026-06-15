export const adminEndpoints = {
  usersAll: "/admin/user/all",
  userSingle: (id: number) => `/admin/user/single/${id}`,
  userCreate: "/admin/user/create",
  userUpdate: (id: number) => `/admin/user/update/${id}`,
  userDelete: (id: number) => `/admin/user/delete/${id}`,
  userStatusChange: "/admin/user/status-change",
} as const;
