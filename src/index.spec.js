import { ChatSession } from "./index";
import pkg from '../package.json';

const ChatSessionObject = {
    csmService: "csmService",
    ChatClient: "ChatClient"
};
const LogLevel = "LogLevel";
const LogManager = "LogManager";

jest.mock("./core/chatSession", () => ({
    ChatSessionObject : ChatSessionObject
}));
jest.mock("./log", () => ({
    LogManager,
    LogLevel,
}));

describe("Chat JS index file", () => {
    test("ChatSession should equal ChatSessionObject", () => {
        expect(ChatSession).toEqual(ChatSessionObject);
    });

    test("should mutate global connect object", () => {
        expect(global.connect.ChatSession).toEqual(ChatSessionObject);
        expect(global.connect.LogManager).toEqual(LogManager);
        expect(global.connect.LogLevel).toEqual(LogLevel);
        expect(global.connect.csmService).toEqual("csmService");
    });

    // index.d.ts types connect.ChatClient as an extendable class, so `extends connect.ChatClient`
    // compiles; without this the customer's bundle throws before any chat starts.
    test("should expose the ChatClient base class on the connect namespace", () => {
        expect(global.connect.ChatClient).toEqual("ChatClient");
        expect(global.connect.ChatSession.ChatClient).toEqual("ChatClient");
    });

    test('should expose ChatJS.version with correct version', () => {
        console.log(global.connect.ChatJS);
        expect(global.connect.ChatJS.version).toBeDefined();
        expect(global.connect.ChatJS.version).toBe(process.env.npm_package_version); // "3.x.x"
        expect(global.connect.ChatJS.version).toBe(pkg.version); // "3.x.x"
    });
});
