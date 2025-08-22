import { useState, useEffect, useCallback } from 'react'
import { storageService, type StorageData } from '@/services/storageService'

export interface UseStorageReturn {
  data: StorageData | null
  isLoading: boolean
  error: string | null
  isExtensionAvailable: boolean
  lastSync: number | undefined
  saveData: (data: Partial<StorageData>) => Promise<boolean>
  clearData: () => Promise<boolean>
  refresh: () => Promise<void>
  getDebugInfo: () => Promise<any>
}

export const useStorage = (): UseStorageReturn => {
  const [data, setData] = useState<StorageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExtensionAvailable, setIsExtensionAvailable] = useState(false)
  const [lastSync, setLastSync] = useState<number | undefined>()

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [storageData, syncStatus] = await Promise.all([
        storageService.getUserData(),
        storageService.checkSyncStatus()
      ])

      setData(storageData)
      setIsExtensionAvailable(syncStatus.isExtensionAvailable)
      setLastSync(syncStatus.lastSync)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Storage error occurred'
      setError(errorMessage)
      console.error('❌ [useStorage] Load error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveData = useCallback(async (newData: Partial<StorageData>): Promise<boolean> => {
    try {
      setError(null)
      const success = await storageService.saveUserData(newData)
      
      if (success) {
        // Veriyi yeniden yükle
        await loadData()
      } else {
        setError('Failed to save data')
      }
      
      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Save error occurred'
      setError(errorMessage)
      console.error('❌ [useStorage] Save error:', err)
      return false
    }
  }, [loadData])

  const clearData = useCallback(async (): Promise<boolean> => {
    try {
      setError(null)
      const success = await storageService.clearStorage()
      
      if (success) {
        setData(null)
        setLastSync(undefined)
      } else {
        setError('Failed to clear data')
      }
      
      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Clear error occurred'
      setError(errorMessage)
      console.error('❌ [useStorage] Clear error:', err)
      return false
    }
  }, [])

  const refresh = useCallback(async (): Promise<void> => {
    await loadData()
  }, [loadData])

  const getDebugInfo = useCallback(async () => {
    try {
      return await storageService.getDebugInfo()
    } catch (err) {
      console.error('❌ [useStorage] Debug info error:', err)
      return null
    }
  }, [])

  // Component mount edildiğinde veriyi yükle
  useEffect(() => {
    loadData()
  }, [loadData])

  // Extension durumu değişikliklerini dinle
  useEffect(() => {
    const handleExtensionChange = () => {
      console.log('🔄 [useStorage] Extension status changed, refreshing...')
      loadData()
    }

    // Extension yüklenme/kaldırılma durumlarını dinle
    window.addEventListener('focus', handleExtensionChange)
    
    return () => {
      window.removeEventListener('focus', handleExtensionChange)
    }
  }, [loadData])

  return {
    data,
    isLoading,
    error,
    isExtensionAvailable,
    lastSync,
    saveData,
    clearData,
    refresh,
    getDebugInfo
  }
}

export default useStorage