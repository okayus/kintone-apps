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
  RecordID,
  Revision,
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
        id: RecordID;
        record?: RecordForParameter;
        revision?: Revision;
      }> = managementConsoleService.makeRecordsForUpdate(apps);
      expect(recordsForUpdate).toEqual([
        {
          id: "1",
          record: {
            appId: { value: "1" },
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
          id: "2",
          record: {
            appId: { value: "2" },
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
            id: "1",
            record: {
              appId: { value: "1" },
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
      expect(result).toEqual(mockResponse);
    });
  });
});
