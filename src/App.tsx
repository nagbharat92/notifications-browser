import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/context/ThemeContext'
import { HomePage } from '@/pages'

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <HomePage />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
