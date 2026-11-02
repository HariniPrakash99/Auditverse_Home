/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is custom-maintained for integrated About Us leadership details.
 */

export const Cp_aboutusleadershipdetailsesstatecode = {
  0: 'Active',
  1: 'Inactive',
} as const;
export type Cp_aboutusleadershipdetailsesstatecode = keyof typeof Cp_aboutusleadershipdetailsesstatecode;

export interface Cp_aboutusleadershipdetailsesBase {
  cp_aboutusleadershipdetailsid?: string;
  cp_leadership1title?: string;
  cp_description1?: string;
  cp_hierarchyimage1?: string;
  cp_leadership2title?: string;
  cp_description2?: string;
  cp_hierarchyimg2?: string;
  statecode?: Cp_aboutusleadershipdetailsesstatecode;
}

export interface Cp_aboutusleadershipdetailses extends Cp_aboutusleadershipdetailsesBase {
  cp_hierarchyimage1_url?: string;
  cp_hierarchyimg2_url?: string;
  cp_hierarchyimage2_url?: string;
  statecodename?: string;
}

export type Cp_aboutusleadershipdetailsesImageColumnName = 'cp_hierarchyimage1' | 'cp_hierarchyimg2';

export type Cp_aboutusleadershipdetailsesUploadColumnName = Cp_aboutusleadershipdetailsesImageColumnName;
