import { useState } from 'react'
import { useTranslation, LANGUAGE_OPTIONS } from './i18n'
import { Button } from './components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const { t, language, changeLanguage } = useTranslation()

  const handleLanguageChange = (value: string) => {
    changeLanguage(value as 'tr' | 'en')
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGE_OPTIONS.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      
      <h1>Heybe - {t('common.loading')}</h1>
      
      <div className="card">
        <Button onClick={() => setCount((count) => count + 1)}>
          {t('common.save')} {count}
        </Button>
        <p>
          {t('products.myProducts')} - {t('auth.loginRegister')}
        </p>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">{t('common.language')} Test:</h3>
        <ul className="space-y-1 text-sm">
          <li>• {t('auth.login')} / {t('auth.register')}</li>
          <li>• {t('products.addProduct')}</li>
          <li>• {t('extension.addToHeybe')}</li>
          <li>• {t('common.success')}</li>
        </ul>
      </div>
      
      <p className="read-the-docs">
        {t('common.language')}: {language.toUpperCase()}
      </p>
    </>
  )
}

export default App
