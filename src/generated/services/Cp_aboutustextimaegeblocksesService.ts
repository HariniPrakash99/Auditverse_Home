/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is custom-maintained for integrated About Us text/image block access.
 */

import type {
  Cp_aboutustextimaegeblocksesBase,
  Cp_aboutustextimaegeblockses,
  Cp_aboutustextimaegeblocksesImageColumnName,
  Cp_aboutustextimaegeblocksesUploadColumnName,
} from '../models/Cp_aboutustextimaegeblocksesModel';
import type { GetEntityMetadataOptions, EntityMetadata } from '@microsoft/power-apps/data/metadata/dataverse';
import type { IGetOptions, IGetAllOptions } from '../models/CommonModels';
import type { IOperationResult } from '@microsoft/power-apps/data';
import { dataSourcesInfo } from '../../../.power/schemas/appschemas/dataSourcesInfo';
import { getClient } from '@microsoft/power-apps/data';

export class Cp_aboutustextimaegeblocksesService {
  private static readonly dataSourceName = 'cp_aboutustextimaegeblockses';

  private static readonly client = getClient(dataSourcesInfo);

  public static async create(record: Cp_aboutustextimaegeblocksesBase): Promise<IOperationResult<Cp_aboutustextimaegeblockses>> {
    const result = await Cp_aboutustextimaegeblocksesService.client.createRecordAsync<Cp_aboutustextimaegeblocksesBase, Cp_aboutustextimaegeblockses>(
      Cp_aboutustextimaegeblocksesService.dataSourceName,
      record,
    );
    return result;
  }

  public static async update(id: string, changedFields: Partial<Cp_aboutustextimaegeblocksesBase>): Promise<IOperationResult<Cp_aboutustextimaegeblockses>> {
    const result = await Cp_aboutustextimaegeblocksesService.client.updateRecordAsync<Partial<Cp_aboutustextimaegeblocksesBase>, Cp_aboutustextimaegeblockses>(
      Cp_aboutustextimaegeblocksesService.dataSourceName,
      id,
      changedFields,
    );
    return result;
  }

  public static async get(id: string, options?: IGetOptions): Promise<IOperationResult<Cp_aboutustextimaegeblockses>> {
    const result = await Cp_aboutustextimaegeblocksesService.client.retrieveRecordAsync<Cp_aboutustextimaegeblockses>(
      Cp_aboutustextimaegeblocksesService.dataSourceName,
      id,
      options,
    );
    return result;
  }

  public static async getAll(options?: IGetAllOptions): Promise<IOperationResult<Cp_aboutustextimaegeblockses[]>> {
    const result = await Cp_aboutustextimaegeblocksesService.client.retrieveMultipleRecordsAsync<Cp_aboutustextimaegeblockses>(
      Cp_aboutustextimaegeblocksesService.dataSourceName,
      options,
    );
    return result;
  }

  public static getMetadata(
    options: GetEntityMetadataOptions<Cp_aboutustextimaegeblockses> = {},
  ): Promise<IOperationResult<Partial<EntityMetadata>>> {
    return Cp_aboutustextimaegeblocksesService.client.executeAsync({
      dataverseRequest: {
        action: 'getEntityMetadata',
        parameters: {
          tableName: Cp_aboutustextimaegeblocksesService.dataSourceName,
          options: options as GetEntityMetadataOptions,
        },
      },
    });
  }

  public static async upload(id: string, columnName: Cp_aboutustextimaegeblocksesUploadColumnName, file: File, fileDisplayName?: string): Promise<IOperationResult<void>> {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const result = await Cp_aboutustextimaegeblocksesService.client.uploadFileToRecord(
      Cp_aboutustextimaegeblocksesService.dataSourceName,
      id,
      columnName,
      fileDisplayName || file.name,
      data,
    );
    return result;
  }

  public static async downloadImage(id: string, columnName: Cp_aboutustextimaegeblocksesImageColumnName, fullSize: boolean = false): Promise<IOperationResult<Uint8Array>> {
    const result = await Cp_aboutustextimaegeblocksesService.client.downloadImageFromRecord(
      Cp_aboutustextimaegeblocksesService.dataSourceName,
      id,
      columnName,
      fullSize,
    );
    return result;
  }

  public static async deleteFileOrImage(id: string, columnName: Cp_aboutustextimaegeblocksesUploadColumnName): Promise<IOperationResult<void>> {
    const result = await Cp_aboutustextimaegeblocksesService.client.deleteFileOrImageFromRecord(
      Cp_aboutustextimaegeblocksesService.dataSourceName,
      id,
      columnName,
    );
    return result;
  }
}
