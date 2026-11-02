/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is custom-maintained for integrated About Us category access.
 */

export const Cp_aboutuscategoriesesstatecode = {
  0: 'Active',
  1: 'Inactive',
} as const;
export type Cp_aboutuscategoriesesstatecode = keyof typeof Cp_aboutuscategoriesesstatecode;

export interface Cp_aboutuscategoriesesBase {
  cp_aboutuscategoriesid?: string;
  cp_category: string;
  cp_havesubcategory?: boolean;
  cp_sortorder?: number;
  statecode?: Cp_aboutuscategoriesesstatecode;
}

export interface Cp_aboutuscategorieses extends Cp_aboutuscategoriesesBase {
  cp_havesubcategoryname?: string;
  statecodename?: string;
}
