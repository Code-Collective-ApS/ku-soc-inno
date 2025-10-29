import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const fileUploads = pgTable("file_uploads", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  fileName: varchar("file_name").notNull(),
  fileUrl: varchar("file_url").notNull(),
  mimeType: varchar("mime_type"), // pdf, docx, etc.
  lastModified: timestamp("last_modified").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- User Table ---
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  fullName: varchar("full_name").notNull(),
  password: varchar("password").notNull(),
  organization: varchar("organization").notNull(),
  title: varchar("title").notNull(),
  email: varchar("email").notNull(),
  emailVerifiedAt: timestamp("email_verified_at"),
  email_verification_requested_at: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Case Table ---
export const cases = pgTable("cases", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title").notNull().unique(),
  challengeDescription: text("challenge_description").notNull(),
  importanceDescription: text("importance_description").notNull(),
  freeText: text("free_text"),
  contactName: varchar("contact_name").notNull(),
  contactOrganization: varchar("contact_organization").notNull(),
  contactTitle: varchar("contact_title").notNull(),
  contactEmail: varchar("contact_email").notNull(),
  contactPublic: boolean("contact_public").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
});

// --- Category Tags (Many-to-many with Case) ---
export const categoryTags = pgTable("category_tags", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  caseId: integer("case_id").references(() => cases.id),
  tag: varchar("tag").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Barrier Analysis (List of barriers per case) ---
export const barriers = pgTable("barriers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  caseId: integer("case_id").references(() => cases.id),
  barrier: varchar("barrier").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const predefinedSolutionCategories = pgTable(
  "predefined_solution_cats",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    solutionCategory: varchar("solution_category").notNull(), // e.g., product, process, service...
  },
);

// --- Solution Table ---
export const solutions = pgTable("solutions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  caseId: integer("case_id").references(() => cases.id),
  solutionCategory: varchar("solution_category").notNull(), // e.g., product, process, service...
  solutionDescription: text("solution_description"),
  isTested: boolean("is_tested").default(false),
  testingText: text("testing_text"),
  primaryPdfPublic: boolean("primary_pdf_public").default(false),
  freeText: text("free_text"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
});

// --- Solution Illustrations (Image uploads)
export const solutionIllustrations = pgTable("solution_illustrations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  solutionId: integer("solution_id").references(() => solutions.id),
  fileUploadId: integer("file_upload_id").references(() => fileUploads.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Solution Attachments
export const solutionAttachments = pgTable("solution_attachments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  solutionId: integer("solution_id").references(() => solutions.id),
  fileUploadId: integer("file_upload_id").references(() => fileUploads.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Solution Primary PDF
export const solutionPdfs = pgTable("solution_pdfs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  solutionId: integer("solution_id").references(() => solutions.id),
  fileUploadId: integer("file_upload_id").references(() => fileUploads.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const barrierRelations = relations(barriers, ({ one }) => ({
  case: one(cases, {
    fields: [barriers.caseId],
    references: [cases.id],
  }),
}));

export const categoryTagsRelations = relations(categoryTags, ({ one }) => ({
  case: one(cases, {
    fields: [categoryTags.caseId],
    references: [cases.id],
  }),
}));

// --- Relations ---
export const casesRelations = relations(cases, ({ one, many }) => ({
  categoryTags: many(categoryTags),
  barriers: many(barriers),
  solutions: many(solutions),
  user: one(users, {
    fields: [cases.userId],
    references: [users.id],
  }),
}));

export const solutionsRelations = relations(solutions, ({ many, one }) => ({
  case: one(cases, {
    fields: [solutions.caseId],
    references: [cases.id],
  }),
  user: one(users, {
    fields: [solutions.userId],
    references: [users.id],
  }),
  illustrations: many(solutionIllustrations),
  attachments: many(solutionAttachments),
  solutionPdfs: many(solutionPdfs),
}));

export const illustrationsRelations = relations(
  solutionIllustrations,
  ({ one }) => ({
    fileUpload: one(fileUploads, {
      fields: [solutionIllustrations.fileUploadId],
      references: [fileUploads.id],
    }),
  }),
);

export const solutionPdfsRelations = relations(solutionPdfs, ({ one }) => ({
  fileUpload: one(fileUploads, {
    fields: [solutionPdfs.fileUploadId],
    references: [fileUploads.id],
  }),
}));

export const attachmentsRelations = relations(
  solutionAttachments,
  ({ one }) => ({
    fileUpload: one(fileUploads, {
      fields: [solutionAttachments.fileUploadId],
      references: [fileUploads.id],
    }),
  }),
);
