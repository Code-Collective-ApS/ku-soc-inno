import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const fileUploads = pgTable("file_uploads", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  fileName: varchar("file_name").notNull(),
  fileUrl: varchar("file_url").notNull(),
  mimeType: varchar("mime_type").notNull(), // pdf, docx, etc.
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
  forgot_password_requested_at: timestamp({ withTimezone: true }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  removedAt: timestamp("removed_at"),
});

// --- Case Table ---
export const cases = pgTable(
  "cases",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title").notNull().unique(),
    challengeDescription: text("challenge_description").notNull(),
    importanceDescription: text("importance_description").notNull(),
    freeText: text("free_text"),
    dataText: text("data_text").notNull(),
    contactName: varchar("contact_name").notNull(),
    contactOrganization: varchar("contact_organization").notNull(),
    contactTitle: varchar("contact_title").notNull(),
    contactEmail: varchar("contact_email").notNull(),
    contactPublic: boolean("contact_public").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    removedAt: timestamp("removed_at"),
    sector: varchar("sector").notNull(),
    organizationType: varchar("organization_type").notNull(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("search_index").using(
      "gin",
      sql`(
    setweight(to_tsvector('danish', ${table.title}), 'A') ||
    setweight(to_tsvector('danish', ${table.challengeDescription}), 'B')
    setweight(to_tsvector('danish', ${table.importanceDescription}), 'C')
  )`,
    ),
  ],
);

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

// --- Solution Table ---
export const solutions = pgTable("solutions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  caseId: integer("case_id").references(() => cases.id),
  title: text("title").notNull().default("Ikke navngivet"),
  solutionDescription: text("solution_description").notNull(),
  isTested: boolean("is_tested").default(false).notNull(),
  testingText: text("testing_text"),
  primaryPdfPublic: boolean("primary_pdf_public").default(false).notNull(),
  freeText: text("free_text"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  removedAt: timestamp("removed_at"),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
});

export const solutionCategories = pgTable("solution_cats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  solutionCategory: varchar("solution_category").notNull(), // e.g., product, process, service...
  solutionId: integer("solution_id")
    .references(() => solutions.id)
    .notNull(),
});

// --- Solution Illustrations (Image uploads)
export const solutionIllustrations = pgTable("solution_illustrations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  solutionId: integer("solution_id")
    .references(() => solutions.id)
    .notNull(),
  fileUploadId: integer("file_upload_id")
    .references(() => fileUploads.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Solution Attachments
export const solutionAttachments = pgTable("solution_attachments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  solutionId: integer("solution_id")
    .references(() => solutions.id)
    .notNull(),
  fileUploadId: integer("file_upload_id")
    .references(() => fileUploads.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Solution Primary PDF
export const solutionPdfs = pgTable("solution_pdfs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  solutionId: integer("solution_id")
    .references(() => solutions.id)
    .notNull(),
  fileUploadId: integer("file_upload_id")
    .references(() => fileUploads.id)
    .notNull(),
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

export const solutionCategoryRelations = relations(
  solutionCategories,
  ({ one }) => ({
    solution: one(solutions, {
      fields: [solutionCategories.solutionId],
      references: [solutions.id],
      relationName: "solutionCategories",
    }),
  }),
);

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
  solutionCategories: many(solutionCategories, {
    relationName: "solutionCategories",
  }),
  illustrations: many(solutionIllustrations, {
    relationName: "solutionIllustrations",
  }),
  attachments: many(solutionAttachments, {
    relationName: "solutionAttachments",
  }),
  solutionPdfs: many(solutionPdfs, {
    relationName: "solutionPdfs",
  }),
}));

export const illustrationsRelations = relations(
  solutionIllustrations,
  ({ one }) => ({
    fileUpload: one(fileUploads, {
      fields: [solutionIllustrations.fileUploadId],
      references: [fileUploads.id],
      relationName: "solutionIllustrations",
    }),
  }),
);

export const solutionPdfsRelations = relations(solutionPdfs, ({ one }) => ({
  fileUpload: one(fileUploads, {
    fields: [solutionPdfs.fileUploadId],
    references: [fileUploads.id],
    relationName: "solutionPdfs",
  }),
}));

export const attachmentsRelations = relations(
  solutionAttachments,
  ({ one }) => ({
    fileUpload: one(fileUploads, {
      fields: [solutionAttachments.fileUploadId],
      references: [fileUploads.id],
      relationName: "solutionAttachments",
    }),
  }),
);
