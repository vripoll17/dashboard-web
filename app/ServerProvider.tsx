"use client";

import React, { createContext, useContext, useState } from "react";

type ServerContextValue = {
  serverId: string;
  serverName: string;
  setServer: (id: string, name: string) => void;
};

const ServerContext = createContext<ServerContextValue>({
  serverId: "",
  serverName: "",
  setServer: () => {},
});

export function ServerProvider({ children }: { children: React.ReactNode }) {
  const [serverId, setServerId] = useState("");
  const [serverName, setServerName] = useState("");

  const setServer = (id: string, name: string) => {
    setServerId(id);
    setServerName(name);
  };

  return (
    <ServerContext.Provider value={{ serverId, serverName, setServer }}>
      {children}
    </ServerContext.Provider>
  );
}

export function useServer() {
  return useContext(ServerContext);
}