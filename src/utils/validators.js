const validator = require('validator');

function validateSignupData(data) {
  const errors = {};
  if (validator.isEmpty(data.firstName || '')) {
    errors.firstName = 'First name must not be empty';
  }
  if (validator.isEmpty(data.lastName || '')) {
    errors.lastName = 'Last name must not be empty';
  }
  if (validator.isEmpty(data.email || '')) {
    errors.email = 'Email must not be empty';
  } else {
    const isEmail = validator.isEmail(data.email);
    if (!isEmail) {
      errors.email = 'Email must be a valid email address';
    }
  }
  if (!data.password || data.password.trim() === '') {
    errors.password = 'Password must not be empty';
  }
  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
}

module.exports = { validateSignupData };
