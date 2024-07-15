import { app, BrowserWindow, ipcMain, Menu } from "electron";
import path from "path";
import YAML from "yaml";
import fs from "fs";
import * as oracle from "./oracle";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}
async function doQueryFn() {
  const date = await oracle.doDateQuery();
  return date;
}
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // const configFilePath = `${path.parse(app.getPath("exe")).dir}/config.yml`;
  const configFilePath = `${app.getAppPath()}/config.yml`;
  const file = fs.readFileSync(configFilePath, "utf8");
  const parsedConfig = YAML.parse(file);
  console.log("parsed", parsedConfig);

  // mainWindow.webContents.openDevTools();

  setTimeout(() => mainWindow.webContents.send("load-config", parsedConfig), 500);

  const { username, password, connectString } = parsedConfig.database;

  ipcMain.on("createAppConnectionPool", async (event) => {
    await oracle.createAppConnectionPool(username, password, connectString);
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    win.setTitle(`Electron Oracle Database Demo: ${username}@${connectString}`);
  });

  ipcMain.on("saveSettings", async (event, username, password, connectString, kdiValues) => {
    const dataIndicators = kdiValues.map((kdi: string[]) => {
      const [name, sourceTable, sourceColumn, targetTable, targetColumn] = kdi;
      return { name, sourceTable, sourceColumn, targetTable, targetColumn };
    });
    const newConfig = YAML.stringify({
      database: { username, password, connectString },
      dataIndicators,
    });
    fs.writeFileSync("config2.yml", newConfig, "utf-8");
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  ipcMain.handle("doQuery", doQueryFn);

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
