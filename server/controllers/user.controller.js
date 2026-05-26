import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromS3, uploadMedia, extractS3KeyFromUrl } from "../utils/s3.js";
import { logger } from "../utils/logger.js";
import { getMissingFields, sendError, sendSuccess } from "../utils/apiResponse.js";
import { validateStringField } from "../utils/validators.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";

const authCopy = {
    es: {
        forgotSuccess: "Si la cuenta existe, se envio un enlace para restablecer la contrasena.",
        forgotRequired: "El correo es obligatorio.",
        forgotFailed: "No se pudo iniciar la recuperacion de contrasena",
        resetRequired: "Token, contrasena y confirmacion son obligatorios.",
        invalidResetPayload: "Datos invalidos para restablecer la contrasena",
        passwordMin: "La contrasena debe tener al menos 6 caracteres",
        passwordMatch: "La contrasena y su confirmacion deben coincidir",
        invalidToken: "El token de recuperacion es invalido o expiro",
        resetSuccess: "Contrasena actualizada exitosamente.",
        resetFailed: "No se pudo restablecer la contrasena",
    },
    en: {
        forgotSuccess: "If the account exists, a password reset link has been sent.",
        forgotRequired: "Email is required.",
        forgotFailed: "Failed to start password reset",
        resetRequired: "Token, password and confirm password are required.",
        invalidResetPayload: "Invalid password reset payload",
        passwordMin: "password must be at least 6 characters",
        passwordMatch: "password and confirmPassword must match",
        invalidToken: "Invalid or expired password reset token",
        resetSuccess: "Password updated successfully.",
        resetFailed: "Failed to reset password",
    },
};

const getAuthCopy = (locale) => {
    return String(locale || "es").toLowerCase().startsWith("en") ? authCopy.en : authCopy.es;
};

