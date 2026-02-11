
// const express = require('express');
// const prisma  = require('../db');
// const router  = express.Router();

// router.get("/",async (req,res) => {
//     const templates=await prisma.template.findMany({
//         orderBy:{createdAt:'desc'}
//     });
//     res.json(templates);
// })

// router.post('/', async (req, res) => {
//   const { name, fields } = req.body;
//   const tpl = await prisma.template.create({
//     data: { name, fields }
//   });
//   res.status(201).json(tpl);
// });

// module.exports = router;