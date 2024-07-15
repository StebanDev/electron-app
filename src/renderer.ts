/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import "./index.css";

console.log('👋 This message is being logged by "renderer.ts", included via Vite');

const logonButton = document.getElementById("logon");
const datebutton = document.getElementById("datebutton");
const dateElement = document.getElementById("dateid");

// logonButton.addEventListener("click", async () => {
//   await window.electronAPI.createAppConnectionPool();
//   console.log("Connection pool created");
// });

// datebutton.addEventListener("click", async () => {
//   const currDate = await window.electronAPI.doQuery();
//   dateElement.innerText = currDate;
// });

const saveButton = document.getElementById("saveSettings");

const userInput = document.querySelector("#username") as HTMLInputElement;
const passwordInput = document.querySelector("#password") as HTMLInputElement;
const connectStringInput = document.querySelector("#connectString") as HTMLInputElement;

window.electronAPI.onLoadConfig((value) => {
  const { username, password, connectString } = value.database;
  userInput.value = username;
  passwordInput.value = password;
  connectStringInput.value = connectString;

  const kdiTable = document.querySelector("#kdi");
  const dataIndicators = value.dataIndicators;

  for (const kdi of dataIndicators) {
    const { name, sourceTable, sourceColumn, targetTable, targetColumn } = kdi;

    const row = document.createElement("tr");
    row.appendChild(createDataCell(name));
    row.appendChild(createDataCell(sourceTable));
    row.appendChild(createDataCell(sourceColumn));
    row.appendChild(createDataCell(targetTable));
    row.appendChild(createDataCell(targetColumn));
    row.appendChild(createDataCell(createButton("delete")));
    kdiTable.appendChild(row);
  }
});

saveButton.addEventListener("click", async () => {
  const user = userInput.value;
  const password = passwordInput.value;
  const connectString = connectStringInput.value;
  const kdiTable = document.querySelector("#kdi");
  const kdiValues = Array.from(kdiTable.children).map((tr) =>
    Array.from(tr.children).map((td) => td.textContent)
  );
  console.log("Saving settings...", kdiValues);

  await window.electronAPI.saveSettings(user, password, connectString, kdiValues);
});

const addKDIButton = document.querySelector("#addKDI");

addKDIButton.addEventListener("click", () => {
  const name = (document.querySelector("#name") as HTMLInputElement).value;
  const sourceTable = (document.querySelector("#sourceTable") as HTMLInputElement).value;
  const sourceColumn = (document.querySelector("#sourceColumn") as HTMLInputElement).value;
  const targetTable = (document.querySelector("#targetTable") as HTMLInputElement).value;
  const targetColumn = (document.querySelector("#targetColumn") as HTMLInputElement).value;

  const kdiTable = document.querySelector("#kdi");
  const newRow = document.createElement("tr");
  newRow.appendChild(createDataCell(name));
  newRow.appendChild(createDataCell(sourceTable));
  newRow.appendChild(createDataCell(sourceColumn));
  newRow.appendChild(createDataCell(targetTable));
  newRow.appendChild(createDataCell(targetColumn));
  // newRow.appendChild(createDataCell(createButton("update")));
  newRow.appendChild(createDataCell(createButton("delete")));
  kdiTable.appendChild(newRow);
});

function createDataCell(value: string | HTMLElement) {
  const td = document.createElement("td");
  if (value instanceof HTMLElement) {
    td.appendChild(value);
  } else {
    td.textContent = value;
    td.contentEditable = "true";
  }
  return td;
}

function createButton(value: string) {
  const button = document.createElement("button");
  button.textContent = value;
  button.onclick = () => {
    const rowToDelete = button.parentElement.parentElement;
    rowToDelete.remove();
  };
  return button;
}
