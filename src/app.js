const express = require('express')
const path = require('path')
var cookieParser = require("cookie-parser")
var session = require("express-session")
const app = express()
const UserController = require('./controllers/user') 
const { UserModel } = require('./models')
var debug = require("debug")("index.js");
const {connectToDb} = require('./models/db')
const User = require('./models/register')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
// const registerRoute = require('register')

// (async () => {
//   try {
//       const db = await connectToDb(); 
//       console.log('Database connected successfully!');
//   } catch (error) {
//       console.error('Error connecting to database:', error);
//       process.exit(1); 
//   }
// })();


mongoose.set("strictQuery", false); 
const mongoDB = "mongodb+srv://24560002:Info123@csbu103.q3boj.mongodb.net/?retryWrites=true&w=majority&appName=CSBU103"; 
main().catch((err) => console.log(err)); 
async function main() { 
await mongoose.connect(mongoDB); 
} 

app.use(express.json())
app.use(express.urlencoded(({ extended: false })))
// app.set('view engine', 'pug')
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(bodyParser.json())


app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/users', UserController)
app.use(cookieParser())
app.use(
  session({
    secret: "demoapp",
    name: "app",
    resave: false,
    saveUninitialized: true,
    cookie: {maxAage: 60000}
    // cookie: { maxAge: 10000 } /* 6000 ms? 6 seconds -> wut? :S */
  })
);
const checkLoggedIn = function(req, res, next) {
  if (req.session.loggedIn) {
    debug(
      "checkLoggedIn(), req.session.loggedIn:",
      req.session.loggedIn,
      "executing next()"
    );
    next();
  } else {
    debug(
      "checkLoggedIn(), req.session.loggedIn:",
      req.session.loggedIn,
      "rendering login"
    );
    res.redirect("login");
  }
}


// app.get('/', checkLoggedIn, async function (req, res) {
//   // res.sendFile(path.join(__dirname,'index.html'))
//   const allUsers = await UserModel.getAllUsers() 
//   console.log(allUsers)
//   res.render('index', { data: allUsers || [] })

// })

app.post('/login', async function(req, res) {
  const { username, password } = req.body     
    try {
        const user = await UserModel.findUserByUsername(username)
        // FAIL-FAST 
        console.log({ user });
        
        if(!user || user.username !== username || user.password !== password) throw new Error('Unauthorized access')
        req.session.loggedIn = true
        res.redirect('/')
    }
    catch(error) {
      console.error(error)
      res.render('login', { error: error.message })
    }
})

// app.get('/login', function(req, res) {
//   if(req.session.loggedIn) res.redirect('/')
//   res.render('login')
// })


// app.get('/', function(req, res) {
//   res.send('Connected')
// })

app.get('/hone', function(req, res) {
  res.render('home')
})

app.get('/register', function(req, res) {
  res.render('register')
})

// router.post('/register', async (req, res) => {
//   const {username, password, confirmPassword} = req.body
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{6,}$/;
  
//   res.render("home")
// })




app.post('/register', async(req, res) => {
  const { username, password, confirmPassword } = req.body
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{6,}$/;

 if(!username || !password || !confirmPassword) {
  return res.status(400).json({ message: 'All fields are required.'})
 }

 if (!emailRegex.test(username)) {
  return res.status(400).json({message: 'Invalid email format.'})
 }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({message: 'Password must have at least 6 characters, 1 number, and 1 special character.'})
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  // const existingUser = await User.findOne({username})
  // if (existingUser) {
  //   return res.status(400).json({message: 'User already exists.'})
  // }

  try {
    // const existingUser = await User.findUserByUsername(username)
    // if (existingUser) {
    //   return res.status(400).json({message: 'User already exists'})
    // }


    const existingUser = await User.findOne({username})
  if (existingUser) {
    return res.status(400).json({message: 'User already exists.'})
  }


    const hashPassword = await bcrypt.hash(password, 10)
    const newUser = new User({username, password: hashPassword})
    await newUser.save()
    // await User.insertMany([newUser])
    req.session.user = {
      id: newUser._id,
      username: newUser.username
    }
    console.log("New user created")
    // return res.status(201).json({ success: true, redirect: '/home' });    
    res.render('home')
  } catch (error) {
      console.error('Error during registration', error)
      res.status(500).json({message: 'Server error'})
  }
})

app.get('/session', function (req, res) {
  if(req.session.user) {
    res.status(200).json({message: 'Session active', user: req.session.user})
  } else {
    res.status(401).json({message: 'No active session'})
  }
})

app.post('/logout', function (req, res) {
  req.session.destroy((error) => {
    return res.status(500).json({message: 'Error logging out.'})
  })
  res.clearCookie('connect.sid')
  res.status(200).json({message: 'Logged out successfully.'})
})



app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})




