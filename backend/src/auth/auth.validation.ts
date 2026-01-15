import { celebrate, Joi, Segments } from "celebrate";

export const signupValidation = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(60)
      .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
      .required(),

    lastName: Joi.string()
      .trim()
      .min(2)
      .max(60)
      .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
      .required(),

    phone: Joi.string()
      .trim()
      .pattern(/^[0-9\s-]{10,14}$/)
      .required(),

    email: Joi.string().trim().lowercase().email().required(),

    password: Joi.string()
      .min(6)
      .max(72)
      .pattern(/[A-Z]/)
      .pattern(/\d/)
      .pattern(/[^A-Za-z0-9]/)
      .required(),
  }),
});

export const loginValidation = celebrate({
  [Segments.BODY]: Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().min(6).max(72).required(),
  }),
});
