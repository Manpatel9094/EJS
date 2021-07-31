const express = require("express");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const flush = require("connect-flash");

const https = require("https");
const qs = require("querystring");
const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });

const User = require("./models/User");
const City = require("./models/City");
const MembershipUser = require("./models/MembershipUser");
const Booking = require("./models/Booking");
const Venue = require("./models/Venue");
const Wishlist = require("./models/Wishlist");
const Feedback= require("./models/Feedback");


const checksum = require("./Paytm/checksum");
const config = require("./Paytm/config");

const authenticateUser = require("./middlewares/authenticateUser");
const { request, response } = require("express");
const { futimes } = require("fs");

var city = City.find({});
var user = User.find({});
var owner = MembershipUser.find({});
var venue = Venue.find({});
var wishlist = Wishlist.find({});
var bookings = Booking.find({});
var feedback=Feedback.find({});

const app = express();

// mongdb cloud connection is here
mongoose
  .connect("mongodb://localhost/venue", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("connected to mongodb cloud! :)");
  })
  .catch((err) => {
    console.log(err);
  });

// middlewares
app.use(express.urlencoded({ extened: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(flush());

// cookie session
app.use(
  cookieSession({
    keys: ["randomStringASyoulikehjudfsajk"],
  })
);

// route for serving frontend files
app
  .get("/payment_form", authenticateUser, (req, res) => {
    res.render("payment_form", { user: req.session.user });
  })
  .get("/", (req, res) => {
    res.render("home", { message: req.flash('message') });
  })
  .get("/login", (req, res) => {
    res.render("login", { message: req.flash('message') });
  })
  .get("/register", (req, res) => {
    city.exec(function (err, data) {
      if (err) throw err;
      res.render("register", { records: data, message: req.flash('message') });
    });
  })
  .get("/wishlist", authenticateUser, (req, res) => {
    wishlist.exec(function (err, data) {
      if (err) throw err;
      res.render("wishlist", { title: 'Wishlist Records', records: data , user: req.session.user});
    });
  })
  .get("/Book/:v_name", authenticateUser, (req, res) => {
    venue.exec(function (err, data) {
      if (err) throw err;
      res.render("Booking_page", { user: req.session.user, title: 'Venue Records', records: data , venue_names: [{demo: req.params.v_name},{demo: ''}]});
    });
  })

  .get("/profile_owner", authenticateUser, (req, res) => {
    res.render("Owner/profile_owner", { user: req.session.user });
  })
  
  .get("/single_venue_display/:v_name", authenticateUser, (req, res) => {
    //res.send('What is up ' + req.v_name + '!');
    //res.send(req.params.v_name);
    venue.exec(function (err, data) {
      if (err) throw err;
      res.render("single_venue_display", { title: 'Venue Records', records: data ,user: req.session.user , venue_names: [{demo: req.params.v_name},{demo: ''}]});
    });
    //res.render("single_venue_display", { user: req.session.user });
  })
  
  .get("/index", authenticateUser, (req, res) => {
    res.render("index", { user: req.session.user });
  })
  .get("/profile", authenticateUser, (req, res) => {
    res.render("profile", { user: req.session.user });
  })
  

  .get("/admin_dashboard", authenticateUser, (req, res) => {
    let user_count = 0,
        city_count = 0,
        venue_count = 0,
        owner_count = 0,
        booking_count = 0;
    User.countDocuments( {}, function(err, count){
      if (!err) {
        user_count = count;
        
        city.countDocuments( {}, function(err, count){
          if (!err) {
            city_count = count;
    
            owner.countDocuments( {}, function(err, count){
              if (!err) {
                owner_count = count;
        
                venue.countDocuments( {}, function(err, count){
                  if (!err) {
                    venue_count = count;
            
                  bookings.countDocuments( {}, function(err, count){
                      if (!err) {
                        booking_count = count;
                
                        res.render("Admin/admin_dashboard", { user: req.session.user,
                                                              user_count: user_count,
                                                              city_count: city_count,
                                                              owner_count: owner_count,
                                                              booking_count: booking_count,
                                                              venue_count: venue_count });
                        
                      } else {
                       // console.error('Error Fetching Categories Count:\t' + err);
                    }
                    })                    
                  } else {
                   // console.error('Error Fetching Categories Count:\t' + err);
                }
                })                
              } else {
               // console.error('Error Fetching Categories Count:\t' + err);
            }
            })            
          } else {
           // console.error('Error Fetching Categories Count:\t' + err);
        }
        })
      } else {
       // console.error('Error Fetching Categories Count:\t' + err);
    }
    })

  })
  .get("/owner_dashboard", authenticateUser, (req, res) => {
    let o_venue_count = 0,
    o_booking_count=0,
    pending_count=0,
    accept_count=0;
    venue.countDocuments( {owner_email : req.session.user.email}, function(err, count){
      if (!err) {
        o_venue_count = count;

      bookings.countDocuments( {email : req.session.user.email}, function(err, count){
          if (!err) {
            o_booking_count = count;
    
            venue.countDocuments( {owner_email : req.session.user.email,Request : "Pending"}, function(err, count){
              if (!err) {
                pending_count = count;
        
                venue.countDocuments( {owner_email : req.session.user.email,Request : "Accepted"}, function(err, count){
                  if (!err) {
                    accept_count = count;
            
                    res.render("Owner/owner_dashboard", { user: req.session.user,
                                                          o_booking_count: o_booking_count,
                                                          o_venue_count: o_venue_count,
                                                          pending_count: pending_count,
                                                          accept_count: accept_count, });
                    
                  } else {
                   // console.error('Error Fetching Categories Count:\t' + err);
                }
                })
                
              } else {
               // console.error('Error Fetching Categories Count:\t' + err);
            }
            })
            
          } else {
           // console.error('Error Fetching Categories Count:\t' + err);
        }
        })                    
      } else {
       // console.error('Error Fetching Categories Count:\t' + err);
    }
    })  })
  .get("/add_city", authenticateUser, (req, res) => {
    res.render("Admin/add_city", { user: req.session.user });
  })
  .get("/add_venue", authenticateUser, (req, res) => {
    city.exec(function (err, data) {
      if (err) throw err;
    res.render("Owner/add_venue", { records: data,user: req.session.user });
    })
  })

  .get("/Feedback/:name", authenticateUser, (req, res) => {
    bookings.exec(function (err, data) {
      if (err) throw err;
    res.render("Feedback", { records: data,user: req.session.user,venue_names: [{demo: req.params.name},{demo: ''}] });
    })
  })
  .get("/view_city", authenticateUser, (req, res) => {
    city.exec(function (err, data) {
      if (err) throw err;
      res.render("Admin/view_city", { title: 'City Records', records: data });
    });
  })
  .get("/view_owner", authenticateUser, (req, res) => {
    owner.exec(function (err, data) {
      if (err) throw err;
      res.render("Admin/view_owner", { title: 'Owner Records', records: data });
    });
  })
  .get("/view_Booking", authenticateUser, (req, res) => {
    bookings.exec(function (err, data) {
      if (err) throw err;
      res.render("Admin/view_Booking", { title: 'Booking Records', records: data });
    });
  })
  .get("/bookings", authenticateUser, (req, res) => {
    bookings.exec(function (err, data) {
      if (err) throw err;
      res.render("Owner/bookings", { title: 'Booking Records', records: data,user: req.session.user });
    });
  })

  .get("/My_Booking", authenticateUser, (req, res) => {
    bookings.exec(function (err, data) {
      if (err) throw err;
      res.render("My_Booking", { title: 'Booking Records', records: data,user: req.session.user });
    });
  })

  .get("/view_venue", authenticateUser, (req, res) => {
    venue.exec(function (err, data) {
      if (err) throw err;
      res.render("Admin/view_venue", { title: 'Venue Records', records: data });
    });
  })

  .get("/ViewFeedBack", authenticateUser, (req, res) => {
    feedback.exec(function (err, data) {
      if (err) throw err;
      res.render("Admin/viewFeedBack", { title: 'Feedback Records', records: data });
    });
  })
  .get("/Request_venue", authenticateUser, (req, res) => {
    venue.exec(function (err, data) {
      if (err) throw err;
      res.render("Admin/Request_venue", { title: 'Venue Requests', records: data });
    });
  })
  

  .get("/venues", authenticateUser, (req, res) => {
    venue.exec(function (err, data) {
      if (err) throw err;
      res.render("Owner/venues", { title: 'Venues', records: data,user: req.session.user });
    });
  })
  
  .get("/view_more", authenticateUser, (req, res) => {
    venue.exec(function (err, data) {
      if (err) throw err;
      res.render("view_more", { title: 'Venue Records', records: data,user: req.session.user });
    });
  })
  .get("/view_user", authenticateUser, (req, res) => {
    user.exec(function (err, data) 
    {
      if (err) throw err;
      res.render("Admin/view_user", { title: 'Users Records', records: data,user: req.session.user });
    });
  })
  .get("/pdf_user", authenticateUser, (req, res) => {
    user.exec(function (err, data) 
    {
      if (err) throw err;
      res.render("Admin/pdf_user", { title: 'Users Records', records: data,user: req.session.user });
    });
  })

  .get("/View_Feedback", authenticateUser, (req, res) => {
    feedback.exec(function (err, data) {
      if (err) throw err;
      res.render("Owner/View_Feedback", { title: 'Feedback Records', records: data,user: req.session.user });
    });
  })

  .get("/delete/:email", function (req, res)
  {
    mongoose.model("User").findOneAndDelete({ email: req.params.email},function (err, data) 
    {
      user.exec(function (err, data) 
      {
        if (err) throw err;
        res.render("Admin/view_user", { title: 'Users Records', records: data });
      });  
    });
  })

  .get("/Remove/:BookingDate", function (req, res)
  {
    mongoose.model("Booking").findOneAndDelete({ BookingDate: req.params.BookingDate},function (err, data) 
    {
      bookings.exec(function (err, data) 
      {
        if (err) throw err;
        res.render("My_Booking", { title: 'Booking Records', records: data,user: req.session.user });
      });  
    });
  })

  .get("/Removewishlist/:v_name", function (req, res)
  {
    mongoose.model("Wishlist").findOneAndDelete({ v_name: req.params.v_name},function (err, data) 
    {
      wishlist.exec(function (err, data) 
      {
        if (err) throw err;
        res.render("wishlist", { title: 'Wishlist Records ', records: data,user: req.session.user });
      });  
    });
  })

  .get("/Removecity/:city_name", function (req, res)
  {
    mongoose.model("City").findOneAndDelete({ city_name: req.params.city_name},function (err, data) 
    {
      city.exec(function (err, data) 
      {
        if (err) throw err;
        res.render("Admin/view_city", { title: 'City Records ', records: data,user: req.session.user });
      });  
    });
  })

.get("/edit/:v_name", function (req, res){
  venue.updateOne({ v_name: req.params.v_name }, { Request: "Accepted", status: "Active" }, function(
        err,
        result
      ){
        //res.render("Admin/view_venue");

      });
      //res.send(req.params.v_name);
   
});



// .post("/DtoA/:city_name",function(req,res){
//   console.log("city name is : "+req.params.city_name);
// })

// payment
app.post("/paynow", [parseUrl, parseJson], (req, res) => {
  // Route for making payment

  const { name, phone, email, amount } = req.body;

  const status = 'Active';
  const latestMembershipUser = new MembershipUser({ name, phone, email, amount, status });

  latestMembershipUser
    .save()
    .then(() => {
      req.flash('message', "You can upload your venue");
      //res.redirect('/register');
      //res.send("registered account!");
      return;
    })
    .catch((err) => console.log(err));


  var paymentDetails = {
    amount: req.body.amount,
    customerId: req.body.name,
    customerEmail: req.body.email,
    customerPhone: req.body.phone
  }
  if (!paymentDetails.amount || !paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
    res.status(400).send('Payment failed')
  } else {
    var params = {};
    params['MID'] = config.PaytmConfig.mid;
    params['WEBSITE'] = config.PaytmConfig.website;
    params['CHANNEL_ID'] = 'WEB';
    params['INDUSTRY_TYPE_ID'] = 'Retail';
    params['ORDER_ID'] = 'TEST_' + new Date().getTime();
    params['CUST_ID'] = "9714029100@paytm";
    params['TXN_AMOUNT'] = paymentDetails.amount;
    params['CALLBACK_URL'] = 'http://localhost:3000/callback';
    params['EMAIL'] = paymentDetails.customerEmail;
    params['MOBILE_NO'] = paymentDetails.customerPhone;

    checksum.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
      var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
      // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

      var form_fields = "";
      for (var x in params) {
        form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
      }
      form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
      res.end();

    });
  }
});
app.post("/paynow_booking", [parseUrl, parseJson], (req, res) => {
  // Route for making payment

  const { name,OwnerName, CustomerName, session, email, Peoples,BookingDate, amount } = req.body;

  const status = 'Active';
  const latestBooking = new Booking({ name,OwnerName, CustomerName, session, email, Peoples,BookingDate, amount, status });

  latestBooking
    .save()
    .then(() => {
      req.flash('message', "You can upload your venue");
      //res.redirect('/register');
      //res.send("registered account!");
      return;
    })
    .catch((err) => console.log(err));


  var paymentDetails = {
    amount: req.body.amount,
    customerId: req.body.name,
    customerEmail: req.body.email,
    customerPhone: req.body.session
  }
  if (!paymentDetails.amount || !paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
    res.status(400).send('Payment failed')
  } else {
    var params = {};
    params['MID'] = config.PaytmConfig.mid;
    params['WEBSITE'] = config.PaytmConfig.website;
    params['CHANNEL_ID'] = 'WEB';
    params['INDUSTRY_TYPE_ID'] = 'Retail';
    params['ORDER_ID'] = 'TEST_' + new Date().getTime();
    params['CUST_ID'] = "9714029100@paytm";
    params['TXN_AMOUNT'] = paymentDetails.amount;
    params['CALLBACK_URL'] = 'http://localhost:3000/callback';
    params['EMAIL'] = paymentDetails.customerEmail;
    params['MOBILE_NO'] = paymentDetails.customerPhone;

    checksum.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
      var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
      // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

      var form_fields = "";
      for (var x in params) {
        form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
      }
      form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
      res.end();

    });
  }
});

