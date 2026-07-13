import { validateExerciseCatalog } from "@/lib/exerciseCatalog";

if (process.env.NODE_ENV === "production") {
  console.log("[exerciseCatalogValidationSmoke] skipped in production mode");
  process.exit(0);
}

const result = validateExerciseCatalog();
if (result.ok) {
  console.log("[exerciseCatalogValidationSmoke] OK");
} else {
  console.log("[exerciseCatalogValidationSmoke] FAILED");
  result.errors.forEach((error) => {
    console.log(`- ${error}`);
  });
}
