import { KintoneRestAPIClient } from "@kintone/rest-api-client";

import { KintoneSdk } from "../shared/util/kintoneSdk";

import { renderExecutionButton } from "./components/desktopUIHelpers";
import { ManagementConsoleService } from "./service/ManagementConsoleService";

import type { ConfigSchema } from "../shared/types/Config";
import type { KintoneEvent } from "src/shared/types/KintoneTypes";

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

    const handleUpsertAppListtButtonClick = async () => {
      try {
        const appIds = await managementConsoleService.upsertAppList(
          event.appId,
        );
        await managementConsoleService.upsertFormFieldList(appIds);
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    };

    renderExecutionButton(
      "alert-button",
      handleUpsertAppListtButtonClick,
      "アプリ一覧を更新",
    );
  });
})(kintone.$PLUGIN_ID);
