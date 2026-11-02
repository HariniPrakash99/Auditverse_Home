/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is custom-maintained for About Us text/image block configuration.
 */

import type {
  Cp_aboutustextimageblocksconfigurationesBase,
  Cp_aboutustextimageblocksconfigurationes,
} from '../models/Cp_aboutustextimageblocksconfigurationesModel';
import type { GetEntityMetadataOptions, EntityMetadata } from '@microsoft/power-apps/data/metadata/dataverse';
import type { IGetOptions, IGetAllOptions } from '../models/CommonModels';
import type { IOperationResult } from '@microsoft/power-apps/data';
import { dataSourcesInfo } from '../../../.power/schemas/appschemas/dataSourcesInfo';
import { getClient } from '@microsoft/power-apps/data';

export class Cp_aboutustextimageblocksconfigurationesService {
  private static readonly dataSourceName = 'cp_aboutustextimageblocksconfigurationes';

  private static readonly fallbackDataSourceName = 'cp_aboutustextimageblocksconfigurations';
  private static readonly secondaryFallbackDataSourceName = 'cp_aboutustextimageblocksconfiguration';

  private static readonly client = getClient(dataSourcesInfo);

  public static async create(record: Cp_aboutustextimageblocksconfigurationesBase): Promise<IOperationResult<Cp_aboutustextimageblocksconfigurationes>> {
    const result = await Cp_aboutustextimageblocksconfigurationesService.client.createRecordAsync<Cp_aboutustextimageblocksconfigurationesBase, Cp_aboutustextimageblocksconfigurationes>(
      Cp_aboutustextimageblocksconfigurationesService.dataSourceName,
      record,
    );
    return result;
  }

  public static async update(id: string, changedFields: Partial<Cp_aboutustextimageblocksconfigurationesBase>): Promise<IOperationResult<Cp_aboutustextimageblocksconfigurationes>> {
    const result = await Cp_aboutustextimageblocksconfigurationesService.client.updateRecordAsync<Partial<Cp_aboutustextimageblocksconfigurationesBase>, Cp_aboutustextimageblocksconfigurationes>(
      Cp_aboutustextimageblocksconfigurationesService.dataSourceName,
      id,
      changedFields,
    );
    return result;
  }

  public static async get(id: string, options?: IGetOptions): Promise<IOperationResult<Cp_aboutustextimageblocksconfigurationes>> {
    const result = await Cp_aboutustextimageblocksconfigurationesService.client.retrieveRecordAsync<Cp_aboutustextimageblocksconfigurationes>(
      Cp_aboutustextimageblocksconfigurationesService.dataSourceName,
      id,
      options,
    );
    return result;
  }

  public static async getAll(options?: IGetAllOptions): Promise<IOperationResult<Cp_aboutustextimageblocksconfigurationes[]>> {
    const hasRows = (result: IOperationResult<Cp_aboutustextimageblocksconfigurationes[]>): boolean =>
      result.success === true && Array.isArray(result.data) && result.data.length > 0;

    try {
      const primaryResult = await Cp_aboutustextimageblocksconfigurationesService.client.retrieveMultipleRecordsAsync<Cp_aboutustextimageblocksconfigurationes>(
        Cp_aboutustextimageblocksconfigurationesService.dataSourceName,
        options,
      );
      if (hasRows(primaryResult)) return primaryResult;
      try {
        const fallbackResult = await Cp_aboutustextimageblocksconfigurationesService.client.retrieveMultipleRecordsAsync<Cp_aboutustextimageblocksconfigurationes>(
          Cp_aboutustextimageblocksconfigurationesService.fallbackDataSourceName,
          options,
        );
        if (hasRows(fallbackResult)) return fallbackResult;
        try {
          const secondaryFallbackResult = await Cp_aboutustextimageblocksconfigurationesService.client.retrieveMultipleRecordsAsync<Cp_aboutustextimageblocksconfigurationes>(
            Cp_aboutustextimageblocksconfigurationesService.secondaryFallbackDataSourceName,
            options,
          );
          if (hasRows(secondaryFallbackResult)) return secondaryFallbackResult;
          if (primaryResult.success && fallbackResult.success) return fallbackResult;
          return primaryResult;
        } catch {
          if (primaryResult.success && fallbackResult.success) return fallbackResult;
          return primaryResult;
        }
      } catch {
        try {
          const secondaryFallbackResult = await Cp_aboutustextimageblocksconfigurationesService.client.retrieveMultipleRecordsAsync<Cp_aboutustextimageblocksconfigurationes>(
            Cp_aboutustextimageblocksconfigurationesService.secondaryFallbackDataSourceName,
            options,
          );
          if (hasRows(secondaryFallbackResult)) return secondaryFallbackResult;
          return primaryResult;
        } catch {
          return primaryResult;
        }
      }
    } catch (primaryError) {
      try {
        const fallbackResult = await Cp_aboutustextimageblocksconfigurationesService.client.retrieveMultipleRecordsAsync<Cp_aboutustextimageblocksconfigurationes>(
          Cp_aboutustextimageblocksconfigurationesService.fallbackDataSourceName,
          options,
        );
        if (hasRows(fallbackResult)) return fallbackResult;
      } catch {
        // Continue to second fallback below.
      }
      const secondaryFallbackResult = await Cp_aboutustextimageblocksconfigurationesService.client.retrieveMultipleRecordsAsync<Cp_aboutustextimageblocksconfigurationes>(
        Cp_aboutustextimageblocksconfigurationesService.secondaryFallbackDataSourceName,
        options,
      );
      if (hasRows(secondaryFallbackResult)) return secondaryFallbackResult;
      throw primaryError;
    }
  }

  public static getMetadata(
    options: GetEntityMetadataOptions<Cp_aboutustextimageblocksconfigurationes> = {},
  ): Promise<IOperationResult<Partial<EntityMetadata>>> {
    return Cp_aboutustextimageblocksconfigurationesService.client.executeAsync({
      dataverseRequest: {
        action: 'getEntityMetadata',
        parameters: {
          tableName: Cp_aboutustextimageblocksconfigurationesService.dataSourceName,
          options: options as GetEntityMetadataOptions,
        },
      },
    });
  }
}
