import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";

import {
  KintoneSdk,
  type RecordForParameter,
} from "../../shared/util/kintoneSdk";

import { ManagementConsoleService } from "./ManagementConsoleService";

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

vi.mock("../shared/util/kintoneSdk");

describe("MessageService", () => {
  let mockkintoneSdk: Mocked<KintoneSdk>;
  let mockRestApiClient: Mocked<KintoneRestAPIClient>;
  let kintone: any;

  beforeEach(() => {
    kintone = {
      app: {
        getQueryCondition: vi.fn(),
      },
    };
    global.kintone = kintone;

    mockRestApiClient = {
      app: {
        getApps: vi.fn(),
        getFormFields: vi.fn(),
        getViews: vi.fn(),
      },
      record: {
        updateAllRecords: vi.fn(),
        getRecords: vi.fn(),
      },
    } as unknown as Mocked<KintoneRestAPIClient>;
    mockkintoneSdk = new KintoneSdk(mockRestApiClient) as Mocked<KintoneSdk>;
    mockkintoneSdk.getApps = vi.fn();
    mockkintoneSdk.updateAllRecords = vi.fn();
    mockkintoneSdk.getFormFields = vi.fn();
    mockkintoneSdk.getRecords = vi.fn();
    mockkintoneSdk.addFormFields = vi.fn();
  });

  describe("makeRecordsForUpdate", () => {
    it("getAppsのレスポンスからupdateAllRecordsの引数recordsを作成する", () => {
      const mockConfig: ConfigSchema = {
        mappedGetAppsResponse: {
          appId: "appId",
          code: "code",
          name: "name",
          description: "description",
          spaceId: "spaceId",
          threadId: "threadId",
          createdAt: "createdAt",
          creator_code: "creator_code",
          creator_name: "creator_name",
          modifiedAt: "modifiedAt",
          modifier_code: "modifier_code",
          modifier_name: "modifier_name",
        },
      } as ConfigSchema;
      const managementConsoleService = new ManagementConsoleService(
        mockConfig,
        mockkintoneSdk,
      );
      const apps: App[] = [
        {
          appId: "1",
          code: "code1",
          name: "name1",
          description: "description1",
          spaceId: "spaceId1",
          threadId: "threadId1",
          createdAt: "createdAt1",
          creator: {
            code: "creatorCode1",
            name: "creatorName1",
          },
          modifiedAt: "modifiedAt1",
          modifier: {
            code: "modifierCode1",
            name: "modifierName1",
          },
        },
        {
          appId: "2",
          code: "code2",
          name: "name2",
          description: "description2",
          spaceId: "spaceId2",
          threadId: "threadId2",
          createdAt: "createdAt2",
          creator: {
            code: "creatorCode2",
            name: "creatorName2",
          },
          modifiedAt: "modifiedAt2",
          modifier: {
            code: "modifierCode2",
            name: "modifierName2",
          },
        },
      ];
      const recordsForUpdate: Array<{
        updateKey: UpdateKey;
        record?: RecordForParameter;
        revision?: Revision;
      }> = managementConsoleService.makeRecordsForUpdate(apps);
      expect(recordsForUpdate).toEqual([
        {
          updateKey: {
            field: "appId",
            value: "1",
          },
          record: {
            code: { value: "code1" },
            name: { value: "name1" },
            description: { value: "description1" },
            spaceId: { value: "spaceId1" },
            threadId: { value: "threadId1" },
            createdAt: { value: "createdAt1" },
            creator_code: { value: "creatorCode1" },
            creator_name: { value: "creatorName1" },
            modifiedAt: { value: "modifiedAt1" },
            modifier_code: { value: "modifierCode1" },
            modifier_name: { value: "modifierName1" },
          } as RecordForParameter,
        },
        {
          updateKey: {
            field: "appId",
            value: "2",
          },
          record: {
            code: { value: "code2" },
            name: { value: "name2" },
            description: { value: "description2" },
            spaceId: { value: "spaceId2" },
            threadId: { value: "threadId2" },
            createdAt: { value: "createdAt2" },
            creator_code: { value: "creatorCode2" },
            creator_name: { value: "creatorName2" },
            modifiedAt: { value: "modifiedAt2" },
            modifier_code: { value: "modifierCode2" },
            modifier_name: { value: "modifierName2" },
          } as RecordForParameter,
        },
      ]);
    });
  });

  describe("upsertAppList", () => {
    it("should upsert app list correctly", async () => {
      const mockConfig: ConfigSchema = {
        mappedGetAppsResponse: {
          appId: "appId",
          code: "code",
          name: "name",
          description: "description",
          spaceId: "spaceId",
          threadId: "threadId",
          createdAt: "createdAt",
          creator_code: "creator_code",
          creator_name: "creator_name",
          modifiedAt: "modifiedAt",
          modifier_code: "modifier_code",
          modifier_name: "modifier_name",
        },
      } as ConfigSchema;

      const managementConsoleService = new ManagementConsoleService(
        mockConfig,
        mockkintoneSdk,
      );

      const apps: App[] = [
        {
          appId: "1",
          code: "code1",
          name: "name1",
          description: "description1",
          spaceId: "spaceId1",
          threadId: "threadId1",
          createdAt: "createdAt1",
          creator: {
            code: "creatorCode1",
            name: "creatorName1",
          },
          modifiedAt: "modifiedAt1",
          modifier: {
            code: "modifierCode1",
            name: "modifierName1",
          },
        },
      ];

      const mockResponse: UpdateRecordsForResponse = [
        {
          id: "1",
          revision: "1",
        },
      ];

      mockkintoneSdk.getApps.mockResolvedValue({ apps });
      mockkintoneSdk.updateAllRecords.mockResolvedValue({
        records: mockResponse,
      });

      const result = await managementConsoleService.upsertAppList("1" as AppID);

      expect(mockkintoneSdk.getApps).toHaveBeenCalled();
      expect(mockkintoneSdk.updateAllRecords).toHaveBeenCalledWith({
        appId: "1",
        upsert: true,
        records: [
          {
            updateKey: {
              field: "appId",
              value: "1",
            },
            record: {
              code: { value: "code1" },
              name: { value: "name1" },
              description: { value: "description1" },
              spaceId: { value: "spaceId1" },
              threadId: { value: "threadId1" },
              createdAt: { value: "createdAt1" },
              creator_code: { value: "creatorCode1" },
              creator_name: { value: "creatorName1" },
              modifiedAt: { value: "modifiedAt1" },
              modifier_code: { value: "modifierCode1" },
              modifier_name: { value: "modifierName1" },
            },
          },
        ],
      });
      expect(result).toEqual(["1"]);
    });
  });

  describe("makeRecordsForUpsertFormFields", () => {
    it("getFormFieldsのレスポンスからupdateAllRecordsの引数recordsを作成する", () => {
      const mockConfig: ConfigSchema = {
        mappedGetFormFieldsResponse: {
          appId: "appId",
          primaryKey: "primaryKey",
          fieldCode: "fieldCode",
          label: "label",
          type: "type",
        },
      } as ConfigSchema;
      const managementConsoleService = new ManagementConsoleService(
        mockConfig,
        mockkintoneSdk,
      );
      const formFields: { properties: Properties; revision: string } = {
        properties: {
          fieldCode1: {
            type: "SINGLE_LINE_TEXT",
            code: "fieldCode1",
            label: "Field Label 1",
            noLabel: false,
            required: true,
            unique: true,
            maxLength: "64",
            minLength: "0",
            defaultValue: "",
            expression: "",
            hideExpression: false,
          },
          fieldCode2: {
            type: "NUMBER",
            code: "fieldCode2",
            label: "Field Label 2",
            noLabel: false,
            required: false,
            unique: false,
            defaultValue: "",
            digit: false,
            displayScale: "",
            unit: "",
            unitPosition: "BEFORE",
            maxValue: "",
            minValue: "",
          },
          fieldCode3: {
            type: "DATE",
            code: "fieldCode3",
            label: "Field Label 3",
            noLabel: false,
            required: false,
            unique: false,
            defaultValue: "",
            defaultNowValue: false,
          },
        },
        revision: "1",
      };
      const recordsForUpdate: Array<{
        updateKey: UpdateKey;
        record?: RecordForParameter;
        revision?: Revision;
      }> = managementConsoleService.makeRecordsForUpsertFormFields(
        "1",
        formFields,
      );
      expect(recordsForUpdate).toEqual([
        {
          updateKey: {
            field: "primaryKey",
            value: "1-fieldCode1",
          },
          record: {
            appId: { value: "1" },
            fieldCode: {
              value: "fieldCode1",
            },
            label: {
              value: "Field Label 1",
            },
            type: {
              value: "SINGLE_LINE_TEXT",
            },
          } as RecordForParameter,
        },
        {
          updateKey: {
            field: "primaryKey",
            value: "1-fieldCode2",
          },
          record: {
            appId: { value: "1" },
            fieldCode: {
              value: "fieldCode2",
            },
            label: {
              value: "Field Label 2",
            },
            type: {
              value: "NUMBER",
            },
          } as RecordForParameter,
        },
        {
          updateKey: {
            field: "primaryKey",
            value: "1-fieldCode3",
          },
          record: {
            appId: { value: "1" },
            fieldCode: {
              value: "fieldCode3",
            },
            label: {
              value: "Field Label 3",
            },
            type: {
              value: "DATE",
            },
          } as RecordForParameter,
        },
      ]);
    });
  });

  describe("upsertFormFieldsList", () => {
    it("アプリにフィールド一覧を保存する", async () => {
      const mockConfig: ConfigSchema = {
        FormFieldListApp: {
          appId: "2",
        },
        mappedGetFormFieldsResponse: {
          appId: "appId",
          primaryKey: "primaryKey",
          fieldCode: "fieldCode",
          label: "label",
          type: "type",
        },
      } as ConfigSchema;

      const managementConsoleService = new ManagementConsoleService(
        mockConfig,
        mockkintoneSdk,
      );

      const formFields: { properties: Properties; revision: string } = {
        properties: {
          fieldCode1: {
            type: "SINGLE_LINE_TEXT",
            code: "fieldCode1",
            label: "Field Label 1",
            noLabel: false,
            required: true,
            unique: true,
            maxLength: "64",
            minLength: "0",
            defaultValue: "",
            expression: "",
            hideExpression: false,
          },
          fieldCode2: {
            type: "NUMBER",
            code: "fieldCode2",
            label: "Field Label 2",
            noLabel: false,
            required: false,
            unique: false,
            defaultValue: "",
            digit: false,
            displayScale: "",
            unit: "",
            unitPosition: "BEFORE",
            maxValue: "",
            minValue: "",
          },
          fieldCode3: {
            type: "DATE",
            code: "fieldCode3",
            label: "Field Label 3",
            noLabel: false,
            required: false,
            unique: false,
            defaultValue: "",
            defaultNowValue: false,
          },
        },
        revision: "1",
      };

      mockkintoneSdk.getFormFields.mockResolvedValue(formFields);

      const mockResponse: UpdateRecordsForResponse = [
        {
          id: "1",
          revision: "1",
        },
        {
          id: "2",
          revision: "1",
        },
        {
          id: "3",
          revision: "1",
        },
      ];

      mockkintoneSdk.updateAllRecords.mockResolvedValue({
        records: mockResponse,
      });

      const result = await managementConsoleService.upsertFormFieldList([
        "1",
        "2",
        "3",
      ] as AppID[]);

      expect(mockkintoneSdk.updateAllRecords).toHaveBeenCalledWith({
        appId: "2",
        upsert: true,
        records: [
          {
            updateKey: {
              field: "primaryKey",
              value: "1-fieldCode1",
            },
            record: {
              appId: { value: "1" },
              fieldCode: {
                value: "fieldCode1",
              },
              label: {
                value: "Field Label 1",
              },
              type: {
                value: "SINGLE_LINE_TEXT",
              },
            },
          },
          {
            updateKey: {
              field: "primaryKey",
              value: "1-fieldCode2",
            },
            record: {
              appId: { value: "1" },
              fieldCode: {
                value: "fieldCode2",
              },
              label: {
                value: "Field Label 2",
              },
              type: {
                value: "NUMBER",
              },
            },
          },
          {
            updateKey: {
              field: "primaryKey",
              value: "1-fieldCode3",
            },
            record: {
              appId: { value: "1" },
              fieldCode: {
                value: "fieldCode3",
              },
              label: {
                value: "Field Label 3",
              },
              type: {
                value: "DATE",
              },
            },
          },
          {
            updateKey: {
              field: "primaryKey",
              value: "2-fieldCode1",
            },
            record: {
              appId: { value: "2" },
              fieldCode: {
                value: "fieldCode1",
              },
              label: {
                value: "Field Label 1",
              },
              type: {
                value: "SINGLE_LINE_TEXT",
              },
            },
          },
          {
            updateKey: {
              field: "primaryKey",
              value: "2-fieldCode2",
            },
            record: {
              appId: { value: "2" },
              fieldCode: {
                value: "fieldCode2",
              },
              label: {
                value: "Field Label 2",
              },
              type: {
                value: "NUMBER",
              },
            },
          },
          {
            updateKey: {
              field: "primaryKey",
              value: "2-fieldCode3",
            },
            record: {
              appId: { value: "2" },
              fieldCode: {
                value: "fieldCode3",
              },
              label: {
                value: "Field Label 3",
              },
              type: {
                value: "DATE",
              },
            },
          },
          {
            updateKey: {
              field: "primaryKey",
              value: "3-fieldCode1",
            },
            record: {
              appId: { value: "3" },
              fieldCode: {
                value: "fieldCode1",
              },
              label: {
                value: "Field Label 1",
              },
              type: {
                value: "SINGLE_LINE_TEXT",
              },
            },
          },
          {
            updateKey: {
              field: "primaryKey",
              value: "3-fieldCode2",
            },
            record: {
              appId: { value: "3" },
              fieldCode: {
                value: "fieldCode2",
              },
              label: {
                value: "Field Label 2",
              },
              type: {
                value: "NUMBER",
              },
            },
          },
          {
            updateKey: {
              field: "primaryKey",
              value: "3-fieldCode3",
            },
            record: {
              appId: { value: "3" },
              fieldCode: {
                value: "fieldCode3",
              },
              label: {
                value: "Field Label 3",
              },
              type: {
                value: "DATE",
              },
            },
          },
        ],
      });
    });
  });

  describe("addFormFieldsFromRecords", () => {
    it("should add form fields from records", async () => {
      const mockConfig: ConfigSchema = {
        FormFieldListApp: {
          appId: "2",
        },
        mappedGetFormFieldsResponse: {
          appId: "appId",
          primaryKey: "primaryKey",
          fieldCode: "fieldCode",
          label: "label",
          type: "type",
        },
      } as ConfigSchema;

      const managementConsoleService = new ManagementConsoleService(
        mockConfig,
        mockkintoneSdk,
      );

      const mockRecordList: Record[] = [
        {
          type: {
            type: "SINGLE_LINE_TEXT",
            value: "SINGLE_LINE_TEXT",
          },
          fieldCode1: {
            type: "SINGLE_LINE_TEXT",
            value: "Field Label 1",
          },
          fieldCode: {
            type: "SINGLE_LINE_TEXT",
            value: "fieldCode1",
          },
          label: {
            type: "SINGLE_LINE_TEXT",
            value: "Field Label 1",
          },
        } as Record,
      ];

      const mockRecords = {
        records: mockRecordList,
      };

      mockkintoneSdk.getRecords.mockResolvedValue(mockRecords);

      await managementConsoleService.addFormFieldsFromRecords();

      expect(mockkintoneSdk.getRecords).toHaveBeenCalledWith({
        appId: "2",
      });

      expect(mockkintoneSdk.addFormFields).toHaveBeenCalledWith({
        appId: "2",
        fields: {
          fieldCode1: {
            type: "SINGLE_LINE_TEXT",
            code: "fieldCode1",
            label: "Field Label 1",
          },
        },
      });
    });
  });
});
