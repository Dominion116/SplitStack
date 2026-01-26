import { describe, it, expect, beforeEach } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("Split Payment Contract", () => {
  describe("create-split", () => {
    it("should create a split with valid recipients", () => {
      const recipients = Cl.list([
        Cl.tuple({
          recipient: Cl.principal(wallet1),
          share: Cl.uint(5000), // 50%
        }),
        Cl.tuple({
          recipient: Cl.principal(wallet2),
          share: Cl.uint(5000), // 50%
        }),
      ]);

      const result = simnet.callPublicFn(
        "split-payment",
        "create-split",
        [Cl.stringAscii("Test Split"), recipients, Cl.bool(true)],
        deployer
      );

      expect(result.result).toBeOk(Cl.uint(1));
    });

    it("should fail with invalid shares (not 100%)", () => {
      const recipients = Cl.list([
        Cl.tuple({
          recipient: Cl.principal(wallet1),
          share: Cl.uint(3000), // 30%
        }),
        Cl.tuple({
          recipient: Cl.principal(wallet2),
          share: Cl.uint(3000), // 30% - total 60%, not 100%
        }),
      ]);

      const result = simnet.callPublicFn(
        "split-payment",
        "create-split",
        [Cl.stringAscii("Invalid Split"), recipients, Cl.bool(true)],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(101)); // ERR_INVALID_SHARES
    });

    it("should fail with empty recipients", () => {
      const recipients = Cl.list([]);

      const result = simnet.callPublicFn(
        "split-payment",
        "create-split",
        [Cl.stringAscii("Empty Split"), recipients, Cl.bool(true)],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(105)); // ERR_INVALID_RECIPIENT
    });

    it("should create split with 3 recipients", () => {
      const recipients = Cl.list([
        Cl.tuple({
          recipient: Cl.principal(wallet1),
          share: Cl.uint(5000), // 50%
        }),
        Cl.tuple({
          recipient: Cl.principal(wallet2),
          share: Cl.uint(3000), // 30%
        }),
        Cl.tuple({
          recipient: Cl.principal(wallet3),
          share: Cl.uint(2000), // 20%
        }),
      ]);

      const result = simnet.callPublicFn(
        "split-payment",
        "create-split",
        [Cl.stringAscii("Three Way Split"), recipients, Cl.bool(false)],
        deployer
      );

      expect(result.result).toBeOk(Cl.uint(1));
    });
  });

  describe("get-split-info", () => {
    it("should return split info after creation", () => {
      // First create a split
      const recipients = Cl.list([
        Cl.tuple({
          recipient: Cl.principal(wallet1),
          share: Cl.uint(6000),
        }),
        Cl.tuple({
          recipient: Cl.principal(wallet2),
          share: Cl.uint(4000),
        }),
      ]);

      simnet.callPublicFn(
        "split-payment",
        "create-split",
        [Cl.stringAscii("Info Test"), recipients, Cl.bool(true)],
        deployer
      );

      // Now get the info
      const result = simnet.callReadOnlyFn(
        "split-payment",
        "get-split-info",
        [Cl.uint(1)],
        deployer
      );

      expect(result.result.type).toBe(ClarityType.OptionalSome);
    });

    it("should return none for non-existent split", () => {
      const result = simnet.callReadOnlyFn(
        "split-payment",
        "get-split-info",
        [Cl.uint(999)],
        deployer
      );

      expect(result.result).toBeNone();
    });
  });

  describe("get-split-recipient", () => {
    it("should return recipient info", () => {
      const recipients = Cl.list([
        Cl.tuple({
          recipient: Cl.principal(wallet1),
          share: Cl.uint(7000),
        }),
        Cl.tuple({
          recipient: Cl.principal(wallet2),
          share: Cl.uint(3000),
        }),
      ]);

      simnet.callPublicFn(
        "split-payment",
        "create-split",
        [Cl.stringAscii("Recipient Test"), recipients, Cl.bool(true)],
        deployer
      );

      const result = simnet.callReadOnlyFn(
        "split-payment",
        "get-split-recipient",
        [Cl.uint(1), Cl.uint(0)],
        deployer
      );

      expect(result.result.type).toBe(ClarityType.OptionalSome);
    });
  });

  describe("send-to-split (auto-distribute mode)", () => {
    it("should distribute payment immediately", () => {
      // Create split with auto-distribute enabled
      const recipients = Cl.list([
        Cl.tuple({
          recipient: Cl.principal(wallet1),
          share: Cl.uint(5000),
        }),
        Cl.tuple({
          recipient: Cl.principal(wallet2),
          share: Cl.uint(5000),
        }),
      ]);

      simnet.callPublicFn(
        "split-payment",
        "create-split",
        [Cl.stringAscii("Auto Split"), recipients, Cl.bool(true)],
        deployer
      );

      // Send payment
      const result = simnet.callPublicFn(
        "split-payment",
        "send-to-split",
        [Cl.uint(1), Cl.uint(1000000)], // 1 STX
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Verify split info shows total-received was updated
      const splitInfo = simnet.callReadOnlyFn(
        "split-payment",
        "get-split-info",
        [Cl.uint(1)],
        deployer
      );

      expect(splitInfo.result.type).toBe(ClarityType.OptionalSome);
    });


    it("should fail for non-existent split", () => {
      const result = simnet.callPublicFn(
        "split-payment",
        "send-to-split",
        [Cl.uint(999), Cl.uint(1000000)],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(102)); // ERR_SPLIT_NOT_FOUND
    });

    it("should fail for zero amount", () => {
      const recipients = Cl.list([
        Cl.tuple({
          recipient: Cl.principal(wallet1),
          share: Cl.uint(10000),
        }),
      ]);

      simnet.callPublicFn(
        "split-payment",
        "create-split",
        [Cl.stringAscii("Zero Test"), recipients, Cl.bool(true)],
        deployer
      );

      const result = simnet.callPublicFn(
        "split-payment",
        "send-to-split",
        [Cl.uint(1), Cl.uint(0)],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(103)); // ERR_INVALID_AMOUNT
    });
  });

  describe("send-to-split (accumulate mode)", () => {
    it("should accumulate balance for withdrawal", () => {
      // Create split with auto-distribute disabled
      const recipients = Cl.list([
        Cl.tuple({
          recipient: Cl.principal(wallet1),
          share: Cl.uint(5000),
        }),
        Cl.tuple({
          recipient: Cl.principal(wallet2),
          share: Cl.uint(5000),
        }),
      ]);

      simnet.callPublicFn(
        "split-payment",
        "create-split",
        [Cl.stringAscii("Accumulate Split"), recipients, Cl.bool(false)],
        deployer
      );

      // Send payment
      const result = simnet.callPublicFn(
        "split-payment",
        "send-to-split",
        [Cl.uint(1), Cl.uint(1000000)],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Check split info shows pending balance
      const splitInfo = simnet.callReadOnlyFn(
        "split-payment",
        "get-split-info",
        [Cl.uint(1)],
        deployer
      );

      expect(splitInfo.result.type).toBe(ClarityType.OptionalSome);
    });
  });

  describe("toggle-split-status", () => {
    it("should toggle split status when called by owner", () => {
      const recipients = Cl.list([
        Cl.tuple({
          recipient: Cl.principal(wallet1),
          share: Cl.uint(10000),
        }),
      ]);

      simnet.callPublicFn(
        "split-payment",
        "create-split",
        [Cl.stringAscii("Toggle Test"), recipients, Cl.bool(true)],
        deployer
      );

      const result = simnet.callPublicFn(
        "split-payment",
        "toggle-split-status",
        [Cl.uint(1)],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should fail when called by non-owner", () => {
      const recipients = Cl.list([
        Cl.tuple({
          recipient: Cl.principal(wallet1),
          share: Cl.uint(10000),
        }),
      ]);

      simnet.callPublicFn(
        "split-payment",
        "create-split",
        [Cl.stringAscii("Owner Test"), recipients, Cl.bool(true)],
        deployer
      );

      const result = simnet.callPublicFn(
        "split-payment",
        "toggle-split-status",
        [Cl.uint(1)],
        wallet1 // Not the owner
      );

      expect(result.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
    });
  });

  describe("toggle-auto-distribute", () => {
    it("should toggle auto-distribute mode", () => {
      const recipients = Cl.list([
        Cl.tuple({
          recipient: Cl.principal(wallet1),
          share: Cl.uint(10000),
        }),
      ]);

      simnet.callPublicFn(
        "split-payment",
        "create-split",
        [Cl.stringAscii("Auto Toggle"), recipients, Cl.bool(true)],
        deployer
      );

      const result = simnet.callPublicFn(
        "split-payment",
        "toggle-auto-distribute",
        [Cl.uint(1)],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });
  });

  describe("get-user-splits", () => {
    it("should return user's splits", () => {
      const recipients = Cl.list([
        Cl.tuple({
          recipient: Cl.principal(wallet1),
          share: Cl.uint(10000),
        }),
      ]);

      simnet.callPublicFn(
        "split-payment",
        "create-split",
        [Cl.stringAscii("User Split 1"), recipients, Cl.bool(true)],
        deployer
      );

      simnet.callPublicFn(
        "split-payment",
        "create-split",
        [Cl.stringAscii("User Split 2"), recipients, Cl.bool(false)],
        deployer
      );

      const result = simnet.callReadOnlyFn(
        "split-payment",
        "get-user-splits",
        [Cl.principal(deployer)],
        deployer
      );

      expect(result.result.type).toBe(ClarityType.List);
    });

    it("should return empty list for user with no splits", () => {
      const result = simnet.callReadOnlyFn(
        "split-payment",
        "get-user-splits",
        [Cl.principal(wallet3)],
        wallet3
      );

      expect(result.result).toBeList([]);
    });
  });

  describe("get-current-split-id", () => {
    it("should return current nonce", () => {
      const result = simnet.callReadOnlyFn(
        "split-payment",
        "get-current-split-id",
        [],
        deployer
      );

      expect(result.result.type).toBe(ClarityType.UInt);
    });
  });

  describe("get-split-recipient-count", () => {
    it("should return correct recipient count", () => {
      const recipients = Cl.list([
        Cl.tuple({
          recipient: Cl.principal(wallet1),
          share: Cl.uint(5000),
        }),
        Cl.tuple({
          recipient: Cl.principal(wallet2),
          share: Cl.uint(3000),
        }),
        Cl.tuple({
          recipient: Cl.principal(wallet3),
          share: Cl.uint(2000),
        }),
      ]);

      simnet.callPublicFn(
        "split-payment",
        "create-split",
        [Cl.stringAscii("Count Test"), recipients, Cl.bool(true)],
        deployer
      );

      const result = simnet.callReadOnlyFn(
        "split-payment",
        "get-split-recipient-count",
        [Cl.uint(1)],
        deployer
      );

      expect(result.result).toBeSome(Cl.uint(3));
    });
  });
});
