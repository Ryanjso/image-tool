import { z } from 'zod'

export const ResizeBlockSchema = z.object({
  type: z.literal('resize'),
  width: z.number().positive().int(),
  height: z.number().positive().int()
})

export const RenameBlockSchema = z.object({
  type: z.literal('rename'),
  newName: z.string().min(1)
})

export const CropBlockSchema = z.object({
  type: z.literal('crop'),
  top: z.number().nonnegative().int(),
  left: z.number().nonnegative().int(),
  width: z.number().positive().int(),
  height: z.number().positive().int()
})

export const ConvertBlockSchema = z.object({
  type: z.literal('convert'),
  outputType: z.enum(['png', 'jpeg', 'webp'])
})

export const BlockSchema = z.union([
  ResizeBlockSchema,
  RenameBlockSchema,
  CropBlockSchema,
  ConvertBlockSchema
])

export type Block = z.infer<typeof BlockSchema>