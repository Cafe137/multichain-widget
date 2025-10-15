import { createRoot } from 'react-dom/client'
import { MultichainWidget } from './MultichainWidget'

const rootElement = document.getElementById('root')
if (rootElement) {
    const root = createRoot(rootElement)
    root.render(<MultichainWidget />)
}