export const register = async (req,res) => {
    try {
       
        const {name, email, password} = req.body; // patel214
        const missingFields = getMissingFields({ name, email, password });
        if(missingFields.length > 0){
            return sendError(res, {
                status: 400,
                message:"All fields are required.",
                errors: missingFields,
            })
        }
        const user = await User.findOne({email});
        if(user){
            return sendError(res, {
                status: 400,
                message:"User already exist with this email."
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            password:hashedPassword,
            lmsrole: "student",
        });
        return sendSuccess(res, {
            status: 201,
            message:"Account created successfully."
        })
    } catch (error) {
        logger.error("Failed to register user", { error: error.message });
        return sendError(res, {
            status: 500,
            message:"Failed to register"
        })
    }
}
export const login = async (req,res) => {
    try {
        const {email, password} = req.body;
        const missingFields = getMissingFields({ email, password });
        if(missingFields.length > 0){
            return sendError(res, {
                status: 400,
                message:"All fields are required.",
                errors: missingFields,
            })
        }
        const user = await User.findOne({email});
        if(!user){
            return sendError(res, {
                status: 400,
                message:"Incorrect email or password"
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return sendError(res, {
                status: 400,
                message:"Incorrect email or password"
            });
        }
        generateToken(res, user, `Welcome back ${user.name}`);

    } catch (error) {
        logger.error("Failed to login", { error: error.message, email: req.body?.email });
        return sendError(res, {
            status: 500,
            message:"Failed to login"
        })
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email, locale } = req.body;
        const copy = getAuthCopy(locale);
        const missingFields = getMissingFields({ email });
        if (missingFields.length > 0) {
            return sendError(res, {
                status: 400,
                message: copy.forgotRequired,
                errors: missingFields,
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return sendSuccess(res, {
                message: copy.forgotSuccess,
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
        const resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    resetPasswordToken: resetTokenHash,
                    resetPasswordExpiresAt,
                },
            }
        );

        const frontendBaseUrl =
            process.env.CLIENT_URL ||
            process.env.CLIENT_ORIGIN ||
            process.env.FRONTEND_URL ||
            process.env.FRONTEND_ORIGIN ||
            process.env.VITE_CLIENT_URL ||
            "http://localhost:5173";
        const resetUrl = `${frontendBaseUrl.replace(/\/$/, "")}/reset-password/${resetToken}`;

        const emailSent = await sendPasswordResetEmail({
            to: user.email,
            name: user.name,
            resetUrl,
            locale,
        });

        if (!emailSent) {
            logger.warn("Password reset email not sent; mailer unavailable", { userId: user._id, email: user.email });
        }

        return sendSuccess(res, {
            message: copy.forgotSuccess,
            ...(process.env.NODE_ENV !== "production" ? { resetUrl } : {}),
        });
    } catch (error) {
        logger.error("Failed to start password reset", { error: error.message, email: req.body?.email });
        return sendError(res, {
            status: 500,
            message: getAuthCopy(req.body?.locale).forgotFailed,
        });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword, locale } = req.body;
        const copy = getAuthCopy(locale);
        const missingFields = getMissingFields({ token, password, confirmPassword });
        if (missingFields.length > 0) {
            return sendError(res, {
                status: 400,
                message: copy.resetRequired,
                errors: missingFields,
            });
        }

        const validationErrors = [];
        validateStringField("password", password, validationErrors, { required: true });
        validateStringField("confirmPassword", confirmPassword, validationErrors, { required: true });

        if (password && password.length < 6) {
            validationErrors.push(copy.passwordMin);
        }

        if (password !== confirmPassword) {
            validationErrors.push(copy.passwordMatch);
        }

        if (validationErrors.length > 0) {
            return sendError(res, {
                status: 400,
                message: copy.invalidResetPayload,
                errors: validationErrors,
            });
        }

        const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpiresAt: { $gt: new Date() },
        });

        if (!user) {
            return sendError(res, {
                status: 400,
                message: copy.invalidToken,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                    resetPasswordToken: "",
                },
                $unset: {
                    resetPasswordExpiresAt: 1,
                },
            }
        );

        return sendSuccess(res, {
            message: copy.resetSuccess,
        });
    } catch (error) {
        logger.error("Failed to reset password", { error: error.message, token: req.params?.token });
        return sendError(res, {
            status: 500,
            message: getAuthCopy(req.body?.locale).resetFailed,
        });
    }
}

export const logout = async (_,res) => {
    try {
        res.cookie("token", "", {maxAge:0});
        return sendSuccess(res, {
            message:"Logged out successfully."
        })
    } catch (error) {
        logger.error("Failed to logout", { error: error.message });
        return sendError(res, {
            status: 500,
            message:"Failed to logout"
        }) 
    }
}
export const getUserProfile = async (req,res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password").populate("enrolledCourses");
        if(!user){
            return sendError(res, {
                status: 404,
                message:"Profile not found",
            })
        }
        return sendSuccess(res, {
            user
        })
    } catch (error) {
        logger.error("Failed to load user profile", { error: error.message, userId: req.id });
        return sendError(res, {
            status: 500,
            message:"Failed to load user"
        })
    }
}
export const updateProfile = async (req,res) => {
    try {
        const userId = req.id;
        const {name} = req.body;
        const profilePhoto = req.file;

        const validationErrors = [];
        if (name !== undefined) {
            validateStringField("name", name, validationErrors);
        }

        if (!profilePhoto && name === undefined) {
            validationErrors.push("name or profilePhoto is required");
        }

        if (validationErrors.length > 0) {
            return sendError(res, {
                status: 400,
                message: "Invalid profile payload",
                errors: validationErrors,
            });
        }

        logger.debug("Profile update started", { userId, fileName: profilePhoto?.originalname });

        const user = await User.findById(userId);
        if(!user){
            return sendError(res, {
                status: 404,
                message:"User not found",
            }) 
        }
        
        const updatedData = {};

        if (name !== undefined) {
            updatedData.name = name.trim();
        }

        if (profilePhoto) {
            // Delete old photo from S3 if it exists
            if(user.photoUrl && (user.photoUrl.includes('s3') || user.photoUrl.includes('cloudfront'))){
                const key = extractS3KeyFromUrl(user.photoUrl);
                if (key) {
                    await deleteMediaFromS3(key);
                }
            }

            // Upload new photo to S3
            const s3Response = await uploadMedia(profilePhoto.path, profilePhoto.originalname);
            updatedData.photoUrl = s3Response.url;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {new:true}).select("-password");

        return sendSuccess(res, {
            user:updatedUser,
            message:"Profile updated successfully."
        })

    } catch (error) {
        logger.error("Profile update failed", { error: error.message, userId: req.id });
        return sendError(res, {
            status: 500,
            message:"Failed to update profile"
        })
    }
}