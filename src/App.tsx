import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import FinancialDashboard from './components/FinancialDashboard';
import './App.css'

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <FinancialDashboard />
    </I18nextProvider>
  )
}

export default App
