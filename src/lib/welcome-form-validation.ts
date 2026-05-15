const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type WelcomeFormErrors = {
  name?: string;
  email?: string;
};

export function validateWelcomeForm(
  name: string,
  email: string
): WelcomeFormErrors {
  const errors: WelcomeFormErrors = {};
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  if (!trimmedName) {
    errors.name = "Please enter your full name.";
  } else if (trimmedName.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!trimmedEmail) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "Enter a valid email address (e.g. alex@example.com).";
  }

  return errors;
}

export function welcomeFormIsValid(name: string, email: string): boolean {
  return Object.keys(validateWelcomeForm(name, email)).length === 0;
}