app.post("/callback", (req, res) => {
  // Route for verifiying payment

  var body = '';

  req.on('data', function (data) {
    body += data;
  });

  req.on('end', function () {
    var html = "";
    var post_data = qs.parse(body);

    // received params in callback
    console.log('Callback Response: ', post_data, "\n");


    // verify the checksum
    var checksumhash = post_data.CHECKSUMHASH;
    // delete post_data.CHECKSUMHASH;
    var result = checksum_lib.verifychecksum(post_data, config.PaytmConfig.key, checksumhash);
    console.log("Checksum Result => ", result, "\n");


    // Send Server-to-Server request to verify Order Status
    var params = { "MID": config.PaytmConfig.mid, "ORDERID": post_data.ORDERID };

    const checksum_lib = "/Paytm/checksum/checksum_lib";
    checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {

      params.CHECKSUMHASH = checksum;
      post_data = 'JsonData=' + JSON.stringify(params);

      var options = {
        hostname: 'securegw-stage.paytm.in', // for staging
        // hostname: 'securegw.paytm.in', // for production
        port: 443,
        path: '/merchant-status/getTxnStatus',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
        }

      };

      // Set up the request
      var response = "/index";
      var post_req = https.request(options, function (post_res) {
        post_res.on('data', function (chunk) {
          response += chunk;
        });

        post_res.on('end', function () {
          console.log('S2S Response: ', response, "\n");

          var _result = JSON.parse(response);
          if (_result.STATUS == 'TXN_SUCCESS') {
            res.send('payment sucess')
          } else {
            res.send('payment failed')
          }
        });
      });

      // post the data
      post_req.write(post_data);
      post_req.end();
    });
    res.redirect("/index");
  });
});

