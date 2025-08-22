export interface StorageData {
  token?: string
  is_guest?: boolean
  user?: {
    id?: string
    email?: string
    [key: string]: any
  }
  lastSync?: number
}

export interface ExtensionMessage {
  action: string
  data?: any
}

export interface ExtensionResponse {
  success: boolean
  data?: any
  error?: string
}

// Chrome types artık @types/chrome paketinden gelecek
// Global type tanımını kaldırıyoruz

class StorageService {
  // Extension ile uyumlu key'ler - USER_DATA eklendi
  private readonly STORAGE_KEYS = {
    TOKEN: 'token',
    IS_GUEST: 'is_guest', 
    USER: 'user',
    USER_DATA: 'user_data', // Eksik key eklendi
    SYNC_TIME: 'heybe_last_sync'
  } as const

  private browserType: 'chrome' | 'firefox' | 'web' = 'web'

  constructor() {
    this.browserType = this.detectBrowser()
    console.log('🚀 [Storage] Service initialized:', {
      browser: this.browserType,
      hasExtension: this.isExtensionAvailable()
    })
  }

  /**
   * Tarayıcı türünü tespit et
   */
  private detectBrowser(): 'chrome' | 'firefox' | 'web' {
    if (typeof window !== 'undefined') {
      if (window.chrome?.runtime) {
        return 'chrome'
      }
      if (window.browser?.runtime) {
        return 'firefox'
      }
    }
    return 'web'
  }

  /**
   * Extension mevcut mu kontrol et
   */
  private isExtensionAvailable(): boolean {
    try {
      if (this.browserType === 'chrome') {
        return !!(window.chrome?.runtime?.id)
      }
      if (this.browserType === 'firefox') {
        return !!(window.browser?.runtime?.id)
      }
      return false
    } catch {
      return false
    }
  }

  /**
   * Extension'a mesaj gönder
   */
  private async sendMessageToExtension(message: ExtensionMessage): Promise<ExtensionResponse> {
    return new Promise((resolve) => {
      try {
        const runtime = this.browserType === 'firefox' 
          ? window.browser?.runtime 
          : window.chrome?.runtime
        
        if (!runtime?.sendMessage) {
          resolve({ success: false, error: 'Runtime not available' })
          return
        }

        runtime.sendMessage(message, (response: ExtensionResponse) => {
          const lastError = this.browserType === 'firefox' 
            ? window.browser?.runtime?.lastError 
            : window.chrome?.runtime?.lastError

          if (lastError) {
            console.warn('⚠️ [Storage] Extension message error:', lastError.message)
            resolve({ success: false, error: lastError.message })
          } else {
            resolve(response || { success: false, error: 'No response' })
          }
        })
      } catch (error) {
        console.warn('⚠️ [Storage] Failed to send message:', error)
        resolve({ success: false, error: 'Extension not available' })
      }
    })
  }

  /**
   * Extension'dan veri al - Website açılışında çağrılır
   */
  async getFromExtension(): Promise<StorageData | null> {
    if (!this.isExtensionAvailable()) {
      console.log('ℹ️ [Storage] Extension not available, using localStorage')
      return this.getFromLocalStorage()
    }

    try {
      console.log('🔄 [Storage] Getting data from extension...')
      const response = await this.sendMessageToExtension({
        action: 'GET_STORAGE_DATA'
      })

      if (response.success && response.data) {
        console.log('✅ [Storage] Data retrieved from extension:', response.data)
        // Extension'dan alınan veriyi localStorage'a senkronize et
        await this.syncToLocalStorage(response.data)
        return response.data
      } else {
        console.log('⚠️ [Storage] No data in extension, checking localStorage')
      }
    } catch (error) {
      console.warn('⚠️ [Storage] Extension read failed:', error)
    }

    // Fallback: localStorage'dan oku
    return this.getFromLocalStorage()
  }

  /**
   * Extension'a veri kaydet - Giriş/kayıt sonrası çağrılır
   */
  async saveToExtension(data: Partial<StorageData>): Promise<boolean> {
    // Önce localStorage'a kaydet
    const localSaved = this.saveToLocalStorage(data)
    
    if (!this.isExtensionAvailable()) {
      console.log('ℹ️ [Storage] Extension not available, saved to localStorage only')
      return localSaved
    }

    try {
      console.log('🔄 [Storage] Saving data to extension...', data)
      const response = await this.sendMessageToExtension({
        action: 'SAVE_STORAGE_DATA',
        data: { ...data, lastSync: Date.now() }
      })

      if (response.success) {
        console.log('✅ [Storage] Data saved to extension successfully')
        return true
      } else {
        console.warn('⚠️ [Storage] Extension save failed:', response.error)
      }
    } catch (error) {
      console.warn('⚠️ [Storage] Extension save error:', error)
    }

    // Extension'a kaydedemese bile localStorage'a kaydedildi
    return localSaved
  }

