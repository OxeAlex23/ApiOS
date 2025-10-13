import express from 'express';
const router = express.Router();
import Business from '../models/BusinessSchema.js';
import BusinessUser from '../models/BusinessUserSchema.js';
import OrderStatus from '../models/OrderStatusSchema.js';
import authObjectId from '../middleware/authObjectId.js';

router.get('/', async (req, res) => {
    const business = await Business.find();
    if (!business) {
        return res.json([]);
    }
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
    if (!business) {
        return res.json([]);
    }
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
        LogoImgUrl,
        BrandPrimaryColor,
        BrandSecondaryColor,
        OwnerSignatureUrl,
        ShowServicesProductsImages,
        OwnerName,
        Instagram,
        Facebook,
        Twitter,
        Tiktok

    } = req.body;

    try {

        if (!UserId || !BusinessName) {
            return res.status(400).json({ msg: 'UserId and BusinessName are required!' });
        }

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
            LogoImgUrl,
            BrandPrimaryColor,
            BrandSecondaryColor,
            OwnerSignatureUrl,
            ShowServicesProductsImages,
            OwnerName,
            Instagram,
            Facebook,
            Twitter,
            Tiktok

        });

        const BusinessId = business._id;
        const orderStatusData = [
            {
                OrderStatusDesc: "Concluído",
                BusinessId: BusinessId,
                ShowOnBoard: false,
                IsEditable: false,
                DisplayOrder: 101,
            },
            {
                OrderStatusDesc: "Cancelado",
                BusinessId: BusinessId,
                ShowOnBoard: false,
                IsEditable: false,
                DisplayOrder: 102,
            },
            {
                OrderStatusDesc: "Orçamentos",
                BusinessId: BusinessId,
                ShowOnBoard: true,
                IsEditable: true,
                DisplayOrder: 1,
            },
            {
                OrderStatusDesc: "Em andamento",
                BusinessId: BusinessId,
                ShowOnBoard: true,
                IsEditable: true,
                DisplayOrder: 2,
            },
            {
                OrderStatusDesc: "Aguardando Cliente",
                BusinessId: BusinessId,
                ShowOnBoard: true,
                IsEditable: true,
                DisplayOrder: 3,
            },
        ];

        const newOrderStatus = await OrderStatus.insertMany(orderStatusData, { ordered: false });
        const businessUser = await BusinessUser.create({ UserId, BusinessId });

        res.status(200).json({ msg: 'business, businessUser and orderStatus created successfully!', business, businessUser, newOrderStatus });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.put('/:id', async (req, res) => {
    const businessId = req.params.id;
    try {
        const business = await Business.findByIdAndUpdate(businessId, req.body, { new: true });
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