/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is custom-maintained for integrated About Us contact details access.
 */

export const Cp_aboutuscontactteamdetailsesstatecode = {
  0: 'Active',
  1: 'Inactive',
} as const;
export type Cp_aboutuscontactteamdetailsesstatecode = keyof typeof Cp_aboutuscontactteamdetailsesstatecode;

export interface Cp_aboutuscontactteamdetailsesBase {
  cp_aboutuscontactteamdetailsid?: string;
  "cp_aboutussubcategory@odata.bind"?: string;
  "cp_membername@odata.bind"?: string;
  cp_designation?: string;
  cp_role?: string;
  cp_sortorder?: number;
  statecode?: Cp_aboutuscontactteamdetailsesstatecode;
}

export interface Cp_aboutuscontactteamdetailses extends Cp_aboutuscontactteamdetailsesBase {
  _cp_aboutussubcategory_value?: string;
  _cp_membername_value?: string;
  cp_membernamename?: string;
  statecodename?: string;
}
