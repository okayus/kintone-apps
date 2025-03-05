import {
  KintoneFormFieldProperty,
  KintoneRestAPIClient,
} from "@kintone/rest-api-client";

import type {
  AppID,
  Record,
  RecordID,
  Revision,
  UpdateKey,
} from "@kintone/rest-api-client/lib/src/client/types";

export type RecordForParameter = {
  [fieldCode: string]: {
    value: unknown;
  };
};

export class KintoneSdk {
  private restApiClient: KintoneRestAPIClient;

  constructor(restApiClient: KintoneRestAPIClient) {
    this.restApiClient = restApiClient;
  }

  public async getApps(
    params: {
      ids?: number[];
      codes?: string[];
      name?: string;
      spaceIds?: number[];
    } = {},
  ) {
    const apps = await this.restApiClient.app.getApps(params);
    return apps;
  }

  public async getFormFields(params: { appId: AppID; preview?: boolean }) {
    const { appId, preview = true } = params;
    const fields = await this.restApiClient.app.getFormFields({
      app: appId,
      preview,
    });
    return fields;
  }

  public async getViews(params: { appId: AppID }) {
    const { appId } = params;
    const views = await this.restApiClient.app.getViews({ app: appId });
    return views;
  }

  public async getRecords(params: {
    appId: AppID;
    fields?: string[];
    query?: string;
  }) {
    const { appId, fields = [], query = "" } = params;
    const MAX_READ_LIMIT = 500;
    const MAX_TOTAL_RECORDS = 10000;

    let allRecords: Record[] = [];
    let offset = 0;

    while (allRecords.length < MAX_TOTAL_RECORDS) {
      const effectiveQuery = query.trim() ? `${query} ` : "";
      const paginatedQuery = `${effectiveQuery}limit ${MAX_READ_LIMIT} offset ${offset}`;

      const response = await this.restApiClient.record.getRecords({
        app: appId,
        fields,
        query: paginatedQuery,
      });

      allRecords = allRecords.concat(response.records);

      if (response.records.length < MAX_READ_LIMIT) break;

      offset += MAX_READ_LIMIT;
    }

    return { records: allRecords };
  }

  public async updateRecord(params: {
    appId: AppID;
    recordId: number;
    record: Record;
  }) {
    const { appId, recordId, record } = params;
    const res = await this.restApiClient.record.updateRecord({
      app: appId,
      id: recordId,
      record,
    });
    return res;
  }

  public async updateAllRecords(params: {
    appId: AppID;
    upsert: boolean;
    records: Array<
      | { id: RecordID; record?: RecordForParameter; revision?: Revision }
      | {
          updateKey: UpdateKey;
          record?: RecordForParameter;
          revision?: Revision;
        }
    >;
  }) {
    const { appId, upsert, records } = params;
    const res = await this.restApiClient.record.updateAllRecords({
      app: appId,
      upsert,
      records,
    });
    return res;
  }
}

export type kintoneType = KintoneFormFieldProperty.OneOf["type"];
