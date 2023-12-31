const router = require('express').Router();
const userRoutes = require('./user_routes');
const contactRoutes = require('./contact_routes');
const pingRoute = require('./ping_route');
const profileRoute = require('./profile_route')

router.use('/users', userRoutes); // for loggin in an out
router.use('/contact', contactRoutes); // for loggin in an out
router.use('/ping', pingRoute);
router.use('/profile', profileRoute);

router.use((req,res) =>{
    res.send("❗❗ We missed the api ! ❗❗")
})

module.exports = router;
