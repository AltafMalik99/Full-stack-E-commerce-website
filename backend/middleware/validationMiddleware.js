const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(req, res, next) {
  const { name, email, password, confirmPassword } = req.body;
  const errors = {};

  if (!name || !name.trim()) errors.name = "Name is required.";
  if (!email || !EMAIL_REGEX.test(email)) errors.email = "A valid email is required.";
  if (!password || password.length < 6)
    errors.password = "Password must be at least 6 characters.";
  if (confirmPassword !== undefined && password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match.";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }
  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = {};

  if (!email || !EMAIL_REGEX.test(email)) errors.email = "A valid email is required.";
  if (!password) errors.password = "Password is required.";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }
  next();
}

export function validateCheckout(req, res, next) {
  const { name, address, city, phone } = req.body.shippingInfo || {};
  const errors = {};

  if (!name || !name.trim()) errors.name = "Name is required.";
  if (!address || !address.trim()) errors.address = "Address is required.";
  if (!city || !city.trim()) errors.city = "City is required.";
  if (!phone || !phone.trim()) errors.phone = "Phone is required.";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }
  next();
}
