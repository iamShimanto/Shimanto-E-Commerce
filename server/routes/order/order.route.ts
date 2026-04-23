import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as order from "../../controllers/order/order.controller";
import { roleChecker } from "../../middleware/roleChecker.middleware";

const router = Router();

router.post("/checkout", asyncHandler(order.checkout));

router.get("/get-all", asyncHandler(order.getAllOrders));

router.get("/get-by-id/:id", asyncHandler(order.getOrderById));

router.get(
	"/admin/get-by-id/:id",
	roleChecker("admin", "staff"),
	asyncHandler(order.getOrderByIdForAdmin),
);

router.put("/cancel/:id", asyncHandler(order.cancelOrder));

router.get("/all", roleChecker("admin", "staff"), asyncHandler(order.getAllOrdersForAdmin));

router.put("/update-status/:id", roleChecker("admin", "staff"), asyncHandler(order.updateOrderStatus));


export default router;
