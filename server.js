const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const teams = require("./routes/api/items");
const fileRoutes = require("./routes/file-upload-routes");
const { PythonShell } = require("python-shell");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("./config/keys");
// const passport = require("passport");
const validateRegisterInput = require("./validation/register");
const validateLoginInput = require("./validation/login");
const User = require("./models/User");
const Team = require('./models/Team');

const app = express();

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

// Routes
// app.use("/api/users", users);
// app.use("/api/teams", teams);


app.get('/teams', (req, res) => {
  Team.find()
    .then(teams => res.json(teams))
    .catch(err => res.status(404).json({ noteamsfound: 'No Teams found' }));
});

// @route GET api/teams/:id
// @description Get single team by id
// @access Public
app.get('/teams/:id', (req, res) => {
  Team.findById(req.params.id)
    .then(team => res.json(team))
    .catch(err => res.status(404).json({ noteamsfound: 'No Team found' }));
});

app.get("/net", (req, res) => {
  console.log("NetteN Hello World!!");
  res.send("NetteN Hello World!!");
});
// app.use('/api', fileRoutes.routes);

// @route POST api/users/register
// @desc Register user
// @access Public
app.post("/users/register", (req, res) => {
  // Form validation

  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });

      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
app.post("/users/login", (req, res) => {
  // Form validation
  
  console.log(req)
  console.log(res)
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then((user) => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }

    // Check password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
        };

        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926, // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

app.post("/predict", (req, res, next) => {
  //Here are the option object in which arguments can be passed for the python_test.js.
  var input = {
    win: req.body.win,
    lose: req.body.lose,
  };
  console.log(input.win, " VS ", input.lose);
  let options = {
    args: [input.win, input.lose],
  };

  PythonShell.run("app.py", options, function (err, result) {
    if (err) throw err;
    // result is an array consisting of messages collected
    //during execution of script.
    console.log("result: ", result.toString());
    res.send(result.toString());
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server up and running on port ${port} !`));
