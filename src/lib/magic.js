import { Magic } from "magic-sdk";
import * as fcl from "@onflow/fcl";

import { OAuthExtension } from "@magic-ext/oauth";
import { FlowExtension } from "@magic-ext/flow";

fcl.config().put("accessNode.api", "https://rest-testnet.onflow.org");

const createMagic = (key) => {
  return (
    typeof window !== "undefined" &&
    new Magic(key, {
      extensions: [
        new OAuthExtension(),
        new FlowExtension({
          rpcUrl: "https://rest-testnet.onflow.org",
          network: "testnet",
        }),
      ],
    })
  );
};

const key = "pk_live_3D7238252F732786";

export const magic = createMagic(key);