// route for handling post requirests
app
  .post("/login", async (req, res) => {
    const { email, password } = req.body;

    // check for missing filds
    if (!email || !password) {
      req.flash('message', "Please enter all the fields");
      res.redirect('/login');
      return;
    }

    const doesUserExits = await User.findOne({ email });
    const username = doesUserExits.username
    const phone = doesUserExits.phone
    const address = doesUserExits.address
    const city = doesUserExits.city
    const image = doesUserExits.image

    if (!doesUserExits) {
      req.flash('message', "Invalid Username");
      res.redirect('/login');
      //res.send("invalid username or password");
      return;
    }

    const doesPasswordMatch = await bcrypt.compare(
      password,
      doesUserExits.password
    );

    if (!doesPasswordMatch) {
      req.flash('message', "Invalid Password");
      res.redirect('/login');
      //res.send("invalid useranme or password");
      return;
    }

    const doesMembershipUserExits = await MembershipUser.findOne({ email });
    if (doesMembershipUserExits != null) {
      req.session.user = {
        username, email, phone, address, city, image
      };
      res.redirect("/owner_dashboard");
    }
    else {

      if (email == "Admin@gmail.com" && password == "Admin1234") {
        req.session.user = {
          username,
        };
        res.redirect("/admin_dashboard");
      }
      else {

        req.session.user = {
          username, email, phone, address, city,image
        };

        res.redirect("/index");


      }

    }

  })
  .post("/add_city", async (req, res) => {
    const { city_name, status } = req.body;

    // check for missing filds
    if (!city_name || !status) {
      req.flash('message', "Please enter all the fields");
      res.redirect('/add_city');
      //res.send("Please enter all the fields");
      return;
    }

    const doesCityExitsAlreay = await City.findOne({ city_name });

    if (doesCityExitsAlreay) {
      req.flash('message', "this city is already exits please try another one!");
      res.redirect('/add_city');

      return;
    }

    // lets hash the password
    const latestCity = new City({ city_name, status });

    latestCity
      .save()
      .then(() => {
        req.flash('message', "City Added Successful");
        res.redirect('/view_city');
        //res.send("registered account!");
        return;
      })
      .catch((err) => console.log(err));
  })

  .post("/Feedback", async (req, res) => {
    const { vname,username,email,Desc,owner_email } = req.body;

    const feedback = new Feedback({username,email,vname, Desc,owner_email });

    feedback
      .save()
      .then(() => {
        req.flash('message', "FeedBack Added Successfull");
        res.redirect('/My_Booking');
        //res.send("registered account!");
        return;
      })
      .catch((err) => console.log(err));
  })
  .post("/add_venue", async (req, res) => {
    const { v_name, v_address, v_city, v_phone, v_description,v_capacity,v_discount,v_deposite,morn_rent,eve_rent,full_rent,add_service,event,image1,image2,image3,image4,owner_email} = req.body;

    // check for missing filds
    if (!v_name || !v_address || !v_city || !v_phone || !v_description || !v_capacity || !v_discount || !v_deposite || !morn_rent || !eve_rent || !full_rent || !add_service || !event || !image1 || !image2 || !image3 || !image4) {
      req.flash('message', "Please enter all the fields");
      res.redirect('/add_venue');
      return;
    }

    const status = 'Deactive';    
    const Request = 'Pending';    
    

    const latestVenue = new Venue({ v_name, v_address, v_city, v_phone, v_description,v_capacity,v_discount,v_deposite,morn_rent,eve_rent,full_rent,add_service,event,image1,image2,image3,image4, status,owner_email,Request });

    latestVenue
      .save()
      .then(() => {
        res.redirect('/venues');
        return;
      })
      .catch((err) => console.log(err));
  })
  .get("/wishlist/:v_name", async (req, res) => {
  
    user = req.session.user
    email = user.email
    username = user.username
    v_name = req.params.v_name
    const wishlist = new Wishlist({username ,email, v_name });

    wishlist
      .save()
      .then(() => {
        req.flash('message', "Add to wishlist Successful");
        res.redirect('/wishlist');
        //res.send("registered account!");
        return;
      })
      .catch((err) => console.log(err));
  })
  

  .post("/register", async (req, res) => {
    const { username, address, city, phone, email, password,c_password,image } = req.body;

    // check for missing filds
    if (!email || !password || !username || !address || !city || !phone || !image) {
      req.flash('message', "Please enter all the fields");
      res.redirect('/register');
      //res.send("Please enter all the fields");
      return;
    }

    if(password!=c_password){
      req.flash('message', "Check Password! (Password & Confirm Password both are differnt)");
      res.redirect('/register');

      return;
    }
    const doesUserExitsAlreay = await User.findOne({ email });

    if (doesUserExitsAlreay) {
      req.flash('message', "A user with that email already exits please try another one!");
      res.redirect('/register');

      return;
    }

    const status = 'Active';
    // lets hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const latestUser = new User({ username, address, city, phone, email, password: hashedPassword, status,image });

    latestUser
      .save()
      .then(() => {
        req.flash('message', "Registration Successful");
        res.redirect('/register');
        //res.send("registered account!");
        return;
      })
      .catch((err) => console.log(err));
  });



//logout
app.get("/logout", authenticateUser, (req, res) => {
  req.session.user = null;
  res.redirect("/login");
});

// server config
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started listening on port: ${PORT}`);
});
