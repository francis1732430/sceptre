/**
 *      on 7/20/16.
 */
import {authentication} from "../../middlewares/authentication";
import {LocationsHandler} from "./locations.handler";
import * as express from "express";
const router = express.Router();
    
router.route("/countries")
   .get(LocationsHandler.countries)

router.route("/states/:countryId")
   .get(LocationsHandler.states)

router.route("/cities/:stateId")
   .get(LocationsHandler.cities)

 
export default router;
