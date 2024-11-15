import React from "react";
import classNames from "classnames";
import { SidenavItemProps, SidenavProps } from "@/types/ui/sidenav";

const Sidenav: React.FC<SidenavProps> = (props) => {
  const { navItems, walletAddress, onConnectWalletClick, onDisconnectWalletClick, userBalance } = props;

  return (
    <div className="h-full px-6 bg-background border-r border-r-border-primary max-w-[400px] flex flex-col">
      {/* Logo */}
      <a href="/" className="flex py-3 mb-6 border-b border-b-border-primary">
        <img src="/layer_logo.svg" width={260} height={120} alt="LAYER Logo" />
      </a>

      {/* Wallet Section */}
      <div className="mb-6 p-4 border border-border-primary rounded-lg">
        {walletAddress ? (
          <div className="space-y-2">
            {userBalance !== undefined && (
              <div className="flex items-center text-text-primary text-sm font-semibold">
                <span className="mr-1">{userBalance.toFixed(2)}</span>
                <span className="text-text-secondary">Built on LAYER</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 overflow-hidden rounded-md">
                <img
                  className="max-w-full"
                  src={`https://api.dicebear.com/9.x/glass/svg?seed=${walletAddress}`}
                  alt="User Avatar"
                />
              </div>
              <p className="text-text-primary text-sm">
                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </p>
            </div>
            <button
              onClick={onDisconnectWalletClick}
              className="w-full text-text-primary text-sm py-2 px-2 font-bold hover:bg-background-interactive-hover rounded-md"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={onConnectWalletClick}
            className="w-full text-text-primary rounded-md text-sm py-2 px-2 font-bold bg-background-brand flex items-center justify-center"
          >
            <span className="material-icons mr-1">sensors</span>
            <span>Connect</span>
          </button>
        )}
      </div>

      {/* Navigation Items */}
      {/* <div className="flex-grow">
        {navItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            target={item.target}
            className={classNames(
              "flex items-center space-x-2 px-2 py-2 rounded-md mb-1 text-sm",
              {
                "bg-background-interactive-hover": item.active,
                "hover:bg-background-interactive-hover": !item.active,
              }
            )}
          >
            <span className="material-icons text-text-secondary text-base">
              {item.icon}
            </span>
            <span
              className={classNames("text-text-primary", {
                "font-bold": item.active,
              })}
            >
              {item.label}
            </span>
          </a>
        ))}
      </div> */}

      {/* Created By Section */}
      <div className="mt-auto mb-4 p-3 bg-background-primary rounded-lg border border-border-primary">
        <p className="text-text-secondary text-xs text-center">
          Created by Sanjay, Ethan, Souradeep, and Varun
        </p>
      </div>
    </div>
  );
};

export default Sidenav;
