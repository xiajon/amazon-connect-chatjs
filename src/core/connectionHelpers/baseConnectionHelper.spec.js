import BaseConnectionHelper from "./baseConnectionHelper";

import { CONNECTION_TOKEN_POLLING_INTERVAL_IN_MS } from "../../constants";

describe("BaseConnectionHelper connection token expiry", () => {
    // A customChatClient supplies Expiry, so an unparseable value must not become
    // setTimeout(NaN), which fires immediately and re-arms at 0 forever.
    function helperWithExpiry(expiry) {
        return new BaseConnectionHelper({
            fetchConnectionDetails: jest.fn(() => Promise.resolve({})),
            getConnectionTokenExpiry: () => expiry
        }, {});
    }

    test.each([["absent", undefined], ["not a date", "soon"], ["an empty string", ""]])(
        "falls back to the polling interval when Expiry is %s", (_label, expiry) => {
            expect(helperWithExpiry(expiry).getTimeToConnectionTokenExpiry())
                .toBe(CONNECTION_TOKEN_POLLING_INTERVAL_IN_MS);
        });

    test("still computes a real expiry from a valid timestamp", () => {
        const inTenMinutes = new Date(Date.now() + 600000).toISOString();
        const t = helperWithExpiry(inTenMinutes).getTimeToConnectionTokenExpiry();
        expect(Number.isFinite(t)).toBe(true);
        expect(t).toBeLessThan(600000);
        expect(t).toBeGreaterThan(0);
    });
});

describe("BaseConnectionHelper", () => {

    let baseConnectionHelper;
    const connectionDetailsProvider = {
        fetchConnectionDetails: () => {},
        getConnectionTokenExpiry: () => {}
    };

    beforeEach(() => {
        connectionDetailsProvider.fetchConnectionDetails = jest.fn(() => Promise.resolve({
            url: "url",
            expiry: "expiry",
            transportLifeTimeInSeconds: new Date(new Date().getTime() + 60*60*1000),
            connectionAcknowledged: "connectionAcknowledged",
            connectionToken: "connectionToken",
            connectionTokenExpiry: new Date(new Date().getTime() + 22*60*60*1000),
        }));
        // .getConnectionTokenExpiry usually returns the date, in ms since 1969, when this connection token expires)
        connectionDetailsProvider.getConnectionTokenExpiry = jest.fn(() => { return new Date(new Date().getTime() + 22*60*60*1000);});
        baseConnectionHelper = new BaseConnectionHelper(connectionDetailsProvider);
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    test("start initiates fetch interval", () => {
        baseConnectionHelper.start();
        expect(connectionDetailsProvider.fetchConnectionDetails).toHaveBeenCalledTimes(0);
        jest.runOnlyPendingTimers();
        expect(connectionDetailsProvider.fetchConnectionDetails).toHaveBeenCalledTimes(1);
    });

    test("end stops fetch interval", () => {
        baseConnectionHelper.start();
        jest.runOnlyPendingTimers();
        baseConnectionHelper.end();
        jest.runOnlyPendingTimers();
        expect(connectionDetailsProvider.fetchConnectionDetails).toHaveBeenCalledTimes(1);
    });

    test("getTimeToConnectionTokenExpiry returns the expiry, not the date", () => {
    // expect that the expiry returned is a length in ms between now and the expiry date, not a date itself (in ms). 
    // A date (in ms) would be larger than this constant.
        expect(baseConnectionHelper.getTimeToConnectionTokenExpiry()).toBeLessThan(100000000);
    });
});
