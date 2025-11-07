import { z } from "zod";

export const daySchema = z
  .object({
    dayIndex: z.number().int().min(1).max(24),
    contentType: z.enum(["text", "image", "video", "link"]),
    content: z.object({
      text: z.string().optional(),
      url: z.string().url("URL invalide").optional()
    })
  })
  .refine(
    (d) => (d.contentType === "text" ? !!d.content.text : !!d.content.url),
    {
      message: "Contenu requis pour ce type"
    }
  );

export const giftDraftSchema = z.object({
  title: z.string().min(2, "Titre requis"),
  message: z.string().optional(),
  startsOn: z.string().min(8, "Date de début requise"),
  timezone: z.string().min(3),
  theme: z.enum(["classic", "minimal", "festive"]),
  recipient: z.object({
    phone: z.string().min(6, "Numéro invalide"),
    email: z.string().email("Email invalide")
  }),
  days: z.array(daySchema).length(24)
});
