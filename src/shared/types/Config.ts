/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface ConfigSchema {
  mappedGetAppsResponse: {
    appId: string;
    code: string;
    name: string;
    description?: string;
    spaceId?: string;
    threadId?: string;
    createdAt?: string;
    creator_code?: string;
    creator_name?: string;
    modifiedAt?: string;
    modifier_code?: string;
    modifier_name?: string;
    [k: string]: unknown;
  };
  FormFieldListApp: {
    appId: string;
    [k: string]: unknown;
  };
  mappedGetFormFieldsResponse: {
    appId: string;
    primaryKey: string;
    fieldCode: string;
    label: string;
    type: string;
    [k: string]: unknown;
  };
}
