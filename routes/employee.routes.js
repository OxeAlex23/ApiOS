import express from 'express';
const router = express.Router();
import Employee from '../models/EmployeeSchema.js';

router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        if (!employees) {
            return res.json([]);
        }
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    const employeeId = req.params.id;
    if (!employeeId) {
        return res.status(404).json({ msg: 'Employee Not Found!' });
    }
    try {
        const employee = await Employee.findById(employeeId, '-__v').populate('BusinessId', 'BusinessName -_id');
        if (!employee) {
            return res.json([]);
        }
        res.json(employee);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/employeeByBusiness/:businessId', async (req, res) => {
    const businessId = req.params.businessId;

    if (!businessId) {
        return res.status(404).json({ msg: 'business Not Found!' });
    }

    try {
        const employees = await Employee.find({ BusinessId: businessId }).populate('BusinessId', 'BusinessName ')

        if (employees.length === 0) {
            return res.json([]);
        }

        const employeesByBusiness = employees.map(emp => ({
            _id: emp._id,
            EmployeeName: emp.EmployeeName,
            JobTitle: emp.JobTitle,
            EmployeeImgUrl: emp.EmployeeImgUrl,
            BusinessName: emp.BusinessId?.BusinessName
        }));

        res.json(employeesByBusiness);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/', async (req, res) => {
    const { EmployeeName, JobTitle, EmployeeImgUrl, BusinessId } = req.body;
    try {
        const employee = await Employee.create({ EmployeeName, JobTitle, EmployeeImgUrl, BusinessId });
        res.status(201).json({ msg: 'Employee created successfully!', employee });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const employeeId = req.params.id;
    const { EmployeeName, JobTitle } = req.body;

    try {
        const employee = await Employee.findByIdAndUpdate(employeeId, { EmployeeName, JobTitle }, { new: true });
        if (!employee) {
            return res.status(404).json({ msg: 'Employee Not Found!' });
        }
        res.json({ msg: 'Employee updated successfully!', employee });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    const employeeId = req.params.id;
    try {
        const employee = await Employee.findByIdAndDelete(employeeId);
        if (!employee) {
            return res.status(404).json({ msg: 'Employee Not Found!' });
        }
        res.json({ msg: 'Employee deleted successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;