  /**
   * localStorage'dan veri al
   */
  private getFromLocalStorage(): StorageData | null {
    try {
      const token = localStorage.getItem(this.STORAGE_KEYS.TOKEN)
      const isGuestStr = localStorage.getItem(this.STORAGE_KEYS.IS_GUEST)
      const userStr = localStorage.getItem(this.STORAGE_KEYS.USER)
      const lastSyncStr = localStorage.getItem(this.STORAGE_KEYS.SYNC_TIME)

      if (!token && !userStr) return null

      const data: StorageData = {
        lastSync: lastSyncStr ? parseInt(lastSyncStr) : undefined
      }

      if (token) data.token = token
      if (isGuestStr) data.is_guest = isGuestStr === 'true'
      if (userStr) {
        try {
          data.user = JSON.parse(userStr)
        } catch {
          console.warn('⚠️ [Storage] Invalid user data in localStorage')
        }
      }

      console.log('📱 [Storage] Data retrieved from localStorage')
      return data
    } catch (error) {
      console.error('❌ [Storage] localStorage read error:', error)
      return null
    }
  }

  /**
   * localStorage'a veri kaydet
   */
  private saveToLocalStorage(data: Partial<StorageData>): boolean {
    try {
      if (data.token !== undefined) {
        if (data.token) {
          localStorage.setItem(this.STORAGE_KEYS.TOKEN, data.token)
        } else {
          localStorage.removeItem(this.STORAGE_KEYS.TOKEN)
        }
      }

      if (data.is_guest !== undefined) {
        localStorage.setItem(this.STORAGE_KEYS.IS_GUEST, data.is_guest.toString())
      }

      if (data.user !== undefined) {
        if (data.user) {
          localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(data.user))
        } else {
          localStorage.removeItem(this.STORAGE_KEYS.USER)
        }
      }

      localStorage.setItem(this.STORAGE_KEYS.SYNC_TIME, Date.now().toString())
      console.log('📱 [Storage] Data saved to localStorage')
      return true
    } catch (error) {
      console.error('❌ [Storage] localStorage save error:', error)
      return false
    }
  }

  /**
   * Extension'dan gelen veriyi localStorage'a senkronize et
   */
  private async syncToLocalStorage(extensionData: StorageData): Promise<void> {
    try {
      if (extensionData.token) {
        localStorage.setItem(this.STORAGE_KEYS.TOKEN, extensionData.token)
      }
      if (extensionData.is_guest !== undefined) {
        localStorage.setItem(this.STORAGE_KEYS.IS_GUEST, extensionData.is_guest.toString())
      }
      if (extensionData.user) {
        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(extensionData.user))
      }
      localStorage.setItem(this.STORAGE_KEYS.SYNC_TIME, Date.now().toString())
      console.log('🔄 [Storage] Extension data synced to localStorage')
    } catch (error) {
      console.error('❌ [Storage] Sync to localStorage failed:', error)
    }
  }

  /**
   * Website açılışında çağrılır - Extension storage'ı kontrol eder
   */
  async initializeStorage(): Promise<StorageData | null> {
    console.log('🚀 [Storage] Initializing storage...')
    return await this.getFromExtension()
  }

  /**
   * Giriş/kayıt sonrası çağrılır - Token'ı extension'a da kaydeder
   */
  async saveAuthData(authData: {
    token: string
    user?: any
    is_guest?: boolean
  }): Promise<boolean> {
    console.log('🔐 [Storage] Saving auth data...', { 
      hasToken: !!authData.token,
      hasUser: !!authData.user,
      isGuest: authData.is_guest 
    })
    
    return await this.saveToExtension({
      token: authData.token,
      user: authData.user,
      is_guest: authData.is_guest ?? false
    })
  }

  /**
   * Token al
   */
  async getToken(): Promise<string | null> {
    const data = await this.getFromExtension()
    return data?.token || null
  }

  /**
   * Kullanıcı bilgilerini al
   */
  async getUser(): Promise<any | null> {
    const data = await this.getFromExtension()
    return data?.user || null
  }

  /**
   * Guest durumunu al
   */
  async getIsGuest(): Promise<boolean> {
    const data = await this.getFromExtension()
    return data?.is_guest ?? true
  }

  /**
   * Çıkış yap - Tüm verileri temizle
   */
  async logout(): Promise<boolean> {
    console.log('🚪 [Storage] Logging out...')
    
    // Extension'dan temizle
    if (this.isExtensionAvailable()) {
      try {
        await this.sendMessageToExtension({ action: 'CLEAR_STORAGE' })
      } catch (error) {
        console.warn('⚠️ [Storage] Extension clear failed:', error)
      }
    }

    // localStorage'dan temizle
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      console.log('🧹 [Storage] Storage cleared')
      return true
    } catch (error) {
      console.error('❌ [Storage] Clear storage error:', error)
      return false
    }
  }

  /**
   * Senkronizasyon durumunu kontrol et
   */
  async checkSyncStatus(): Promise<{
    isExtensionAvailable: boolean
    lastSync?: number
    needsSync: boolean
  }> {
    const isExtensionAvailable = this.isExtensionAvailable()
    const data = await this.getFromExtension()
    const lastSync = data?.lastSync
    const needsSync = !lastSync || (Date.now() - lastSync) > 5 * 60 * 1000 // 5 dakika

    return {
      isExtensionAvailable,
      lastSync,
      needsSync
    }
  }

  /**
   * Debug bilgileri
   */
  async getDebugInfo(): Promise<{
    browser: string
    hasExtension: boolean
    storageData: StorageData | null
    syncStatus: any
  }> {
    const storageData = await this.getFromExtension()
    const syncStatus = await this.checkSyncStatus()

    return {
      browser: this.browserType,
      hasExtension: this.isExtensionAvailable(),
      storageData,
      syncStatus
    }
  }

  /**
   * Extension ortamında mı kontrol et
   */
  private isExtensionEnvironment(): boolean {
    return this.isExtensionAvailable()
  }

  /**
   * Runtime objesini al
   */
  private getRuntime() {
    if (this.browserType === 'firefox') {
      return window.browser
    }
    if (this.browserType === 'chrome') {
      return window.chrome
    }
    return null
  }

  /**
   * Generic get metodu
   */
  private async get(key: string): Promise<string | null> {
    try {
      if (this.isExtensionEnvironment()) {
        const runtime = this.getRuntime()
        if (runtime?.storage?.local?.get) {
          const result = await runtime.storage.local.get(key)
          return result[key] || null
        }
      }
      // Fallback to localStorage
      return localStorage.getItem(key)
    } catch (error) {
      console.error('Error getting data:', error)
      return null
    }
  }

  /**
   * Generic set metodu
   */
  private async set(key: string, value: string): Promise<void> {
    try {
      if (this.isExtensionEnvironment()) {
        const runtime = this.getRuntime()
        if (runtime?.storage?.local?.set) {
          await runtime.storage.local.set({ [key]: value })
          return
        }
      }
      // Fallback to localStorage
      localStorage.setItem(key, value)
    } catch (error) {
      console.error('Error setting data:', error)
      throw error
    }
  }

  async getUserData(): Promise<StorageData | null> {
    try {
      const data = await this.get(this.STORAGE_KEYS.USER_DATA)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error getting user data:', error)
      return null
    }
  }

  async saveUserData(userData: StorageData): Promise<boolean> {
    try {
      await this.set(this.STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
      return true
    } catch (error) {
      console.error('Error saving user data:', error)
      return false
    }
  }

  async clearStorage(): Promise<boolean> {
    try {
      if (this.isExtensionEnvironment()) {
        const runtime = this.getRuntime()
        if (runtime?.storage?.local?.clear) {
          await runtime.storage.local.clear()
        }
      } else {
        // Web environment - localStorage'ı temizle
        Object.values(this.STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key)
        })
      }
      return true
    } catch (error) {
      console.error('Error clearing storage:', error)
      return false
    }
  }
}

// Singleton instance
export const storageService = new StorageService()
export default storageService

// Global browser types for Firefox compatibility
declare global {
  interface Window {
    browser?: {
      runtime?: {
        id?: string;
        lastError?: { message: string };
        sendMessage?: (message: any) => Promise<any>;
      };
      storage?: {
        local?: {
          get: (keys?: string | string[] | null) => Promise<{ [key: string]: any }>;
          set: (items: { [key: string]: any }) => Promise<void>;
          remove: (keys: string | string[]) => Promise<void>;
          clear: () => Promise<void>;
        };
      };
    };
  }
}