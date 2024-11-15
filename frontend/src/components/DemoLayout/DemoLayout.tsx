import React from "react";
import Sidenav from "../Sidenav/Sidenav";

const DemoLayout = () => {
  return (
    <div className="flex h-[calc(100vh-32px)]">
      <Sidenav
        navItems={[
          {
            label: "Nav Item 1",
            icon: "arrow_forward_ios",
            active: true,
            href: "#",
          },
          {
            label: "Nav Item 2",
            icon: "arrow_forward_ios",
            active: false,
            href: "#",
          },
        ]}
        walletAddress="GARX7YOCGEIOA5YQXCHA6ZM7764KLCFRVTTQJQZMPLJPCZKHY4KATVM3"
        onConnectWalletClick={() => {}}
        onDisconnectWalletClick={() => {}}
        userBalance={0}
      />
      <div className="w-full">
        <div className="p-6">Content goes here</div>
      </div>
    </div>
  );
};

export default DemoLayout;