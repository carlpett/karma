import { useState, useEffect, useCallback } from "react";

import { MockAPIResponse, MockSilenceResponse } from "__mocks__/Fetch";

interface mockedDataT {
  response: any;
  error: undefined | string;
  isLoading: undefined | boolean;
  isRetrying: undefined | boolean;
}

const MockFetchStats = {
  getCalls: [] as string[],
  get calls() {
    return this.getCalls;
  },
  wasCalled(uri: string) {
    this.getCalls.push(uri);
  },
  reset() {
    this.getCalls = [] as string[];
    this.mockedData = {
      response: undefined,
      error: undefined,
      isLoading: undefined,
      isRetrying: undefined,
    };
  },
  mockedData: {
    response: undefined,
    error: undefined,
    isLoading: undefined,
    isRetrying: undefined,
  } as mockedDataT,
  setMockedData(data: mockedDataT) {
    this.mockedData = data;
  },
};

const Mock = (uri: string, { autorun = true, deps = [] } = {}) => {
  const [response, setResponse] = useState(null as null | any);
  const [error] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRetrying] = useState<boolean>(false);

  const cancelGet = useCallback(() => {}, []);

  const get = useCallback(() => {
    MockFetchStats.wasCalled(uri);

    const mockResponses = [
      // matcher name select suggestions
      {
        uri: "./labelNames.json",
        response: ["cluster", "job", "instance"],
      },
      // matcher value select suggestions
      {
        uri: "./labelValues.json?name=cluster",
        response: ["dev", "staging", "prod"],
      },
      // matcher value counters
      {
        re: /^\.\/alerts\.json\?q=/,
        response: MockAPIResponse(),
      },
      // silence browser
      {
        re: /^.\/silences\.json\?/,
        response: MockSilenceResponse("am", 14),
      },
      // filter autocomplete
      {
        uri: "./autocomplete.json?term=cluster",
        response: [
          "cluster=staging",
          "cluster=prod",
          "cluster=dev",
          "cluster!=staging",
          "cluster!=prod",
          "cluster!=dev",
        ],
      },
      {
        re: /^.\/autocomplete\.json\?term=/,
        response: ["foo=bar", "foo=~bar"],
      },
    ];

    for (const m of mockResponses) {
      if (m.re && uri.match(m.re)) {
        setResponse(m.response);
        setIsLoading(false);
        break;
      } else if (m.uri === uri) {
        setResponse(m.response);
        setIsLoading(false);
        break;
      }
    }
  }, [uri]);

  useEffect(() => {
    if (autorun) get();
    // eslint doesn't like ...deps
    // eslint-disable-next-line
  }, [uri, get, cancelGet, autorun, ...deps]);

  return {
    response:
      MockFetchStats.mockedData.response !== undefined
        ? MockFetchStats.mockedData.response
        : response,
    error:
      MockFetchStats.mockedData.error !== undefined
        ? MockFetchStats.mockedData.error
        : error,
    isLoading:
      MockFetchStats.mockedData.isLoading !== undefined
        ? MockFetchStats.mockedData.isLoading
        : isLoading,
    isRetrying:
      MockFetchStats.mockedData.isRetrying !== undefined
        ? MockFetchStats.mockedData.isRetrying
        : isRetrying,
    get,
    cancelGet,
  };
};

const useFetchGet = jest.fn(Mock);
(useFetchGet as any).fetch = MockFetchStats;
(useFetchGet as any).mockReset = () => {
  useFetchGet.mockClear();
  useFetchGet.mockImplementation(Mock);
  MockFetchStats.reset();
};

export { useFetchGet };
