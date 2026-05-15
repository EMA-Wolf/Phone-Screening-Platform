import {
  validateWelcomeForm,
  welcomeFormIsValid,
} from "@/lib/welcome-form-validation";

describe("validateWelcomeForm", () => {
  it("returns no errors for valid name and email", () => {
    expect(validateWelcomeForm("Alex Johnson", "alex@example.com")).toEqual(
      {}
    );
    expect(welcomeFormIsValid("Alex Johnson", "alex@example.com")).toBe(true);
  });

  it("trims whitespace before validating", () => {
    expect(
      validateWelcomeForm("  Alex Johnson  ", "  alex@example.com  ")
    ).toEqual({});
  });

  it("requires a name", () => {
    expect(validateWelcomeForm("", "alex@example.com")).toEqual({
      name: "Please enter your full name.",
    });
    expect(validateWelcomeForm("   ", "alex@example.com")).toEqual({
      name: "Please enter your full name.",
    });
  });

  it("requires name to be at least 2 characters", () => {
    expect(validateWelcomeForm("A", "alex@example.com")).toEqual({
      name: "Name must be at least 2 characters.",
    });
  });

  it("requires an email", () => {
    expect(validateWelcomeForm("Alex Johnson", "")).toEqual({
      email: "Please enter your email address.",
    });
    expect(validateWelcomeForm("Alex Johnson", "   ")).toEqual({
      email: "Please enter your email address.",
    });
  });

  it("rejects malformed emails", () => {
    const invalidEmails = ["email@", "@example.com", "alex", "alex@", "a@b"];

    for (const email of invalidEmails) {
      expect(validateWelcomeForm("Alex Johnson", email)).toEqual({
        email: "Enter a valid email address (e.g. alex@example.com).",
      });
      expect(welcomeFormIsValid("Alex Johnson", email)).toBe(false);
    }
  });

  it("returns both errors when name and email are invalid", () => {
    expect(validateWelcomeForm("", "email@")).toEqual({
      name: "Please enter your full name.",
      email: "Enter a valid email address (e.g. alex@example.com).",
    });
  });
});

describe("welcomeFormIsValid", () => {
  it("is false when any field fails validation", () => {
    expect(welcomeFormIsValid("", "")).toBe(false);
    expect(welcomeFormIsValid("Alex", "bad-email")).toBe(false);
  });
});
