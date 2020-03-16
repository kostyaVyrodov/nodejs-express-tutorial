const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
const router = express.Router()

mongoose.connect('mongodb://localhost/playground', { useNewUrlParser: true, useUnifiedTopology: true });


/** Types of mongo db schema
 *  String,
 *  Number,
 *  Date,
 *  Buffer,
 *  Boolean,
 *  ObjectID,
 *  Array
 * 
 * Update approach: query + save, update directly
 */

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 255,
    match: /pattern/
  },
  category: {
    type: String,
    required: true,
    enum: ['web', 'mobile', 'network'],
    lowercase: true,
    // uppercase: true
    // trim: true
  },
  author: String,
  tags: {
    type: Array,
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: 'A course should have at least one tag.'
    }
  },
  date: { type: Date, default: Date.now() },
  isPublished: Boolean,
  price: {
    type: Number,
    required: function () { return this.isPublished },
    min: 10,
    max: 200,
    get: v => Math.round(v),
    set: v => Math.round(v)
  }
});

const Course = mongoose.model('Course', courseSchema);

router.get('/', async (req, res) => {
  const courses = await Course.find()
    .sort({ name: 1 })
    .select({ name: 1, author: 1 });
  res.send(courses);
});


router.get('/published', async (req, res) => {
  const courses = await Course
    .find({ isPublished: true })
    .or([{ tags: 'frontend' }, { tags: 'backend' }])
    .sort('-price')
    .select({ name: 1, author: 1, price: 1 });

  res.send(courses);
});

router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404).send('The course with given ID does not exist');
  }

  res.send(course);
});

router.post('/', (req, res) => {
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

router.put('/:id', (req, res) => {
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

router.delete('/:id', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) {
    return res.status(404).send('The course with given ID does not exist');
  }

  const index = courses.indexOf(course);
  courses.splice(index, 1);

  res.send(course);
});

const validateCourse = (course) => {
  const schema = {
    name: Joi.string().min(3).required()
  }

  const result = Joi.validate(course, schema);
  return result;
}

module.exports = router;
