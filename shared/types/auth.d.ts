// auth.d.ts
declare module "#auth-utils" {
  interface User {
    id: number;
    email: string;
    fullName: string;
    organization: string;
    title: string;
    emailVerifiedAt: string | null;
  }

  interface SecureSessionData {
    emailVerifiedAt: string | null;
  }
}

export {};
