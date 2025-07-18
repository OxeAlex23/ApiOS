import express from 'express';
const router = express.Router();
import Employee from '../models/EmployeeSchema.js';

router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    const employeeId = req.params.id;
    if (!employeeId) {
        return res.status(404).json({ msg: 'Funcionário não encontrado!' });
    }
    try {
        const employee = await Employee.findById(employeeId, '-__v').populate('BusinessId', 'BusinessName -_id');
        if (!employee) {
            return res.status(404).json({ msg: 'Funcionário não encontrado!' });
        }
        res.json(employee);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});   

router.get('/employeeByBusiness/:businessId', async (req, res) => {
    const businessId = req.params.businessId;

    if (!businessId) {
        return res.status(404).json({ msg: 'ID do negócio não encontrado!' });
    }

    try {
        const employees = await Employee.find({ BusinessId: businessId }).populate('BusinessId', 'BusinessName -_id');

        if (employees.length === 0) {
            return res.status(404).json({ msg: 'Nenhum funcionário encontrado para este negócio!' });
        }

        const employeesByBusiness = employees.map(emp => ({
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
        res.status(201).json({ msg: 'Funcionário criado com sucesso!', employee });
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
            return res.status(404).json({ msg: 'Funcionário não encontrado!' });
        }
        res.json({ msg: 'Funcionário atualizado com sucesso!', employee });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    const employeeId = req.params.id;
    try {
        const employee = await Employee.findByIdAndDelete(employeeId);
        if (!employee) {
            return res.status(404).json({ msg: 'Funcionário não encontrado!' });
        }
        res.json({ msg: 'Funcionário deletado com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;