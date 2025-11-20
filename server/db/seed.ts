import { db } from "../utils/db";
import { predefinedSolutionCategories } from "./schema";

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

async function main() {
  // reset static tables
  await db.delete(predefinedSolutionCategories);
  await db.insert(predefinedSolutionCategories).values(
    Object.keys(SOLUTION_CATEGORIES).map((cat) => ({
      solutionCategory: cat,
    })),
  );
}

await main();

console.log("bye");
process.exit(0);
