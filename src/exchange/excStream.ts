import { BybitStreamPrivate } from "@/exchange/bybit/bybit-private.stream";
import { BybitStreamPublic } from "@/exchange/bybit/bybit-public.stream";
import {
  ExchangeStreamPrivate,
  ExchangeStreamPublic,
} from "@/model/ex-stream.model";
import { Exchange } from "@/type/trade.type";

const publicStreamMap = new Map<Exchange, ExchangeStreamPublic>();

type PublicStreamGetterParams = {
  isTestnet: boolean;
  isDemoTrading: boolean;
};

const publicStreamGetter: Record<
  Exchange,
  (params: PublicStreamGetterParams) => Promise<ExchangeStreamPublic>
> = {
  [Exchange.BYBIT]: async (params: PublicStreamGetterParams) => {
    if (!publicStreamMap.has(Exchange.BYBIT)) {
      publicStreamMap.set(
        Exchange.BYBIT,
        new BybitStreamPublic({
          isTestnet: params.isTestnet,
        }),
      );
    }
    const stream = publicStreamMap.get(Exchange.BYBIT)!;
    await stream.init();
    return stream;
  },
};

export async function runExcPublicStream(params: {
  exc: Exchange;
  streamParams: PublicStreamGetterParams;
}) {
  const streamGetter = publicStreamGetter[params.exc];
  if (!streamGetter) {
    throw new Error(
      `[runExcPublicStream] Stream getter for ${params.exc} not found`,
    );
  }
  await streamGetter(params.streamParams);
}

// ---------------------- private stream ----------------------

const privateStreamMap = new Map<Exchange, ExchangeStreamPrivate>();

type PrivateStreamGetterParams = {
  apiKey: string;
  apiSecret: string;
  isDemoTrading: boolean;
  isTestnet: boolean;
};

const privateStreamGetter: Record<
  Exchange,
  (params: PrivateStreamGetterParams) => Promise<ExchangeStreamPrivate>
> = {
  [Exchange.BYBIT]: async (params: PrivateStreamGetterParams) => {
    if (!privateStreamMap.has(Exchange.BYBIT)) {
      privateStreamMap.set(
        Exchange.BYBIT,
        new BybitStreamPrivate({
          apiKey: params.apiKey,
          apiSecret: params.apiSecret,
          isDemoTrading: params.isDemoTrading,
          isTestnet: params.isTestnet,
        }),
      );
    }
    const stream = publicStreamMap.get(Exchange.BYBIT)!;
    await stream.init();
    return stream;
  },
};

export async function runExcPrivateStream(params: {
  exc: Exchange;
  streamParams: PrivateStreamGetterParams;
}) {
  const streamGetter = privateStreamGetter[params.exc];
  if (!streamGetter) {
    throw new Error(
      `[runExcPrivateStream] Stream getter for ${params.exc} not found`,
    );
  }
  await streamGetter(params.streamParams);
}

// ---------------------- common ----------------------

export type StreamParams = PublicStreamGetterParams & PrivateStreamGetterParams;

export async function runExcStream(params: {
  exc: Exchange;
  streamParams: PublicStreamGetterParams & PrivateStreamGetterParams;
}) {
  await Promise.all([
    runExcPublicStream({
      exc: params.exc,
      streamParams: params.streamParams,
    }),
    runExcPrivateStream({
      exc: params.exc,
      streamParams: params.streamParams,
    }),
  ]);
}
