import express from 'express';
import User from '../models/UserSchema.js';
import Business from '../models/BusinessSchema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authObjectId from '../middleware/authObjectId.js';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
dotenv.config();

const clientID = process.env.CLIENT_ID;
const client = new OAuth2Client(clientID);
const router = express.Router();


router.post("/auth", async (req, res) => {
  const { tokenGoogle, EmailAddress, Password } = req.body;

  try {
    if (tokenGoogle) {
      const ticket = await client.verifyIdToken({
        idToken: tokenGoogle,
        audience: clientID
      });
      const payload = ticket.getPayload();
      const GoogleId = payload.sub;
      const EmailAddress = payload.email;


      let user = await User.findOne({ EmailAddress });

      user = user.toObject();
      delete user.Password;

      const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "1h" });
      return res.status(201).json({ msg: 'Login Google successfully!', token, user });
    }

    if (EmailAddress && Password) {
      let user = await User.findOne({ EmailAddress });
      if (!user) return res.status(404).json({ msg: 'User Not Found!' });

      const isMatch = await bcrypt.compare(Password, user.Password || "");
      if (!isMatch) return res.status(401).json({ msg: "Incorrect credentials!" });

      user = user.toObject();
      delete user.Password;
      const business = await Business.findById(user.DefaultBusinessId);

      const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "1h" });
      return res.status(201).json({ msg: 'Login successfully!', token, User: user, Business: business });
    }

    return res.status(400).json({ msg: "data required!" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.patch('/defaultBusiness/:userId', async (req, res) => {
  const { userId } = req.params;
  const { DefaultBusinessId } = req.body;

  try {

    const business = await Business.findById(DefaultBusinessId);
    if (!business) {
      return res.status(404).json({ msg: 'Business Not Found!' });
    }


    const user = await User.findByIdAndUpdate(userId, { DefaultBusinessId }, { new: true });

    if (!user) {
      return res.status(404).json({ msg: 'User Not Found!' });
    }

    return res.status(200).json({ msg: 'Business standard updated successfully!', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const { UserTypeId, FirstName, LastName, UserImgUrl, PhoneNumber, PhoneVerified, EmailAddress, EmailVerified, CPF, Role, BirthDate, Gender, Password, GoogleId, BusinessId } = req.body;

    const userData = {
      UserTypeId: UserTypeId || 1,
      FirstName,
      LastName,
      UserImgUrl,
      PhoneNumber,
      PhoneVerified,
      EmailAddress,
      EmailVerified: true,
      CPF,
      Role,
      BirthDate,
      Gender,
      GoogleId,
      BusinessId
    }

    if (Password) {
      const salt = 10;
      const PasswordHash = await bcrypt.hash(Password, salt);
      userData.Password = PasswordHash;
    }

    const user = await User.create(userData);


    const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "1h" });
    return res.status(200).json({ msg: "user created successfully!", user, token: token });


  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/checkEmail', async (req, res) => {
  try {
    const { EmailAddress } = req.query;
    if (!EmailAddress) {
      return res.status(400).json({ error: 'Email is required!' });
    }

    const user = await User.findOne({ EmailAddress }).select('-Password');
    if (!user) {
      return res.json([]);
    }
    res.status(200).json({ msg: `user exists? ${!!user}` });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const users = await User.find().select('-Password');
  if (!users) {
    return res.json([]);
  }
  res.json(users);
});

router.get('/:id', authObjectId, async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId, '-Password');
    if (!user) {
      return res.status(404).json([]);
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

router.patch('/:id', authObjectId, async (req, res) => {
  const userId = req.params.id;
  const { Password } = req.body;

  try {
    const salt = 10;
    const hashPassword = await bcrypt.hash(Password, salt);

    const updatedUser = await User.findByIdAndUpdate(userId, { Password: hashPassword }, { new: true });
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