/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is custom-maintained for integrated About Us text/image block access.
 */

export const Cp_aboutustextimaegeblocksescp_type = {
  1: 'Image',
  2: 'Text',
} as const;
export type Cp_aboutustextimaegeblocksescp_type = keyof typeof Cp_aboutustextimaegeblocksescp_type;

export const Cp_aboutustextimaegeblocksesstatecode = {
  0: 'Active',
  1: 'Inactive',
} as const;
export type Cp_aboutustextimaegeblocksesstatecode = keyof typeof Cp_aboutustextimaegeblocksesstatecode;

export interface Cp_aboutustextimaegeblocksesBase {
  cp_aboutustextimaegeblocksid?: string;
  "cp_aboutussubcategory@odata.bind"?: string;
  cp_type?: Cp_aboutustextimaegeblocksescp_type;
  cp_imagecaption?: string;
  cp_text?: string;
  cp_imagesource?: string;
  cp_sortorder?: number;
  statecode?: Cp_aboutustextimaegeblocksesstatecode;
}

export interface Cp_aboutustextimaegeblockses extends Cp_aboutustextimaegeblocksesBase {
  _cp_aboutussubcategory_value?: string;
  cp_imagesource_url?: string;
  statecodename?: string;
}

export type Cp_aboutustextimaegeblocksesImageColumnName = 'cp_imagesource';

export type Cp_aboutustextimaegeblocksesUploadColumnName = Cp_aboutustextimaegeblocksesImageColumnName;
