const router = require("express").Router();
const { getAddresses, addAddress, updateAddress, deleteAddress, setDefault } = require("../controllers/address.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.use(authenticate);
router.get("/", getAddresses);
router.post("/", addAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);
router.patch("/:id/default", setDefault);

module.exports = router;
