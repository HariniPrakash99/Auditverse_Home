/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is custom-maintained for integrated About Us subcategory access.
 */

import type { Cp_aboutussubcategoriesesBase, Cp_aboutussubcategorieses } from '../models/Cp_aboutussubcategoriesesModel';
import type { GetEntityMetadataOptions, EntityMetadata } from '@microsoft/power-apps/data/metadata/dataverse';
import type { IGetOptions, IGetAllOptions } from '../models/CommonModels';
import type { IOperationResult } from '@microsoft/power-apps/data';
import { dataSourcesInfo } from '../../../.power/schemas/appschemas/dataSourcesInfo';
import { getClient } from '@microsoft/power-apps/data';

export class Cp_aboutussubcategoriesesService {
  private static readonly dataSourceName = 'cp_aboutussubcategorieses';

  private static readonly client = getClient(dataSourcesInfo);

  public static async create(record: Cp_aboutussubcategoriesesBase): Promise<IOperationResult<Cp_aboutussubcategorieses>> {
    const result = await Cp_aboutussubcategoriesesService.client.createRecordAsync<Cp_aboutussubcategoriesesBase, Cp_aboutussubcategorieses>(
      Cp_aboutussubcategoriesesService.dataSourceName,
      record,
    );
    return result;
  }

  public static async update(id: string, changedFields: Partial<Cp_aboutussubcategoriesesBase>): Promise<IOperationResult<Cp_aboutussubcategorieses>> {
    const result = await Cp_aboutussubcategoriesesService.client.updateRecordAsync<Partial<Cp_aboutussubcategoriesesBase>, Cp_aboutussubcategorieses>(
      Cp_aboutussubcategoriesesService.dataSourceName,
      id,
      changedFields,
    );
    return result;
  }

  public static async get(id: string, options?: IGetOptions): Promise<IOperationResult<Cp_aboutussubcategorieses>> {
    const result = await Cp_aboutussubcategoriesesService.client.retrieveRecordAsync<Cp_aboutussubcategorieses>(
      Cp_aboutussubcategoriesesService.dataSourceName,
      id,
      options,
    );
    return result;
  }

  public static async getAll(options?: IGetAllOptions): Promise<IOperationResult<Cp_aboutussubcategorieses[]>> {
    const result = await Cp_aboutussubcategoriesesService.client.retrieveMultipleRecordsAsync<Cp_aboutussubcategorieses>(
      Cp_aboutussubcategoriesesService.dataSourceName,
      options,
    );
    return result;
  }

  public static getMetadata(
    options: GetEntityMetadataOptions<Cp_aboutussubcategorieses> = {},
  ): Promise<IOperationResult<Partial<EntityMetadata>>> {
    return Cp_aboutussubcategoriesesService.client.executeAsync({
      dataverseRequest: {
        action: 'getEntityMetadata',
        parameters: {
          tableName: Cp_aboutussubcategoriesesService.dataSourceName,
          options: options as GetEntityMetadataOptions,
        },
      },
    });
  }
}
