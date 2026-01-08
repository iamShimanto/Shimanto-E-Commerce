import type { jwtUserPayload } from "../../utils/tokenHelper";

declare global {
  namespace Express {
    interface Request {
      user?: jwtUserPayload;
    }
  }
}

export {};
