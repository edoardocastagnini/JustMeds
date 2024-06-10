<div align="center">
  <a href="https://github.com/carlozamu/Fall_Detection_MSP432_and_ESP8266](https://github.com/edoardocastagnini/JustMeds">
    <img src="frontend/images/Logo.png" alt="Logo" width="140" height="140">
  </a>

<h2 align="center">JustMeds</h2>

<p align="center">
    La farmacia comodamente a casa tua
    <br />
    <br /><br />
  </p>
</div>

### Project Layout
```

JustMeds/
├── backend/                  # BACKEND FILES
│   ├── .env
│   ├── index.js
│   ├── package-lock.json
│   ├── package.json
│   ├── index.test.js
│   ├── middlewares/          
│   │   └── tokenChecker.js
│   ├── models/               # DATABASE MODELS
│   │   ├── Drug.js
│   │   ├── Form.js
│   │   ├── Carrello.js
│   │   ├── Ordine.js
│   │   ├── User.js
│   │   ├── ListaFarmacie.js
│   │   └── UserFarmacia.js
│   ├── form_request/         
│   │   └── contattaci.js
│   ├── admin/                
│   │   └── admin.js
│   ├── auth/                 
│   │   ├── authGoogle.js
│   │   ├── authGoogleRoutes.js
│   │   └── login.js
│   ├── client_account/       
│   │   └── client.js
│   ├── delivery/             
│   │   ├── delivery.js
│   │   ├── delivery_management.js
│   │   ├── ongoing_delivery.js
│   │   └── rider_account.js
│   ├── farmacia/             
│   │   └── farmacia.js
│   ├── order/                
│   │   ├── checkout.js
│   │   └── order_cart.js
│   └── pagamento/            
│       └── pagamento.js

├── frontend/                 # FRONTEND FILES
│   ├── index.html
│   ├── index.js
│   ├── style.css
│   ├── about_us/             
│   │   ├── about.html
│   │   ├── about.js
│   │   └── about-style.css
│   ├── auth/                 
│   │   ├── SignupSuccess.html
│   │   ├── login.html
│   │   ├── login.js
│   │   ├── loginFail.html
│   │   ├── style.css
│   │   └── password_dimenticata.html
│   ├── delivery/             
│   │   ├── delivery.html
│   │   ├── delivery_management.html
│   │   ├── delivery.js
│   │   ├── delivery_management.js
│   │   ├── ongoing_delivery.html
│   │   ├── ongoing_delivery.js
│   │   ├── rider_account.html
│   │   └── rider_account.js
│   ├── form_request/         
│   │   ├── contattaci.html
│   │   └── contattaci.js
│   ├── images/               
│   │   ├── Logo.png
│   │   ├── delivery.png
│   │   └── profile.png
│   ├── order/                
│   │   ├── cart.html
│   │   ├── cart.js
│   │   ├── order.html
│   │   ├── order.js
│   │   ├── checkout.html
│   │   └── checkout.js
│   ├── admin/                
│   │   ├── admin.html
│   │   ├── admin.js
│   │   └── style.css
│   ├── client_account/       
│   │   ├── client.html
│   │   ├── client.js
│   │   └── style.css
│   ├── farmacia/             
│   │   ├── farmacia.html
│   │   ├── farmacia.js
│   │   └── style.css
│   └── pagamento/            
│       ├── pagamento.html
│       └── pagamento.js
```
