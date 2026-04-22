const prisma = require("../config/prisma");

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({ where: { userId: req.user.id } });
    res.json({ addresses });
  } catch (err) {
    next(err);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const { label, street, city, state, pincode, lat, lng, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }

    const address = await prisma.address.create({
      data: { userId: req.user.id, label, street, city, state, pincode, lat, lng, isDefault: isDefault || false },
    });
    res.status(201).json({ address });
  } catch (err) {
    next(err);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    if (req.body.isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.update({ where: { id: req.params.id }, data: req.body });
    res.json({ address });
  } catch (err) {
    next(err);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    await prisma.address.delete({ where: { id: req.params.id } });
    res.json({ message: "Address deleted" });
  } catch (err) {
    next(err);
  }
};

const setDefault = async (req, res, next) => {
  try {
    await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    const address = await prisma.address.update({ where: { id: req.params.id }, data: { isDefault: true } });
    res.json({ address });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress, setDefault };
