import { app, dialog, shell } from 'electron'
import { procedure, router } from './trpc'
import * as path from 'path'
import { z } from 'zod'

import { TRPCError } from '@trpc/server'
import { getImagesData } from '../helpers/system.helpers'
import { userPreferencesStorage } from '../lib/storage'
import { ALLOWED_FILE_TYPES } from '@shared/constants'

export const systemRouter = router({
  getDefaultDirectory: procedure.query(() => {
    // get the default output directory from user preferences
    const defaultOutputDirectory = userPreferencesStorage.load()?.defaultOutputDirectory

    // its technically possible for this to not exist
    // so eventually create a fallback or error handling
    return defaultOutputDirectory ?? app.getPath('documents')
  }),
  selectDirectory: procedure.mutation(async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    })

    if (result.canceled) return null
    const directory = result.filePaths[0]
    if (!directory) return null

    // store the directory in user preferences
    userPreferencesStorage.save({ defaultOutputDirectory: directory })

    return result.filePaths[0]
  }),
  selectImages: procedure.mutation(async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Images', extensions: [...ALLOWED_FILE_TYPES] }]
    })

    if (result.canceled) return []

    const images = await getImagesData(result.filePaths)

    return images
  }),
  // for handling drag and drop images
  addImages: procedure
    .input(z.object({ filePaths: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']

      //  throw an error if the file is not an image
      for (const filePath of input.filePaths) {
        const ext = path.extname(filePath).toLowerCase()
        if (!allowedExtensions.includes(ext)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `File ${filePath} is not an allowed image type. Allowed types are: ${allowedExtensions.join(', ')}`
          })
        }
      }

      const images = await getImagesData(input.filePaths)

      return images
    }),
  openFileManagerToPath: procedure
    .input(z.object({ filePath: z.string() }))
    .mutation(async ({ input }) => {
      const { filePath } = input
      shell.showItemInFolder(filePath)
    })
})
