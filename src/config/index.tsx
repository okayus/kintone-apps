import React from "react";
import { createRoot } from "react-dom/client";

import { KintoneRestAPIClient } from "@kintone/rest-api-client";

import { KintoneSdk } from "../shared/util/kintoneSdk";
import { KintoneUtil } from "../shared/util/KintoneUtil";

import ConfigForm from "./ConfigForm";

(async (PLUGIN_ID) => {
  createRoot(document.getElementById("config")!).render(
    <ConfigForm
      pluginId={PLUGIN_ID as string}
      kintoneSdk={new KintoneSdk(new KintoneRestAPIClient())}
      kintoneUtil={KintoneUtil}
    />,
  );
})(kintone.$PLUGIN_ID);
