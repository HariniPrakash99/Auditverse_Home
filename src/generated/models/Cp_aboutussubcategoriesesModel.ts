/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is custom-maintained for integrated About Us subcategory access.
 */

export const Cp_aboutussubcategoriesesstatecode = {
  0: 'Active',
  1: 'Inactive',
} as const;
export type Cp_aboutussubcategoriesesstatecode = keyof typeof Cp_aboutussubcategoriesesstatecode;

export interface Cp_aboutussubcategoriesesBase {
  cp_aboutussubcategoriesid?: string;
  cp_category: string;
  cp_refcategory?: string;
  cp_refsubcategory?: string;
  cp_resourcename?: string;
  cp_showcontactteam?: boolean;
  cp_sortorder?: number;
  cp_subcategory: string;
  cp_teammail?: string;
  statecode?: Cp_aboutussubcategoriesesstatecode;
}

export interface Cp_aboutussubcategorieses extends Cp_aboutussubcategoriesesBase {
  _cp_category_value?: string;
  statecodename?: string;
}
