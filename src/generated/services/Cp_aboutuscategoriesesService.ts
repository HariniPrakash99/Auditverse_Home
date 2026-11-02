/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is custom-maintained for integrated About Us category access.
 */

import type { Cp_aboutuscategoriesesBase, Cp_aboutuscategorieses } from '../models/Cp_aboutuscategoriesesModel';
import type { GetEntityMetadataOptions, EntityMetadata } from '@microsoft/power-apps/data/metadata/dataverse';
import type { IGetOptions, IGetAllOptions } from '../models/CommonModels';
import type { IOperationResult } from '@microsoft/power-apps/data';
import { dataSourcesInfo } from '../../../.power/schemas/appschemas/dataSourcesInfo';
import { getClient } from '@microsoft/power-apps/data';

export class Cp_aboutuscategoriesesService {
  private static readonly dataSourceName = 'cp_aboutuscategorieses';

  private static readonly client = getClient(dataSourcesInfo);

  public static async create(record: Cp_aboutuscategoriesesBase): Promise<IOperationResult<Cp_aboutuscategorieses>> {
    const result = await Cp_aboutuscategoriesesService.client.createRecordAsync<Cp_aboutuscategoriesesBase, Cp_aboutuscategorieses>(
      Cp_aboutuscategoriesesService.dataSourceName,
      record,
    );
    return result;
  }

  public static async update(id: string, changedFields: Partial<Cp_aboutuscategoriesesBase>): Promise<IOperationResult<Cp_aboutuscategorieses>> {
    const result = await Cp_aboutuscategoriesesService.client.updateRecordAsync<Partial<Cp_aboutuscategoriesesBase>, Cp_aboutuscategorieses>(
      Cp_aboutuscategoriesesService.dataSourceName,
      id,
      changedFields,
    );
    return result;
  }

  public static async get(id: string, options?: IGetOptions): Promise<IOperationResult<Cp_aboutuscategorieses>> {
    const result = await Cp_aboutuscategoriesesService.client.retrieveRecordAsync<Cp_aboutuscategorieses>(
      Cp_aboutuscategoriesesService.dataSourceName,
      id,
      options,
    );
    return result;
  }

  public static async getAll(options?: IGetAllOptions): Promise<IOperationResult<Cp_aboutuscategorieses[]>> {
    const result = await Cp_aboutuscategoriesesService.client.retrieveMultipleRecordsAsync<Cp_aboutuscategorieses>(
      Cp_aboutuscategoriesesService.dataSourceName,
      options,
    );
    return result;
  }

  public static getMetadata(
    options: GetEntityMetadataOptions<Cp_aboutuscategorieses> = {},
  ): Promise<IOperationResult<Partial<EntityMetadata>>> {
    return Cp_aboutuscategoriesesService.client.executeAsync({
      dataverseRequest: {
        action: 'getEntityMetadata',
        parameters: {
          tableName: Cp_aboutuscategoriesesService.dataSourceName,
          options: options as GetEntityMetadataOptions,
        },
      },
    });
  }
}
