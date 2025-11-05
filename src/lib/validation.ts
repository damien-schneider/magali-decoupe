import { z } from "zod";
import type { Circle } from "@/types/circle-fitter";

export const circleSchema = z.object({
  diameter: z
    .number()
    .min(0.01, "Le diamètre doit être au moins de 0.01")
    .refine(
      (val) => val > 0,
      "Le diamètre doit être strictement supérieur à 0"
    ),
  x: z.number().optional(),
  y: z.number().optional(),
  color: z.string(),
});

export const circlesArraySchema = z
  .array(circleSchema)
  .min(1, "Au moins un cercle est requis");

export const validateCircles = (
  circles: Circle[]
): { isValid: boolean; errors: string[] } => {
  try {
    circlesArraySchema.parse(circles);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue) => {
        const circleIndex = issue.path[0] as number;
        return `Cercle ${Number(circleIndex) + 1}: ${issue.message}`;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: ["Erreur de validation inconnue"] };
  }
};
