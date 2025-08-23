import express from 'express';
import User from '../models/UserSchema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authObjectId from '../middleware/authObjectId.js';
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { UserTypeId, FirstName, LastName, UserImgUrl, PhoneNumber, PhoneVerified, EmailAddress, EmailVerified, CPF, Role, Password, GoogleId, BusinessId } = req.body;

    let user = await User.findOne({ EmailAddress });
    if (GoogleId) {
      if (user) {

        if (!user.GoogleId) {
          user.GoogleId = GoogleId;
          user.EmailVerified = true;
          await user.save();
        }
      } else {
 
        user = await User.create({
          UserTypeId: UserTypeId || 1,
          FirstName,
          LastName,
          UserImgUrl,
          PhoneNumber,
          PhoneVerified,
          EmailAddress,
          EmailVerified: true,
          CPF,
          Role: Role || "client",
          GoogleId,
          BusinessId
        });
      }

      const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "1h" });
      return res.status(200).json({ msg: "login Google successfully!", user, token: token });
    }

    if (Password) {
      if (user) {

        const isMatch = await bcrypt.compare(Password, user.Password || "");
        if (!isMatch) {
          return res.status(401).json({ msg: "incorrect credentials!" });
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "1h" });
        return res.status(200).json({ msg: "login successfully!", token: token });
      } else {
        
        const salt = 10;
        const hashPassword = await bcrypt.hash(Password, salt);

        user = await User.create({
          UserTypeId,
          FirstName,
          LastName,
          UserImgUrl,
          PhoneNumber,
          PhoneVerified,
          EmailAddress,
          EmailVerified,
          CPF,
          Role,
          Password: hashPassword,
          BusinessId
        });

        const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "1h" });
        return res.status(201).json({ msg: "user created successfully !", user, token: token });
      }
    }

    return res.status(400).json({ msg: "enter a login method!" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.get('/:id', authObjectId, async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId).populate('BusinessId', 'BusinessName -_id');
        console.log(user);
        if (!user) {
            return res.status(404).json({ msg: 'user Not Found!' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.put('/:id', authObjectId, async (req, res) => {
    const userId = req.params.id;

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ msg: 'user Not Found!' });
        }
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authObjectId, async (req, res) => {

    const userDeleted = await User.findByIdAndDelete(req.params.id);

    if (!userDeleted) {
        res.status(404).json({ msg: 'user Not Found!' })
    }
    res.status(200).json({ msg: 'user deleted successfully!' });
});

export default router;