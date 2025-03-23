/**
 * Platform-agnostic storage interface that dynamically selects
 * the appropriate implementation for the current platform
 */

import * as WebStorage from './web';
import * as MobileStorage from './mobile';
import { isPlatformWeb } from '../platform';

// Dynamically choose the right implementation
export const Storage = isPlatformWeb() ? WebStorage : MobileStorage;

// Re-export the methods for convenience
export const getItem = Storage.getItem;
export const setItem = Storage.setItem;
export const removeItem = Storage.removeItem;
export const clear = Storage.clear;