import { TooltipProvider } from '@/components/ui/tooltip'
import { HomePage } from '@/pages'

function App() {
  return (
    <TooltipProvider>
      <HomePage />
    </TooltipProvider>
  )
}

export default App
