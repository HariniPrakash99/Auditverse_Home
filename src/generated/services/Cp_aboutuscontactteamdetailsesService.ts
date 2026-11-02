/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is custom-maintained for integrated About Us contact details access.
 */

import type { Cp_aboutuscontactteamdetailsesBase, Cp_aboutuscontactteamdetailses } from '../models/Cp_aboutuscontactteamdetailsesModel';
import type { GetEntityMetadataOptions, EntityMetadata } from '@microsoft/power-apps/data/metadata/dataverse';
import type { IGetOptions, IGetAllOptions } from '../models/CommonModels';
import type { IOperationResult } from '@microsoft/power-apps/data';
import { dataSourcesInfo } from '../../../.power/schemas/appschemas/dataSourcesInfo';
import { getClient } from '@microsoft/power-apps/data';

export class Cp_aboutuscontactteamdetailsesService {
  private static readonly dataSourceName = 'cp_aboutuscontactteamdetailses';

  private static readonly client = getClient(dataSourcesInfo);

  public static async create(record: Cp_aboutuscontactteamdetailsesBase): Promise<IOperationResult<Cp_aboutuscontactteamdetailses>> {
    const result = await Cp_aboutuscontactteamdetailsesService.client.createRecordAsync<Cp_aboutuscontactteamdetailsesBase, Cp_aboutuscontactteamdetailses>(
      Cp_aboutuscontactteamdetailsesService.dataSourceName,
      record,
    );
    return result;
  }

  public static async update(id: string, changedFields: Partial<Cp_aboutuscontactteamdetailsesBase>): Promise<IOperationResult<Cp_aboutuscontactteamdetailses>> {
    const result = await Cp_aboutuscontactteamdetailsesService.client.updateRecordAsync<Partial<Cp_aboutuscontactteamdetailsesBase>, Cp_aboutuscontactteamdetailses>(
      Cp_aboutuscontactteamdetailsesService.dataSourceName,
      id,
      changedFields,
    );
    return result;
  }

  public static async get(id: string, options?: IGetOptions): Promise<IOperationResult<Cp_aboutuscontactteamdetailses>> {
    const result = await Cp_aboutuscontactteamdetailsesService.client.retrieveRecordAsync<Cp_aboutuscontactteamdetailses>(
      Cp_aboutuscontactteamdetailsesService.dataSourceName,
      id,
      options,
    );
    return result;
  }

  public static async getAll(options?: IGetAllOptions): Promise<IOperationResult<Cp_aboutuscontactteamdetailses[]>> {
    const result = await Cp_aboutuscontactteamdetailsesService.client.retrieveMultipleRecordsAsync<Cp_aboutuscontactteamdetailses>(
      Cp_aboutuscontactteamdetailsesService.dataSourceName,
      options,
    );
    return result;
  }

  public static getMetadata(
    options: GetEntityMetadataOptions<Cp_aboutuscontactteamdetailses> = {},
  ): Promise<IOperationResult<Partial<EntityMetadata>>> {
    return Cp_aboutuscontactteamdetailsesService.client.executeAsync({
      dataverseRequest: {
        action: 'getEntityMetadata',
        parameters: {
          tableName: Cp_aboutuscontactteamdetailsesService.dataSourceName,
          options: options as GetEntityMetadataOptions,
        },
      },
    });
  }
}
