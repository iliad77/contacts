export const UserValidation = {
    username: {
        isLength: { options: { min: 5, max: 35 }, errorMessage: "must be between 5 and 35" },
        notEmpty: { errorMessage: "cannot be empty!" },
        isString: { errorMessage: "must be a string value" }
    },
    name: {
        isLength: { options: { min: 5, max: 35 }, errorMessage: "must be between 5 and 35" },
        notEmpty: { errorMessage: "cannot be empty!" },
        isString: { errorMessage: "must be a string value" }
    }

}

import { body, validationResult } from 'express-validator';

export const validateUserData = (validationRules) => {
    return Object.entries(validationRules).map(([field, rules]) => {
        let validator = body(field);
        
        if (rules.notEmpty) validator = validator.notEmpty().withMessage(rules.notEmpty.errorMessage);
        if (rules.isString) validator = validator.isString().withMessage(rules.isString.errorMessage);
        if (rules.isLength) validator = validator.isLength(rules.isLength.options).withMessage(rules.isLength.errorMessage);
        
        return validator;
    });
};

export const validateUserUpdate = [
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
