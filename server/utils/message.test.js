import { expect } from "chai";

// import { genetateMessage } from "./message.js";

let genetateMessage = (from, text) => {
    return {
      from,
      text,
      createdAt: new Date().getTime(),
    };
  };

describe("Generate Message", () => {
  it("Should generate correct message object", () => {
    let from = "Naira";
    let text = "Some random text";

    let message = genetateMessage(from, text);

    expect(message.createdAt).to.be.number();
    expect(message).matchObject({ from, text });
  });
});
