import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    lawFirmId: string;
    lawFirm: {
      id: string;
      name: string;
      firmType: string;
      isLender: boolean;
    };
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      lawFirmId: string;
      lawFirm: {
        id: string;
        name: string;
        firmType: string;
        isLender: boolean;
      };
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    lawFirmId: string;
    lawFirm: {
      id: string;
      name: string;
      firmType: string;
      isLender: boolean;
    };
  }
}
