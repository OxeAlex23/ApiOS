import express from 'express';
import User from '../models/UserSchema.js';
import Business from '../models/BusinessSchema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authObjectId from '../middleware/authObjectId.js';
const router = express.Router();


router.post("/auth", async (req, res) => {
  const { GoogleId, EmailAddress, Password } = req.body;

  try {
    let user = await User.findOne({ EmailAddress });
    if (!user) {
      return res.status(404).json({msg: 'User Not Found!'});
    }

    if (GoogleId) {
      if (user) {
        if (!user.GoogleId) {
          user.GoogleId = GoogleId;
          user.EmailVerified = true;
          await user.save();
        }
      }

      user = user.toObject();
      delete user.Password;

      const token = await jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "1h" })
      return res.status(201).json({ msg: 'login successfully!', token: token, user: user });
    }

    if (Password) {
      if (user) {
        const isMatch = await bcrypt.compare(Password, user.Password || "");
        if (!isMatch) {
          return res.status(401).json({ msg: "incorrect credentials!" });
        }
      }

      user = user.toObject();
      delete user.Password;
      const business = await Business.findById(user.DefaultBusinessId);

      const token = await jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "1h" });
      return res.status(201).json({ msg: 'login successfully!', token: token, User: user, Business: business });
    }

  } catch (err) {
    res.status(500).json({ error: err.message })
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

    
    const user = await User.findByIdAndUpdate( userId, { DefaultBusinessId }, { new: true });

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
    const { UserTypeId, FirstName, LastName, UserImgUrl, PhoneNumber, PhoneVerified, EmailAddress, EmailVerified, CPF, Role, Password, GoogleId, BusinessId } = req.body;

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
      Role: Role || "client",
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
    return res.status(200).json({ msg: "login Google successfully!", user, token: token });


  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const users = await User.find().select('-Password');
  res.json(users);
});

router.get('/:id', authObjectId, async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId, '-Password');
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