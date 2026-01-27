import { WalletConnect } from './components/WalletConnect';
import { CreateSplit } from './components/CreateSplit';
import { PaymentInteraction } from './components/PaymentInteraction';
import { Layers } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen pb-20">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-bg-dark/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <Layers className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Split<span className="text-primary">Stack</span>
            </span>
          </div>
          <WalletConnect />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 mt-16 text-center">
        <div className="max-w-3xl mx-auto mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Transparent <span className="gradient-text">Profit Sharing</span>.
          </h1>
          <p className="text-xl text-text-muted leading-relaxed">
            Distribute funds automatically across teams, creators, or projects. 
            Secure, verifiable, and built on Stacks.
          </p>
        </div>

        <CreateSplit />
        
        <div className="max-w-5xl mx-auto">
          <PaymentInteraction />
        </div>
      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-20"></div>
    </div>
  );
}

export default App;
