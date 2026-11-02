/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is custom-maintained for About Us text/image block configuration.
 */

export const Cp_aboutustextimageblocksconfigurationesstatecode = {
  0: 'Active',
  1: 'Inactive',
} as const;
export type Cp_aboutustextimageblocksconfigurationesstatecode = keyof typeof Cp_aboutustextimageblocksconfigurationesstatecode;

export interface Cp_aboutustextimageblocksconfigurationesBase {
  cp_aboutustextimageblocksconfigurationid?: string;
  cp_maximageblocks?: number;
  cp_maxtextblocks?: number;
  statecode?: Cp_aboutustextimageblocksconfigurationesstatecode;
}

export interface Cp_aboutustextimageblocksconfigurationes extends Cp_aboutustextimageblocksconfigurationesBase {
  statecodename?: string;
}
