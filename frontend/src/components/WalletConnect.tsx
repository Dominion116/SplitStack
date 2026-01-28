import { showConnect } from '@stacks/connect';
import { UserSession, AppConfig } from '@stacks/auth';
import { appDetails } from '../lib/stacks';
import { LogIn, LogOut, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const WalletConnect = () => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((data) => {
        setUserData(data);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  const connectWallet = () => {
    showConnect({
      appDetails,
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserData(null);
    window.location.reload();
  };

  if (userData) {
    const address = userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
    return (
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs text-text-muted">Connected Wallet</span>
          <span className="text-sm font-medium">{address.slice(0, 6)}...{address.slice(-4)}</span>
        </div>
        <button onClick={disconnectWallet} className="btn-secondary flex items-center gap-2">
          <LogOut size={18} />
          <span>Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <button onClick={connectWallet} className="btn-primary">
      <Wallet size={18} />
      <span>Connect Wallet</span>
    </button>
  );
};
