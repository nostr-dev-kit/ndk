import { useWalletStore } from '../stores/wallet';

const useNDKWallet = () => {
    const activeWallet = useWalletStore(s => s.activeWallet);
    const setActiveWallet = useWalletStore(s => s.setActiveWallet);
    const balances = useWalletStore(s => s.balances);
    const setBalances = useWalletStore(s => s.setBalances);
    const nutzapMonitor = useWalletStore(s => s.nutzapMonitor);
    const setNutzapMonitor = useWalletStore(s => s.setNutzapMonitor);

    return { activeWallet, setActiveWallet, balances, setBalances, nutzapMonitor, setNutzapMonitor };
}

export {
    useNDKWallet,
}