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
        const employee = await Employee.findById(employeeId, '-__v');
        if (!employee) {
            return res.status(404).json({ msg: 'Funcionário não encontrado!' });
        }
        res.json(employee);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});   

router.post('/', async (req, res) => {
    const { EmployeeName, JobTitle } = req.body;
    try {
        const employee = await Employee.create({ EmployeeName, JobTitle });
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