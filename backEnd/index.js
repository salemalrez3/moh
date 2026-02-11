const express = require('express');
const app = express();
const prisma = require('./db');
const cors = require('cors');
const path = require('path');
const auth = require("./middleware/auth");
app.use(express.json());
app.use(cors());
app.use('/news',auth,require('./routes/news'))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/surveys', auth,require('./routes/survey'));   
app.use('/responses',auth, require('./routes/responses'));
app.use('/attachments',auth,require('./routes/attachments'))
app.use('/newsAttachments',auth,require('./routes/newsAttachments'))
app.use('/',require('./routes/user'))
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});