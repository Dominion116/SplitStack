import { WalletConnect } from '@/components/WalletConnect'
import { CreateSplit } from '@/components/CreateSplit'
import { PaymentInteraction } from '@/components/PaymentInteraction'
import { Layers, Github, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary">
                <Layers className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Split<span className="text-primary">Stack</span>
              </span>
            </div>
            <WalletConnect />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Live on Stacks Testnet
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Transparent{' '}
            <span className="gradient-text">Profit Sharing</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Distribute funds automatically across teams, creators, or projects. 
            Secure, verifiable, and built on Bitcoin via Stacks.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://explorer.hiro.so/txid/0x5b77864e589143fbdc3415af2e89fd6e4d95fa3660af52017e203637b1147c58?chain=testnet"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                View Contract
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a 
                href="https://github.com/Dominion116/SplitStack"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </Button>
          </div>
        </div>

        {/* Create Split Section */}
        <section className="mb-16">
          <div className="max-w-2xl mx-auto">
            <CreateSplit />
          </div>
        </section>

        {/* Payment Interaction Section */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Manage Payments</h2>
            <p className="text-muted-foreground">Send payments to splits or withdraw your accumulated share</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <PaymentInteraction />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Layers className="h-4 w-4" />
              <span>SplitStack — Built on Stacks</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a 
                href="https://github.com/Dominion116/SplitStack"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a 
                href="https://explorer.hiro.so/txid/0x5b77864e589143fbdc3415af2e89fd6e4d95fa3660af52017e203637b1147c58?chain=testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Explorer
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
