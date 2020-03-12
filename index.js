const express = require('express');
const Joi = require('joi');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./logger');

const app = express();

const courses = [
	{ id: 1, name: 'course1' },
	{ id: 2, name: 'course2' },
	{ id: 3, name: 'course3' },
]

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());
app.use(morgan());
app.use(logger)

app.get('/', (req, res) => {
	res.send('Hello world!!!');
});

app.get('/api/courses', (req, res) => {
	res.send(courses);
});

app.get('/api/courses/:id', (req, res) => {
	const course = courses.find((c) => c.id === parseInt(req.params.id, 10));
	if (!course) {
		res.status(404).send('The course with given ID does not exist');
	}

	res.send(course);
});

app.post('/api/courses', (req, res) => {
	const { error } = validateCourse(req.body)
	if (error) {
		return res.status(400).send(error.details[0].message)
	}

	const course = {
		id: courses.length + 1,
		name: req.body.name
	}

	courses.push(course);
	res.send(course);
});

app.put('/api/courses/:id', (req, res) => {
	const course = courses.find(c => c.id === parseInt(req.params.id));
	if (!course) {
		return res.status(404).send('The course with given ID does not exist');
	}

	const { error } = validateCourse(req.body)
	if (error) {
		res.status(400).send(error.details[0].message)
	}

	course.name = req.body.name;
	res.send(course);
});

app.delete('/api/courses/:id', (req, res) => {
	const course = courses.find(c => c.id === parseInt(req.params.id));
	if (!course) {
		return res.status(404).send('The course with given ID does not exist');
	}

	const index = courses.indexOf(course);
	courses.splice(index, 1);

	res.send(course);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening ${port}`));

const validateCourse = (course) => {
	const schema = {
		name: Joi.string().min(3).required()
	}

	const result = Joi.validate(course, schema);
	return result;
}