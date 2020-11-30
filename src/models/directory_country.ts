/**
 *        on 5/20/18.
 */
import {DirectoryCountryTableSchema} from "../data/schemas";
import BaseModel from "./base";
import {Request} from "express";

export class DirectoryCountryModel extends BaseModel {
    public countryId:string;
    public Iso2Code:string;
    public Iso3Code:string;
    public countryName:string;

    public static fromRequest(req:Request):DirectoryCountryModel {
        if (req != null && req.body) {
            let country = new DirectoryCountryModel();
            country.countryId = DirectoryCountryModel.getString(req.body.countryId);
            country.Iso2Code = DirectoryCountryModel.getString(req.body.Iso2Code);
            country.Iso3Code = DirectoryCountryModel.getString(req.body.Iso3Code);
            country.countryName = DirectoryCountryModel.getString(req.body.countryName);
            return country;
        }
        return null;
    }

    public static fromDto(object:any, filters?:string[]):DirectoryCountryModel {
        if (object != null) {
            let countryId = object.get(DirectoryCountryTableSchema.FIELDS.COUNTRY_ID);
            let Iso2Code = object.get(DirectoryCountryTableSchema.FIELDS.ISO2_CODE);                
            let Iso3Code = object.get(DirectoryCountryTableSchema.FIELDS.ISO3_CODE);
            let countryName = object.get(DirectoryCountryTableSchema.FIELDS.COUNTRY_NAME);
            let ret = new DirectoryCountryModel();
            ret.countryId = countryId != null && countryId !== "" ? countryId : undefined;
            ret.Iso2Code = Iso2Code != null && Iso2Code !== "" ? Iso2Code : undefined;
            ret.Iso3Code = Iso3Code != null && Iso3Code !== "" ? Iso3Code : undefined;
            ret.countryName = countryName != null && countryName !== "" ? countryName : undefined;
            //noinspection TypeScriptUnresolvedVariable
            if (object.relations != null) {
                //noinspection TypeScriptUnresolvedVariable
                
            }
            if (filters != null) {
                filters.forEach(filter => {
                    ret[filter] = undefined;
                });
            }
            return ret;
        }
        return null;
    }

    public toDto():any {
        let obj = {};
        obj[DirectoryCountryTableSchema.FIELDS.COUNTRY_ID] = this.countryId;
        obj[DirectoryCountryTableSchema.FIELDS.ISO2_CODE] = this.Iso2Code;
        obj[DirectoryCountryTableSchema.FIELDS.ISO3_CODE] = this.Iso3Code;
        obj[DirectoryCountryTableSchema.FIELDS.COUNTRY_NAME] = this.countryName;
        return obj;
    }
}

export default DirectoryCountryModel;
