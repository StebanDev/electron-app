// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// preload.js

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  doQuery: () => ipcRenderer.invoke("doQuery"),
  createAppConnectionPool: (user: string, password: string, connectString: string) =>
    ipcRenderer.send("createAppConnectionPool", user, password, connectString),
});
