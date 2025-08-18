import express from 'express';
const router = express.Router();
import Business from '../models/BusinessSchema.js';
import BusinessUser from '../models/BusinessUserSchema.js';
import authObjectId from '../middleware/authObjectId.js';
import uploadImgs from '../middleware/uploadImgs.js';
import sharp from 'sharp';
import crypto from 'crypto';

router.get('/', async (req, res) => {
    const business = await Business.find();
    res.json(business);
});

router.get('/:id', authObjectId, async (req, res) => {
    const businessId = req.params.id;


    if (!businessId) {
        return res.status(404).json({ msg: 'Business Not Found!' })
    }
    const business = await Business.findById(businessId).populate('UserId', 'FirstName LastName -_id');
    res.json(business);
});

// uploadImgs.single("logo") trocar "logo" => "class do input file do front"
router.post('/', uploadImgs.single("logo"), async (req, res) => {
    const { UserId, BusinessName, Address, City, State, PhoneNumber, EmailAddress, Description, AreaId } = req.body;

    try {
        let logo = null;

        if (req.file) {
            const resizedImg = await sharp(req.file.buffer).resize(300).webp({ quality: 80 }).toBuffer();

            logo = { data: resizedImg, contentType: "image/webp" };
        }
        const business = await Business.create({ UserId, BusinessName, LogoImgUrl: logo, Address, City, State, PhoneNumber, EmailAddress, Description, AreaId });

        const BusinessId = business._id;


        const businessUser = await BusinessUser.create({ UserId, BusinessId });
        res.status(200).json({ msg: 'business and businessUser created successfully!', business, businessUser });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id/logo", async (req, res) => {
    try {
        const businessId = req.params.id;
        const business = await Business.findById(businessId);

        if (!business || !business.LogoImgUrl?.data) {
            return res.status(404).json({ msg: "logo Not Found!" });
        }

        const tag = crypto.createHash("md5").update(business.LogoImgUrl.data).digest("hex");

        if (req.headers["if-none-match"] === tag) {
            return res.status(300).end();
        }

        res.set({ "Content-Type": business.LogoImgUrl.contentType, "Cache-Control": "public, max-age=86400", "ETag": tag });
        res.send(business.LogoImgUrl.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.put('/:id', uploadImgs.single("logo"), async (req, res) => {
    try {
        const businessId = req.params.id;
        const business = await Business.findById(businessId);
        if (!business) return res.status(404).json({ error: "Business not found" });

        const { BusinessName, Address, City, State, PhoneNumber, EmailAddress, Description, AreaId } = req.body;

        if (BusinessName) business.BusinessName = BusinessName;
        if (Address) business.Address = Address;
        if (City) business.City = City;
        if (State) business.State = State;
        if (PhoneNumber) business.PhoneNumber = PhoneNumber;
        if (EmailAddress) business.EmailAddress = EmailAddress;
        if (Description) business.Description = Description;
        if (AreaId) business.AreaId = AreaId;


        if (req.file) {
            const resizedImg = await sharp(req.file.buffer)
                .resize(300)
                .webp({ quality: 80 })
                .toBuffer();

            business.LogoImgUrl = { data: resizedImg, contentType: "image/webp" };
        }

        await business.save();

        res.status(200).json({ msg: "Business updated successfully!", business });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authObjectId, async (req, res) => {
    const businessUserId = req.params.id;

    if (!businessUserId) {
        return res.status(404).json({ msg: 'businessUser Not Found!' });
    }

    try {
        const deleteBusinessUser = await Business.findByIdAndDelete(businessUserId);
        res.status(200).json({ msg: 'businessUser deleted successfully!', deleteBusinessUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})
export default router;