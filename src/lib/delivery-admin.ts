export const deliveryStages = ["not_started", "account_created", "applied", "sandbox_access", "production_approved"] as const;
export type DeliveryStage = (typeof deliveryStages)[number];
export type DirectDeliveryProvider = "doordash_drive" | "uber_direct";

export type DeliveryAdminSettings = {
  paused: boolean;
  preferredProvider: DirectDeliveryProvider | null;
  doordashStage: DeliveryStage;
  uberStage: DeliveryStage;
  updatedAt: string;
};

export const defaultDeliverySettings: DeliveryAdminSettings = {
  paused: true,
  preferredProvider: null,
  doordashStage: "not_started",
  uberStage: "account_created",
  updatedAt: "",
};

export const deliveryStageLabels: Record<DeliveryStage, string> = {
  not_started: "Not started",
  account_created: "Account created",
  applied: "Application submitted",
  sandbox_access: "Sandbox access",
  production_approved: "Production approved",
};

export const deliveryPartners = [
  {
    id: "doordash_drive" as const,
    name: "DoorDash Drive",
    action: "DoorDash signup guide",
    url: "https://developer.doordash.com/en-US/docs/drive/overview/integration_requirements/",
    steps: [
      "Open the DoorDash Developer Portal and apply for Drive API access.",
      "Complete the business and integration details with DoorDash.",
      "Wait for approval, then test in the sandbox before requesting production access.",
    ],
  },
  {
    id: "uber_direct" as const,
    name: "Uber Direct",
    action: "Open Uber Direct dashboard",
    url: "https://direct.uber.com/",
    steps: [
      "Urban Krave's Uber Direct account has been created.",
      "Confirm billing and production approval in the Uber Direct dashboard.",
      "Verify the API credentials here before testing quotes and deliveries.",
    ],
  },
] as const;
