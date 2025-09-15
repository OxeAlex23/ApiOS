import express from 'express';
const router = express.Router();
import Business from '../models/BusinessSchema.js';
import BusinessUser from '../models/BusinessUserSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const business = await Business.find();
    res.json(business);
});

router.get('/checkCnpj', async (req, res) => {
    try {
        const { BusinessCode } = req.query;
        if (!BusinessCode) {
            return res.status(400).json({ error: 'Cnpj is required!' });
        }

        const business = await Business.findOne({ BusinessCode });
        res.status(200).json({ msg: `business exists? ${!!business}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', authObjectId, async (req, res) => {
    const businessId = req.params.id;


    if (!businessId) {
        return res.status(404).json({ msg: 'Business Not Found!' })
    }
    const business = await Business.findById(businessId).populate('UserId', 'FirstName LastName -_id');
    res.json(business);
});

router.post('/', async (req, res) => {
    const {
        UserId,
        BusinessName,
        FantasyName,
        BusinessType,
        CompanySize,
        LegalNature,
        FullAddress,
        City,
        Email,
        Phone,
        BusinessCode,
        BusinessSituation,
        IsMEI,
        Coordinates,
        LogoImgUrl
    } = req.body;

    try {

        const business = await Business.create({
            UserId,
            BusinessName,
            FantasyName,
            BusinessType,
            CompanySize,
            LegalNature,
            FullAddress,
            City,
            Email,
            Phone,
            BusinessCode,
            BusinessSituation,
            IsMEI,
            Coordinates,
            LogoImgUrl
        });

        const BusinessId = business._id;


        const businessUser = await BusinessUser.create({ UserId, BusinessId });
        res.status(200).json({ msg: 'business and businessUser created successfully!', business, businessUser });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const businessId = req.params.id;
        const business = await Business.findById(businessId);
        if (!business) return res.status(404).json({ error: "Business not found" });

        const {
            BusinessName,
            FantasyName,
            BusinessType,
            CompanySize,
            LegalNature,
            Address,
            Email,
            Phone,
            BusinessCode,
            BusinessSituation,
            IsMEI,
            Coordinates
        } = req.body;

        if (BusinessName) business.BusinessName = BusinessName;
        if (FantasyName) business.FantasyName = FantasyName;
        if (BusinessType) business.BusinessType = BusinessType;
        if (CompanySize) business.CompanySize = CompanySize;
        if (LegalNature) business.LegalNature = LegalNature;
        if (Address) business.Address = Address;
        if (Email) business.Email = Email;
        if (BusinessCode) business.BusinessCode = BusinessCode;
        if (BusinessSituation) business.BusinessSituation = BusinessSituation;
        if (IsMEI) business.IsMEI = IsMEI;
        if (Coordinates) business.Coordinates = Coordinates;

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
});

export default router;