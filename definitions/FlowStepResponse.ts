export type FlowStepResponseV2 = {
  version: 2;
  data: [
    {
      objectType: string;
      raw?: Record<string, any>;
      mapped?: Record<string, any>;
      events?: Record<string, any>[];
    }
  ];
};
