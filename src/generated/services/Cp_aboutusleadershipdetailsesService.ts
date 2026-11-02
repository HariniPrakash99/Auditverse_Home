/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is custom-maintained for integrated About Us leadership details.
 */

import type {
  Cp_aboutusleadershipdetailsesBase,
  Cp_aboutusleadershipdetailses,
  Cp_aboutusleadershipdetailsesUploadColumnName,
  Cp_aboutusleadershipdetailsesImageColumnName,
} from '../models/Cp_aboutusleadershipdetailsesModel';
import type { GetEntityMetadataOptions, EntityMetadata } from '@microsoft/power-apps/data/metadata/dataverse';
import type { IGetOptions, IGetAllOptions } from '../models/CommonModels';
import type { IOperationResult } from '@microsoft/power-apps/data';
import { dataSourcesInfo } from '../../../.power/schemas/appschemas/dataSourcesInfo';
import { getClient } from '@microsoft/power-apps/data';

export class Cp_aboutusleadershipdetailsesService {
  private static readonly dataSourceName = 'cp_aboutusleadershipdetailses';

  private static readonly client = getClient(dataSourcesInfo);

  public static async create(record: Cp_aboutusleadershipdetailsesBase): Promise<IOperationResult<Cp_aboutusleadershipdetailses>> {
    const result = await Cp_aboutusleadershipdetailsesService.client.createRecordAsync<Cp_aboutusleadershipdetailsesBase, Cp_aboutusleadershipdetailses>(
      Cp_aboutusleadershipdetailsesService.dataSourceName,
      record,
    );
    return result;
  }

  public static async update(id: string, changedFields: Partial<Cp_aboutusleadershipdetailsesBase>): Promise<IOperationResult<Cp_aboutusleadershipdetailses>> {
    const result = await Cp_aboutusleadershipdetailsesService.client.updateRecordAsync<Partial<Cp_aboutusleadershipdetailsesBase>, Cp_aboutusleadershipdetailses>(
      Cp_aboutusleadershipdetailsesService.dataSourceName,
      id,
      changedFields,
    );
    return result;
  }

  public static async get(id: string, options?: IGetOptions): Promise<IOperationResult<Cp_aboutusleadershipdetailses>> {
    const result = await Cp_aboutusleadershipdetailsesService.client.retrieveRecordAsync<Cp_aboutusleadershipdetailses>(
      Cp_aboutusleadershipdetailsesService.dataSourceName,
      id,
      options,
    );
    return result;
  }

  public static async getAll(options?: IGetAllOptions): Promise<IOperationResult<Cp_aboutusleadershipdetailses[]>> {
    const result = await Cp_aboutusleadershipdetailsesService.client.retrieveMultipleRecordsAsync<Cp_aboutusleadershipdetailses>(
      Cp_aboutusleadershipdetailsesService.dataSourceName,
      options,
    );
    return result;
  }

  public static getMetadata(
    options: GetEntityMetadataOptions<Cp_aboutusleadershipdetailses> = {},
  ): Promise<IOperationResult<Partial<EntityMetadata>>> {
    return Cp_aboutusleadershipdetailsesService.client.executeAsync({
      dataverseRequest: {
        action: 'getEntityMetadata',
        parameters: {
          tableName: Cp_aboutusleadershipdetailsesService.dataSourceName,
          options: options as GetEntityMetadataOptions,
        },
      },
    });
  }

  public static async upload(id: string, columnName: Cp_aboutusleadershipdetailsesUploadColumnName, file: File, fileDisplayName?: string): Promise<IOperationResult<void>> {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const result = await Cp_aboutusleadershipdetailsesService.client.uploadFileToRecord(
      Cp_aboutusleadershipdetailsesService.dataSourceName,
      id,
      columnName,
      fileDisplayName || file.name,
      data,
    );
    return result;
  }

  public static async downloadImage(id: string, columnName: Cp_aboutusleadershipdetailsesImageColumnName, fullSize: boolean = false): Promise<IOperationResult<Uint8Array>> {
    const result = await Cp_aboutusleadershipdetailsesService.client.downloadImageFromRecord(
      Cp_aboutusleadershipdetailsesService.dataSourceName,
      id,
      columnName,
      fullSize,
    );
    return result;
  }

  public static async deleteFileOrImage(id: string, columnName: Cp_aboutusleadershipdetailsesUploadColumnName): Promise<IOperationResult<void>> {
    const result = await Cp_aboutusleadershipdetailsesService.client.deleteFileOrImageFromRecord(
      Cp_aboutusleadershipdetailsesService.dataSourceName,
      id,
      columnName,
    );
    return result;
  }
}
