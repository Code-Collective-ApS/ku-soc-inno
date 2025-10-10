// auth.d.ts
declare module "#auth-utils" {
  interface User {
    id: number;
    email: string;
    fullName: string;
    organization: string;
    title: string;
    emailVerifiedAt: string;
  }

  interface UserSession {
    id: number;
    email: string;
    fullName: string;
    organization: string;
    title: string;
  }

  interface SecureSessionData {
    emailVerifiedAt: string;
  }
}

export {};
