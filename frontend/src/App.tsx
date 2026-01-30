import { WalletConnect } from '@/components/WalletConnect'
import { CreateBillSplit } from '@/components/CreateBillSplit'
import { PayBill } from '@/components/PayBill'
import { ManageSplits } from '@/components/ManageSplits'
import { ActiveSplits } from '@/components/ActiveSplits'
import { Layers, Github, ExternalLink, Receipt, CreditCard, Settings, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary">
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
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16 space-y-4 md:space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Live on Stacks Mainnet
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight px-4">
            Split Bills with{' '}
            <span className="text-primary">Clarity</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground px-4">
            Create bill splits with fixed amounts per payer. Secure, transparent, and built on Bitcoin via Stacks.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 px-4">
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://explorer.hiro.so/address/SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y.split-stack-v2?chain=mainnet"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Contract
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://github.com/Dominion116/SplitStack"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </Button>
          </div>
        </div>

        {/* Create Split Section */}
        <section className="mb-12 md:mb-16">
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Receipt className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">Create a Split</h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground px-4">
              Set up a new bill split with fixed amounts for each payer
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <CreateBillSplit />
          </div>
        </section>

        {/* Look Up Split Section */}
        <section className="mb-12 md:mb-16">
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Search className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">Find a Split</h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground px-4">
              Look up a split by ID to see details and check if you need to pay
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ActiveSplits />
          </div>
        </section>

        {/* Actions Grid */}
        <section className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Pay Bill */}
            <div className="space-y-4">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-xl md:text-2xl font-bold">Pay Your Share</h2>
                </div>
                <p className="text-sm text-muted-foreground px-4 md:px-0">
                  Pay your assigned amount for a split
                </p>
              </div>
              <PayBill />
            </div>

            {/* Manage Splits */}
            <div className="space-y-4">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <Settings className="h-5 w-5 text-primary" />
                  <h2 className="text-xl md:text-2xl font-bold">Manage</h2>
                </div>
                <p className="text-sm text-muted-foreground px-4 md:px-0">
                  Withdraw or cancel your splits
                </p>
              </div>
              <ManageSplits />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 md:mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                href="https://explorer.hiro.so/address/SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y.split-stack-v2?chain=mainnet"
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
