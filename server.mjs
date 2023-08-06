import express from 'express';
import cors from 'cors';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import Stripe from 'stripe';

dotenv.config(); // Load environment variables

const stripe = new Stripe(process.env.STRIPE_KEY);

const storeItems = new Map([
  [16502, { priceInCents: 500, name: "red"}],
  [16301, { priceInCents: 600, name: "orange"}],
  [12403, { priceInCents: 700, name: "yellow"}],
  [12602, { priceInCents: 800, name: "green"}],
  [12201, { priceInCents: 900, name: "blue"}],
  [11039, { priceInCents: 1000, name: "indigo"}],
  [12509, { priceInCents: 1100, name: "violet"}]
]);

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID, 
  };  

firebase.initializeApp(firebaseConfig);

// Retrieve the necessary variables from process.env
const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace \n with line breaks
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
  };
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
  });

// Create the Express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

app.use(cors());

app.use(express.static('public'));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/orders', async (req, res) => {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      res.json({ message: 'User not authenticated', name: "Not signed in", email: ""});
    } else {
      const userRecord = await admin.auth().getUser(user.uid);
      console.log(userRecord);
      if (userRecord && userRecord.customClaims && userRecord.customClaims.customerId) {
        const customerId = userRecord.customClaims.customerId; // Correctly retrieve the customerId
        console.log(customerId);
        const customer = await stripe.customers.retrieve(customerId);
        const orders = await stripe.orders.list({ customer: customerId });
        res.json({ orders: orders.data });
      } else {
        res.status(404).json({ message: 'No data found for the given key' });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while retrieving orders.' });
  }
});

app.post('/checkout', async (req, res) => {
  try{

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      automatic_tax: {
        enabled: true, // Enable automatic tax calculation
      },
      line_items: req.body.items.map((item) => {
        const itemId = parseInt(item.id); // Convert the 'id' to a number
        const storeItem = storeItems.get(itemId);
        if (!storeItem) {
          throw new Error(`Item with ID ${itemId} not found in storeItems.`);
        }
      
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        };
      }),      
      success_url: 'http://localhost:3000/',
      cancel_url: 'http://localhost:3000/',
    });
    res.json({url: session.url});
  }
  catch (e)
  {
    res.status(500).json({error: e.message});
  }
});


// Firebase Register POST request handler
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    const uid = user.uid;

    const customer = await stripe.customers.create({
      email: email,
    });

    const customerId = customer.id;

    await admin.auth().setCustomUserClaims(uid, {customerId: customerId});

    await userCredential.user.sendEmailVerification();

    res.json({ message: 'Registration successful', user: user });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Firebase Login POST request handler
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    user.getIdTokenResult().then((idTokenResult) => {
      const customerId = idTokenResult.claims.customerId;
      if(customerId)
      {
        res.json({ message: 'Login successful', user: user, customerId: customerId });
      }
      else
      {
        res.json({ message: 'Login successful', user: user });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Firebase Reset Password POST request handler
app.post('/reset', async (req, res) => {
    const { email } = req.body; // Accessing the 'email' property from the request body
  
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      res.json({ message: 'Password reset email sent successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error sending password reset email', error: error.message });
    }
  });

  // Firebase Set Data POST request handler
app.post('/set', async (req, res) => {
    const { value } = req.body; // Accessing the 'key' and 'value' properties from the request body
  
    try {
      await firebase.database().ref(firebase.auth().currentUser.uid).set(value);
      res.json({ message: 'Data set successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error setting data', error: error.message });
    }
  });

  // Add a new endpoint for handling GET request
  app.get('/get', async (req, res) => {
    const key = req.query.key; // Accessing the 'key' from the query parameters
  
    if (!key) {
      return res.status(400).json({ message: 'Missing key in query parameters' });
    }
  
    try {
      const snapshot = await firebase.database().ref(key).get();
      if (snapshot.exists()) {
        const data = snapshot.val();
        res.json({ data });
      } else {
        res.status(404).json({ message: 'No data found for the given key' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error getting data', error: error.message });
    }
  });


  // Firebase Logout POST request handler
app.post('/logout', async (req, res) => {
  try {
    await firebase.auth().signOut();
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error during logout', error: error.message });
  }
});

app.post('/showTabs', async (req, res) => {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      res.json({ message: 'User not authenticated', name: "Not signed in", email: ""});
    }
    else
    {
      const userRecord = await admin.auth().getUser(user.uid);
      res.json({ message: 'User authenticated', name: user.displayName, email: user.email, user: user, userRecord: userRecord});
    }
  } catch (error) {
    res.status(500).json({ message: 'Error during logout', error: error.message });
  }
});

  // Firebase Logout POST request handler
  app.post('/is-signed-in', async (req, res) => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        res.json({ message: 'User not authenticated' });
      }
      else
      {
        res.json({ message: 'User authenticated' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error during logout', error: error.message });
    }
  });


app.post('/delete-account', async (req, res) => {
    try {
      const user = firebase.auth().currentUser;
  
      if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
  
      // Delete the user account
      await user.delete();
  
      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting account', error: error.message });
    }
  });