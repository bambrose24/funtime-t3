const TRUTHY_VALUES = new Set(["1", "true", "yes", "on"]);

const parseBoolean = (value: string | undefined) => {
  if (!value) {
    return false;
  }
  return TRUTHY_VALUES.has(value.toLowerCase());
};

export const isE2EMode = parseBoolean(process.env.E2E_MODE);
