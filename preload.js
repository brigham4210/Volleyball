const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onResetFormation: (callback) => ipcRenderer.on('reset-formation', callback),
  onSaveFormation: (callback) => ipcRenderer.on('save-formation', callback),
  onLoadFormation: (callback) => ipcRenderer.on('load-formation', callback),
  onEditLabels: (callback) => ipcRenderer.on('edit-labels', callback),
  onResetPositions: (callback) => ipcRenderer.on('reset-positions', callback),
  onShowAbout: (callback) => ipcRenderer.on('show-about', callback)
});