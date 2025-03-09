import {
  KintoneSdk,
  type PropertiesForParameter,
  type RecordForParameter,
} from "../../shared/util/kintoneSdk";

import type { ConfigSchema } from "../../shared/types/Config";
import type {
  App,
  AppID,
  Properties,
  Record,
  RecordID,
  Revision,
  UpdateKey,
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

  public async upsertAppList(appId: AppID): Promise<AppID[]> {
    const apps = (await this.kintoneSdk.getApps()).apps;
    const recordsForUpdate = this.makeRecordsForUpdate(apps);
    await this.kintoneSdk.updateAllRecords({
      appId: appId,
      upsert: true,
      records: recordsForUpdate,
    });
    const appIds = recordsForUpdate.map((record) => {
      return record.updateKey.value;
    });
    return appIds;
  }

  public makeRecordsForUpdate(apps: App[]): Array<{
    updateKey: UpdateKey;
    record?: RecordForParameter;
    revision?: Revision;
  }> {
    const recordsForUpdate: Array<{
      updateKey: UpdateKey;
      record?: RecordForParameter;
      revision?: Revision;
    }> = apps.map((app) => {
      const record: RecordForParameter = {};

      Object.keys(this.config.mappedGetAppsResponse).forEach((key) => {
        const appKey = key as keyof App;
        const configKey = this.config.mappedGetAppsResponse[key] as string;
        if (app[appKey] !== undefined && appKey !== "appId") {
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
        updateKey: {
          field: this.config.mappedGetAppsResponse.appId,
          value: `${app.appId}`,
        },
        record,
      };
    });

    return recordsForUpdate;
  }

  public async upsertFormFieldList(
    appIds: AppID[],
  ): Promise<UpdateRecordsForResponse> {
    // appIdsに対して、それぞれのアプリのフォームフィールドを取得
    const recordsForUpsertFormFieldsList = await Promise.all(
      appIds.map(async (appId) => {
        const formFields = await this.kintoneSdk.getFormFields({
          appId: appId,
        });
        return this.makeRecordsForUpsertFormFields(appId, formFields);
      }),
    );
    const recordsForUpsertFormFields = recordsForUpsertFormFieldsList.flat();
    const response = await this.kintoneSdk.updateAllRecords({
      appId: this.config.FormFieldListApp.appId,
      upsert: true,
      records: recordsForUpsertFormFields,
    });
    return response.records;
  }

  public makeRecordsForUpsertFormFields(
    appId: AppID,
    formFields: {
      properties: Properties;
      revision: string;
    },
  ): Array<{
    updateKey: UpdateKey;
    record?: RecordForParameter;
    revision?: Revision;
  }> {
    const recordsForUpdate: Array<{
      updateKey: UpdateKey;
      record?: RecordForParameter;
      revision?: Revision;
    }> = Object.keys(formFields.properties).map((fieldCode, index) => {
      const field = formFields.properties[fieldCode];
      const record: RecordForParameter = {
        appId: { value: appId },
        fieldCode: { value: field.code },
        label: { value: field.label },
        type: { value: field.type },
      };
      return {
        updateKey: {
          field: this.config.mappedGetFormFieldsResponse.primaryKey,
          value: `${appId}-${field.code}`,
        },
        record,
      };
    });

    return recordsForUpdate;
  }

  public async addFormFieldsFromRecords(): Promise<void> {
    const records = await this.kintoneSdk.getRecords({
      appId: this.config.changeFormFieldApp.appId,
    });

    const fieldsByAppId: { [key: string]: PropertiesForParameter } = {};

    records.records.forEach((record) => {
      const appId = record.appId.value as string;
      if (!fieldsByAppId[appId]) {
        fieldsByAppId[appId] = {};
      }

      const fieldCode = record[
        this.config.mappedGetFormFieldsResponse.fieldCode
      ].value as string;
      const label = record[this.config.mappedGetFormFieldsResponse.label]
        .value as string;
      const type = record[this.config.mappedGetFormFieldsResponse.type]
        .value as string;

      fieldsByAppId[appId][fieldCode] = {
        type,
        code: fieldCode,
        label,
      };
    });

    for (const appId in fieldsByAppId) {
      await this.kintoneSdk.addFormFields({
        appId,
        fields: fieldsByAppId[appId],
      });
    }
  }
}
