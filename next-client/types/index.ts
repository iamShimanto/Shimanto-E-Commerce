export interface ApiResponse<T = unknown> {
	success: boolean;
	message: string;
	data?: T;
}

export interface AuthSession {
	name: string;
	email: string;
	role: string;
}

export interface AuthUser {
	_id?: string;
	fullName?: string;
	name?: string;
	email?: string;
	role?: string;
	phone?: string;
	address?: string;
	avatar?: string;
	isVerified?: boolean;
}

export interface LoginPayload {
	email: string;
	password: string;
}

export interface RegisterPayload {
	fullName?: string;
	email: string;
	password: string;
	phone?: string;
	address?: string;
}

export interface VerifyOtpPayload {
	email: string;
	otp: string;
}

export interface ResetPasswordRequestPayload {
	email: string;
}

export interface ResetPasswordPayload {
	token: string;
	newPassword: string;
}

export interface ChangePasswordPayload {
	currentPassword: string;
	newPassword: string;
}

export interface UpdateProfilePayload {
	fullName?: string;
	phone?: string;
	address?: string;
	avatar?: File | Blob | null;
}

export interface Category {
	_id?: string;
	name: string;
	slug: string;
	thumbnail?: string;
	createdAt?: string;
	updatedAt?: string;
}
