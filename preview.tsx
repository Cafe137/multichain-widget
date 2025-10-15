import { createRoot } from 'react-dom/client'
import { MultichainWidget } from './src/index'

const root = document.getElementById('root') as HTMLDivElement

createRoot(root).render(<MultichainWidget />)
