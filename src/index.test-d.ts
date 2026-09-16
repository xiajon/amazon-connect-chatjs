/**
 * Type tests for the `customChatClient` surface. `tsc` compiles every .ts under the root, so
 * the check itself is the assertion. `@ts-expect-error` marks a line that must fail to
 * compile; if one stops failing, tsc reports an unused directive and the build breaks.
 */

/* eslint-disable */

class MinimalClient extends connect.ChatSession.ChatClient {
  createParticipantConnection(
    participantToken: string | null,
    type: string[] | null,
    acknowledgeConnection: boolean | null
  ) {
    return Promise.resolve({
      data: {
        Websocket: { Url: "wss://example.com", ConnectionExpiry: "2026-01-01T00:00:00Z" },
        ConnectionCredentials: { ConnectionToken: "token", Expiry: "2026-01-01T00:00:00Z" }
      }
    });
  }

  disconnectParticipant(connectionToken: string | null) {
    return Promise.resolve({ data: {} });
  }

  sendMessage(
    connectionToken: string | null,
    content: string,
    contentType: string,
    clientToken?: string
  ) {
    return Promise.resolve({ data: { Id: "id", AbsoluteTime: "time" } });
  }

  sendEvent(
    connectionToken: string | null,
    contentType: string,
    content: string,
    clientToken?: string
  ) {
    return Promise.resolve({ data: { Id: "id", AbsoluteTime: "time" } });
  }

  getTranscript(connectionToken: string | null, args: connect.GetTranscriptArgs) {
    return Promise.resolve({ data: { InitialContactId: "id", Transcript: [] } });
  }
}

// Leaving the optional operations inherited is supported.
const textOnly: connect.ChatClient = new MinimalClient();

const perSession: connect.ChatSessionOptions = { customChatClient: new MinimalClient() };

connect.ChatSession.setGlobalConfig({ customChatClient: new MinimalClient() });
connect.ChatSession.setGlobalConfig({ customChatClient: null });

// @ts-expect-error: does not implement the abstract members of ChatClient
class EmptySubclass extends connect.ChatSession.ChatClient {}

// @ts-expect-error: cannot create an instance of an abstract class
const bareBase = new connect.ChatSession.ChatClient();

class WrongSignature extends MinimalClient {
  // @ts-expect-error: content is a string, not a number
  sendMessage(connectionToken: string | null, content: number, contentType: string) {
    return Promise.resolve({ data: { Id: "id", AbsoluteTime: "time" } });
  }
}

// @ts-expect-error: missing the other ten operations
const partialDuckType: connect.ChatClient = { sendMessage: () => Promise.resolve({ data: {} }) };

// The base class is reachable both ways, so both must compile and both must exist at runtime.
class ViaNamespaceRoot extends connect.ChatClient {
  createParticipantConnection(
    participantToken: string | null,
    type: string[] | null,
    acknowledgeConnection: boolean | null
  ) {
    return new MinimalClient().createParticipantConnection(participantToken, type, acknowledgeConnection);
  }

  disconnectParticipant(connectionToken: string | null) {
    return new MinimalClient().disconnectParticipant(connectionToken);
  }

  sendMessage(connectionToken: string | null, content: string, contentType: string, clientToken?: string) {
    return new MinimalClient().sendMessage(connectionToken, content, contentType, clientToken);
  }

  sendEvent(connectionToken: string | null, contentType: string, content: string, clientToken?: string) {
    return new MinimalClient().sendEvent(connectionToken, contentType, content, clientToken);
  }

  getTranscript(connectionToken: string | null, args: connect.GetTranscriptArgs) {
    return new MinimalClient().getTranscript(connectionToken, args);
  }
}

export {
  MinimalClient,
  textOnly,
  perSession,
  EmptySubclass,
  bareBase,
  WrongSignature,
  partialDuckType,
  ViaNamespaceRoot
};
