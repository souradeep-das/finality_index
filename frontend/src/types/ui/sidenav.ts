export interface SidenavItemProps {
  label: string;
  icon: any;
  active: boolean;
  href: string;
  target?: string;
}

export interface SidenavProps {
  navItems: SidenavItemProps[];
  walletAddress?: string;
  onConnectWalletClick: () => void;
  onDisconnectWalletClick: () => void;
  userBalance?: number;
}