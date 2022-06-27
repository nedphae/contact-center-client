import path from 'path';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Titlebar, Color } from 'custom-electron-titlebar';

const RESOURCES_PATH =
  process.env.NODE_ENV === 'production'
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

export type Channels = 'ipc-example' | string;

// let titlebar;

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
});

window.addEventListener('DOMContentLoaded', () => {
  // Title bar implemenation
  // titlebar = new Titlebar({
  //   backgroundColor: Color.fromHex('#323233'),
  //   itemBackgroundColor: Color.fromHex('#121212'),
  //   containerOverflow: 'hidden',
  //   icon: getAssetPath('icon.png'), // Add this line
  // });
});
