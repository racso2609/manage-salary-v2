export const cleanData = (messages: unknown): any => {
  const isArray = Array.isArray(messages);
  if (isArray) return messages.map((message) => cleanData(message));

  const isObject = typeof messages === "object";

  if (isObject)
    // @ts-expect-error this type of data should have keys
    return Object.keys(messages).reduce(
      (acc, key) => {
        // @ts-expect-error this type of data should have keys
        const value = messages[key];
        const sanitizedValue = cleanData(value);

        acc[key] = sanitizedValue;
        return acc;
      },
      {} as Record<string, unknown>,
    );
  const toStringTypes = ["string", "number", "bigint", "boolean"];

  // @ts-expect-error this type of data should have toString
  if (toStringTypes.includes(typeof messages)) return messages.toString();

  return messages;
};
