import React from "react";
import { createRoot } from "react-dom/client";

import { KintoneRestAPIClient } from "@kintone/rest-api-client";

import { KintoneSdk } from "../shared/util/kintoneSdk";

import IndexShowButton from "./components/IndexShowButton";
import { ManagementConsoleService } from "./service/ManagementConsoleService";

import type { ConfigSchema } from "../shared/types/Config";
import type { Record } from "@kintone/rest-api-client/lib/src/client/types";

const renderButton = (
  container: HTMLElement,
  onClick: () => Promise<void>,
  buttonLabel: string,
) => {
  createRoot(container).render(
    <IndexShowButton onClick={onClick} buttonLabel={buttonLabel} />,
  );
};

interface KintoneEvent {
  appId: number;
  record: Record;
  viewId: number;
  viewName: string;
}

// メイン処理
((PLUGIN_ID) => {
  kintone.events.on("app.record.index.show", async (event: KintoneEvent) => {
    const pluginConfig = kintone.plugin.app.getConfig(PLUGIN_ID).config;
    if (!pluginConfig) return;

    const config: ConfigSchema = JSON.parse(pluginConfig).config;
    const restApiClient = new KintoneRestAPIClient();
    const kintoneSdk = new KintoneSdk(restApiClient);
    const managementConsoleService = new ManagementConsoleService(
      config,
      kintoneSdk,
    );

    const headerMenuSpace = kintone.app.getHeaderMenuSpaceElement();
    if (!headerMenuSpace) return;

    const container = document.createElement("div");
    headerMenuSpace.appendChild(container);

    renderButton(
      container,
      async () => {
        const upsertAppList = await managementConsoleService.upsertAppList(
          event.appId,
        );
        const resUpsertAppList = `managementConsoleServiceレコードを更新しました: ${upsertAppList.length}件`;

        const upsertFormFields =
          await managementConsoleService.upsertFormFieldList(upsertAppList);
        const resUpsertFormFields = `managementConsoleServiceフォームを更新しました: ${upsertFormFields.length}件`;

        const upsertFormLayouts =
          await managementConsoleService.upsertFormLayoutList(upsertAppList);
        const resUpsertFormLayouts = `managementConsoleServiceレイアウトを更新しました: ${upsertFormLayouts.length}件`;

        alert(
          `${resUpsertAppList}\n${resUpsertFormFields}\n${resUpsertFormLayouts}`,
        );
      },
      `[${event.viewName}]のレコードを表示`,
    );

    // 一旦DOM操作でheaderMenuSpaceにawait managementConsoleService.addFormFieldsFromRecords()を実行するボタンを追加する
    const addFormFieldsButton = document.createElement("button");
    addFormFieldsButton.textContent = "フォームを更新";
    addFormFieldsButton.onclick = async () => {
      await managementConsoleService.addFormFieldsFromRecords();
      alert("フォームを更新しました");
    };
    headerMenuSpace.appendChild(addFormFieldsButton);

    const updateFormLayoutButton = document.createElement("button");
    updateFormLayoutButton.textContent = "レイアウトを更新";
    updateFormLayoutButton.onclick = async () => {
      await managementConsoleService.updateFormLayoutRecords();
      alert("レイアウトを更新しました");
    };
    headerMenuSpace.appendChild(updateFormLayoutButton);
  });
})(kintone.$PLUGIN_ID);
