/**
 * vite plugin
 */

import legacy from '@vitejs/plugin-legacy';
// @vitejs/plugin-react-refresh 已被启用
// 使用 @vitejs/plugin-react代替
import react from '@vitejs/plugin-react';
import type { PluginOption } from 'vite';
import viteCompression from 'vite-plugin-compression';
import svgr from 'vite-plugin-svgr';

import {
  VITE_APP_ANALYZE,
  VITE_APP_COMPRESS_GZIP,
  VITE_APP_COMPRESS_GZIP_DELETE_FILE,
  VITE_APP_LEGACY,
} from '../../constant';
import configVisualizerPlugin from './visualizer';

export function createVitePlugins(viteEnv: string, isBuild: boolean) {
  const vitePlugins: (PluginOption | PluginOption[])[] = [
    // have to
    react(),
  ];

  // @vitejs/plugin-legacy
  VITE_APP_LEGACY &&
    isBuild &&
    vitePlugins.push(
      legacy({
        targets: ['chrome 52'],
        renderLegacyChunks: true,
      }),
    );

  // vite-plugin-style-import
  // vitePlugins.push(configStyleImportPlugin(isBuild));

  // rollup-plugin-visualizer
  VITE_APP_ANALYZE && vitePlugins.push(configVisualizerPlugin());

  //vite-plugin-theme
  // vitePlugins.push(configThemePlugin(isBuild));

  // The following plugins only work in the production environment
  if (isBuild) {
    // rollup-plugin-gzip
    VITE_APP_COMPRESS_GZIP &&
      vitePlugins.push(
        viteCompression({ deleteOriginFile: VITE_APP_COMPRESS_GZIP_DELETE_FILE }),
      );
  }
  vitePlugins.push(
    svgr({
      include: '**/*.svg',
      svgrOptions: { icon: true },
    }),
  );
  return vitePlugins;
}
