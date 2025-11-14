import { db } from "../utils/db";
import {
  predefinedCaseOrgTypes,
  predefinedCaseSectors,
  predefinedSolutionCategories,
} from "./schema";

const SOLUTION_CATEGORIES = Object.freeze({
  PRODUCT: {
    da: "Produkt",
  },
  PROCESS: {
    da: "Proces",
  },
  SERVICE: {
    da: "Service",
  },
  BUSINESSMODEL: {
    da: "Forretningsmodel",
  },
  CAMPAIGN_RETORICAL: {
    da: "Kampagne (retorisk)",
  },
});

const CASE_SECTORS = Object.freeze({
  PUBLIC: {
    da: "Offentlig",
  },
  PRIVATE: {
    da: "privat",
  },
  VOLUNTEER: {
    da: "frivillig",
  },
  MULTISECTION: {
    da: "tværsektorielt/partnerskab",
  },
});

const ORG_TYPES = Object.freeze({
  MUNICIPALITY: {
    da: "Kommune",
  },
  COMPANY: {
    da: "Virksomhed",
  },
  NGO: {
    da: "NGO",
  },
  GOVERNMENT: {
    da: "Stat",
  },
  HOSPITAL: {
    da: "Hospital",
  },
  POLICE: {
    da: "Politi",
  },
  MILITARY: {
    da: "Militær",
  },
  MUSEUM: {
    da: "Museum",
  },
  UNIVERSITY: {
    da: "Universitet",
  },
  HIGHSCHOOL: {
    da: "Gymnasium",
  },
  SCHOOL: {
    da: "Skole",
  },
  KINDERGARTEN: {
    da: "Børnehave/vuggestue",
  },
});

console.log("it works");
async function main() {
  // reset static tables
  await db.delete(predefinedCaseOrgTypes);
  await db.delete(predefinedCaseSectors);
  await db.delete(predefinedSolutionCategories);

  // seed static tables
  await db.insert(predefinedCaseOrgTypes).values(
    Object.keys(ORG_TYPES).map((org) => ({
      orgType: org,
    })),
  );
  await db.insert(predefinedCaseSectors).values(
    Object.keys(CASE_SECTORS).map((sect) => ({
      caseSector: sect,
    })),
  );
  await db.insert(predefinedSolutionCategories).values(
    Object.keys(SOLUTION_CATEGORIES).map((cat) => ({
      solutionCategory: cat,
    })),
  );
}

await main();

console.log("done");
process.exit(0);
