export type RequestChannel = "ONL" | "OFF";

export type RequestMeta = {
  requestId: string;
  requestDateTime: string;
  channel: RequestChannel;
};

export const createRequestDateTime = () => {
  const now = new Date();
  const tzOffset = "+07:00";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.` +
    `${String(now.getMilliseconds()).padStart(3, "0")}${tzOffset}`
  );
};

export const createRequestMeta = (): RequestMeta => ({
  requestId: crypto.randomUUID(),
  requestDateTime: createRequestDateTime(),
  channel: "ONL",
});

export const createRequestEnvelopeHeaders = (meta = createRequestMeta()) => ({
  "RT-REQUEST-ID": meta.requestId,
  "RT-REQUEST_DATE_TIME": meta.requestDateTime,
  "RT-CHANNEL": meta.channel,
});
