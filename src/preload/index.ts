import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ImageConversionType, ProcessedImage } from '../types'

// Custom APIs for renderer
const api = {
  renameFile: (oldPath: string, newName: string) =>
    ipcRenderer.invoke('rename-file', oldPath, newName),
  processImages: (images: string[]): Promise<ProcessedImage[]> =>
    ipcRenderer.invoke('get-image-data', images),
  convertImage: (
    imagePath: string,
    format: ImageConversionType
  ): Promise<Omit<ProcessedImage, 'status'>> =>
    ipcRenderer.invoke('convert-image', imagePath, format),
  compressImage: (imagePath: string, quality: number): Promise<Omit<ProcessedImage, 'status'>> =>
    ipcRenderer.invoke('compress-image', imagePath, quality)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
