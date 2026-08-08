import { infrai } from "./infrai.ts";

const marketplaceFlag = "marketplace_recommendations";

async function rollOutMarketplace(): Promise<void> {
  try {
    const flag = await infrai.flags.set({
      key: marketplaceFlag,
      type: "bool",
      default_value: false,
      enabled: true,
    });

    await infrai.flags.rollout(marketplaceFlag, {
      key: marketplaceFlag,
      percentage: 10,
      salt: "marketplace-recommendations",
      sticky_unit: "user_id",
      version: flag.version,
    });
    console.log("Marketplace recommendations are rolling out to 10% of traffic.");
  } finally {
    await infrai.flags.delete(marketplaceFlag);
  }
}

rollOutMarketplace().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
