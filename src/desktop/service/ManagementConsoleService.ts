import {
  KintoneSdk,
  type RecordForParameter,
} from "../../shared/util/kintoneSdk";

import type { ConfigSchema } from "../../shared/types/Config";
import type {
  App,
  AppID,
  Record,
  RecordID,
  Revision,
  UpdateRecordsForResponse,
} from "@kintone/rest-api-client/lib/src/client/types";
import type { SingleLineText } from "@kintone/rest-api-client/lib/src/KintoneFields/types/field";

export class ManagementConsoleService {
  private config: ConfigSchema;
  private kintoneSdk: KintoneSdk;

  constructor(config: ConfigSchema, kintoneSdk: KintoneSdk) {
    this.config = config;
    this.kintoneSdk = kintoneSdk;
  }

  public async upsertAppList(appId: AppID): Promise<UpdateRecordsForResponse> {
    const apps = (await this.kintoneSdk.getApps()).apps;
    const recordsForUpdate = this.makeRecordsForUpdate(apps);
    const response = await this.kintoneSdk.updateAllRecords(
      appId,
      true,
      recordsForUpdate,
    );
    return response.records;
  }

  public makeRecordsForUpdate(apps: App[]): Array<{
    id: RecordID;
    record?: RecordForParameter;
    revision?: Revision;
  }> {
    const recordsForUpdate: Array<{
      id: RecordID;
      record?: RecordForParameter;
      revision?: Revision;
    }> = apps.map((app) => {
      const record: RecordForParameter = {};

      Object.keys(this.config.mappedGetAppsResponse).forEach((key) => {
        const appKey = key as keyof App;
        const configKey = this.config.mappedGetAppsResponse[key] as string;
        if (app[appKey] !== undefined) {
          record[configKey] = { value: app[appKey] };
        } else if (app.creator && appKey.startsWith("creator_")) {
          record[configKey] = {
            value:
              app.creator[
                appKey.replace("creator_", "") as keyof typeof app.creator
              ],
          };
        } else if (app.modifier && appKey.startsWith("modifier_")) {
          record[configKey] = {
            value:
              app.modifier[
                appKey.replace("modifier_", "") as keyof typeof app.modifier
              ],
          };
        }
      });

      return {
        id: app.appId,
        record,
      };
    });

    return recordsForUpdate;
  }
  // public makeRecordsForUpdate(apps: App[]): Array<{
  //   id: RecordID;
  //   record?: RecordForParameter;
  //   revision?: Revision;
  // }> {
  //   const recordsForUpdate: Array<{
  //     id: RecordID;
  //     record?: RecordForParameter;
  //     revision?: Revision;
  //   }> = apps.map((app) => {
  //     const record: RecordForParameter = {
  //       [this.config.mappedGetAppsResponse.appId]: {
  //         value: app.appId,
  //       },
  //       [this.config.mappedGetAppsResponse.code]: {
  //         value: app.code,
  //       },
  //       [this.config.mappedGetAppsResponse.name]: {
  //         value: app.name,
  //       },
  //       [this.config.mappedGetAppsResponse.description]: {
  //         value: app.description,
  //       },
  //       [this.config.mappedGetAppsResponse.spaceId]: {
  //         value: app.spaceId,
  //       },
  //       [this.config.mappedGetAppsResponse.threadId]: {
  //         value: app.threadId,
  //       },
  //       [this.config.mappedGetAppsResponse.createdAt]: {
  //         value: app.createdAt,
  //       },
  //       [this.config.mappedGetAppsResponse.creator_code]: {
  //         value: app.creator.code,
  //       },
  //       [this.config.mappedGetAppsResponse.creator_name]: {
  //         value: app.creator.name,
  //       },
  //       [this.config.mappedGetAppsResponse.modifiedAt]: {
  //         value: app.modifiedAt,
  //       },
  //       [this.config.mappedGetAppsResponse.modifier_code]: {
  //         value: app.modifier.code,
  //       },
  //       [this.config.mappedGetAppsResponse.modifier_name]: {
  //         value: app.modifier.name,
  //       },
  //     };

  //     return {
  //       id: app.appId,
  //       record,
  //     };
  //   });

  //   return recordsForUpdate;
  // }
}
