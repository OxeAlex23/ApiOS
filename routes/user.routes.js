import express from 'express';
const router = express.Router();
import User from '../models/UserSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.post('/', async (req, res) => {
    const {UserTypeId, FirstName, LastName, UserImgUrl, PhoneNumber, PhoneVerified, EmailAddress, EmailVerified, CPF, Role, BusinessId} = req.body;
    try {
        const user = await User.create({
            UserTypeId, FirstName, LastName, UserImgUrl, PhoneNumber, PhoneVerified, EmailAddress, EmailVerified, CPF, Role, BusinessId
        });
        res.status(200).json({ msg: 'usuário criado com sucesso!', user });
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

router.get('/', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.get('/:id', authObjectId ,async (req, res) => {
    const  userId  = req.params.id;

    try {
        const user = await User.findById(userId).populate('BusinessId', 'BusinessName -_id');
         console.log(user);
        if (!user) {
            return res.status(404).json({ msg: 'usuário não encontrado' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/userByBusiness/:businessId',  async (req, res) => {
    const { businessId } = req.params;
     console.log(req.params);

    try {
        const users = await User.find({ BusinessId: businessId }, '-_id -__v').populate('BusinessId', 'BusinessName -_id');
        console.log(users);

        if (!users || users.length === 0) {
            return res.status(404).json([]);
        }

        res.json(users);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.put('/:id', authObjectId ,async (req, res) => {
  const  userId  = req.params.id;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authObjectId ,async (req, res) => {

    const userDeleted = await User.findByIdAndDelete(req.params.id);

    if (!userDeleted) {
        res.status(404).json({ msg: 'usuário não encontrado!' })
    }
    res.status(200).json({ msg: 'usuário deletado com sucesso!' });
});

export default router;