import express, { Application, Request, Response } from 'express'
import bcrypt from "bcryptjs";
import modules from './modules';
import path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import Transaction from './models/transaction.model';
import User, { IUser } from './models/user.model';
import { SignInBody } from './modules/user/interface/users.types';
import { loginResponse } from './utils/login-response';
import { BadRequestException } from './utils/service-exception';
import { error } from 'console';
const app: Application = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json())
app.use(modules);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
const requireLogin = (req, res, next) => {
    const authCookie = req.cookies.auth;
    if (authCookie) {
        // User is logged in
        next();
    } else {
        // User is not logged in, redirect to login page or show an error message
        res.redirect('/login'); // Redirect to the login page

    }
};
app.get('/', (req: Request, res: Response) => {

    res.render('index.ejs');
});

app.post('/deposit', requireLogin, (req: Request, res: Response) => {
    const authCookie = req.cookies.auth;
    const {
        amount,
        type,
        coin,
        userId,
        status
    } = req.body;
    try {
        const data = {
            amount,
            type,
            coin,
            status,
            userId
        };
        
        
        const auth = JSON.parse(authCookie)
        data.userId = auth.email;
        data.status = "Pending"
        data.type = "Deposit"
        const deposit = Transaction.create(data);
        const message = 'Submitted, copy the wallet address'; // Set the success message
        res.render('wallet-address.ejs', { coin, message });
    } catch (err) {
        console.log(err);
    }

});
app.get('/dashboard', requireLogin, async (req: Request, res: Response) => {
    const authCookie = req.cookies.auth;

    if (!authCookie) {
        return res.redirect('/login'); // Redirect to the login page if the user data cookie is not found
    }

    const auth = JSON.parse(authCookie); // Parse the user data from the cookie

    res.render('dashboard.ejs', { user: auth });
});
app.post('/withdraw', requireLogin,async (req: Request, res: Response) => {
    const authCookie = req.cookies.auth;
    const {
        amount,
        type,
        coin,
        userId,
        address,
        status
    } = req.body;
    try {
        const data = {
            amount,
            type,
            coin,
            status,
            address,
            userId
        };
        
        
        const auth = JSON.parse(authCookie)
        data.userId = auth.email;
        data.status = "Pending"
        data.type = "Withdrawal"
        const withdraw = Transaction.create(data);
        const message = 'Submitted, copy the wallet address'; // Set the success message
        const transactions = await Transaction.find({ userId: auth.email }).sort({ createdAt: -1 });
        res.render('history.ejs', { transactions });
    } catch (err) {
        console.log(err);
    }

});
app.get('/withdraw', requireLogin, async (req: Request, res: Response) => {
    const authCookie = req.cookies.auth;

    if (!authCookie) {
        return res.redirect('/login'); // Redirect to the login page if the user data cookie is not found
    }

    const auth = JSON.parse(authCookie); // Parse the user data from the cookie

    res.render('withdraw.ejs', { user: auth });
});
app.get('/deposit', requireLogin, async (req: Request, res: Response) => {
    const authCookie = req.cookies.auth;

    if (!authCookie) {
        return res.redirect('/login'); // Redirect to the login page if the user data cookie is not found
    }

    const auth = JSON.parse(authCookie); // Parse the user data from the cookie

    res.render('deposit.ejs', { user: auth });
});
app.get('/wallet-address', requireLogin, async (req: Request, res: Response) => {
    const authCookie = req.cookies.auth;

    if (!authCookie) {
        return res.redirect('/login'); // Redirect to the login page if the user data cookie is not found
    }

    const auth = JSON.parse(authCookie); // Parse the user data from the cookie
    const coin = req.query.coin || 'btc'; // Get the coin value from query parameter (default: btc)
    console.log(coin)
    res.render('wallet-address.ejs', { user: auth, coin: coin });

});
app.get('/history', requireLogin, async (req: Request, res: Response) => {
    const authCookie = req.cookies.auth;

        if (!authCookie) {
            return res.redirect('/login'); // Redirect to the login page if the user data cookie is not found
        }

        const auth = JSON.parse(authCookie); // Parse the user data from the cookie

        // Retrieve the transaction history for the user from the database
        const transactions = await Transaction.find({ userId: auth.email }).sort({ createdAt: -1 });

        res.render('history.ejs', { user: auth, transactions });

});
app.get('/login', (req: Request, res: Response) => {
    res.render("login.ejs", { error })
});
app.get('/signup', (req: Request, res: Response) => {
    res.render("signup.ejs", { error })
});
app.post('/signup', async (req: Request, res: Response) => {
    const reqemail = req.body.email
    const reqpassword = req.body.password
    const requsername = req.body.username
    const reqconfirmPassword = req.body.confirmPassword;
    const tc = req.body.tc
    try {
      const user = await User.findOne({ email: reqemail });
  
      if (user) {
        const error = "UserAlreadyExists"
        return res.render('signup', { error});
      }
      if (reqpassword !== reqconfirmPassword) {
        const error = "PasswordsDoNotMatch";
        return res.render('signup', { error });
      }
      if (!tc) {
        const error = "noTC";
        return res.render('signup', { error });
      }
      const hashedPassword = await bcrypt.hash(reqpassword, 10);
      const userData: Partial<IUser> = {
        username: requsername,
        email: reqemail,
        password: hashedPassword,
      };
      const users = await User.create(userData);
  
      // Send welcome email
      // await this.sendWelcomeEmail(payload.email);
  
      // Redirect to a success page
      res.redirect('/login'); // Change "/success" to the desired success page URL
    } catch (err) {
      console.log(err);
      const error = "ServerError"
      // Redirect to an error page
      res.redirect('/signup'); // Change "/error" to the desired error page URL
    }
  });
  app.post('/login', async (req: Request, res: Response) => {
    const reqemail = req.body.email
    const reqpassword = req.body.password
    const user = await User.findOne({ email: reqemail })
    
    if (!user) {
        const error = "noUser"
        return res.render('login', { error});
    }

    const validPassword = await bcrypt.compare(reqpassword, user.password);
    if (!validPassword) {
        const error = "invalid"
        return res.render('login', { error});
    }
    const authCookie = req.cookies.auth;

    if (!authCookie) {
        return res.redirect('/login'); // Redirect to the login page if the user data cookie is not found
    }

    const auth = JSON.parse(authCookie);
    res.render('dashboard.ejs', { user: auth });
});
app.get('/logout', (req: Request, res: Response) => {
    // Clear the session or authentication cookies
    res.clearCookie('auth');

    // Redirect to the login page or any other desired page
    res.redirect('/login');
});
export default app;