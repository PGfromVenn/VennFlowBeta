var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Connexion MongoDB
const connectDB = require('./config/db');
connectDB();

// Ajout du modèle Router
const Router = require('./models/router');
function generateVennboxCode() {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	let code = '';
	for (let i = 0; i < 12; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
}
Router.findOne({ serial: 'VBSMP00001' }).then(async doc => {
	if (!doc) {
		let code;
		let exists = true;
		while (exists) {
			code = generateVennboxCode();
			exists = await Router.findOne({ code });
		}
		Router.create({
			serial: 'VBSMP00001',
			code,
			name: 'Premier appareil',
			devices: [
				{ type: 'peplink', serial: '293A-5291-D01F' }
				// Starlink à ajouter plus tard
			]
		});
	}
});

var app = express();

// Ajout CORS
const cors = require('cors');
app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const starlinkRouter = require('./routes/starlink');
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/starlink', starlinkRouter);

module.exports = app;
