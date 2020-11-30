
import Config from "./config";
import {StorageOption} from "./config";
import * as aws from "aws-sdk";
import {S3, Endpoint} from "aws-sdk";
import * as Upload from "s3-uploader";
import {Promise} from "thenfail";
import * as zlib from "zlib";
var fs = require('fs');

export class Uploader {
    // private avatar: Upload;
    //  private thumbnail: Upload;
    //  private banner: Upload;
    private s3Client: S3;
    private bucketName: string;
    private bucketPath:string;

    constructor(opts: StorageOption) {
        // Default setting;
        opts = opts || {};
        opts.opts = opts.opts || {};
        opts.opts.rules = opts.opts.rules || {avatar: {}, banner: {}, thumbnail: {}};
        opts.awsBucketName = opts.awsBucketName ? opts.awsBucketName : "demo";
        opts.opts.aws = opts.opts.aws || {};

        let avatarOpts = {
            aws: opts.opts.aws ? opts.opts.aws : {},
            versions: opts.opts.rules.avatar.versions ? opts.opts.rules.avatar.versions : [],
            original: opts.opts.rules.avatar.original ? opts.opts.rules.avatar.original : {},
        };
        this.avatar = new Upload(opts.awsBucketName, avatarOpts);

        let bannerOpts = {
            aws: opts.opts.aws ? opts.opts.aws : {},
            versions: opts.opts.rules.banner.versions ? opts.opts.rules.banner.versions : [],
            original: opts.opts.rules.banner.original ? opts.opts.rules.banner.original : {},
        };
        this.banner = new Upload(opts.awsBucketName, bannerOpts);

        let thumbnailOpts = {
            aws: opts.opts.aws ? opts.opts.aws : {},
            versions: opts.opts.rules.thumbnail.versions ? opts.opts.rules.thumbnail.versions : [],
            original: opts.opts.rules.thumbnail.original ? opts.opts.rules.thumbnail.original : {},
        };
        this.thumbnail = new Upload(opts.awsBucketName, thumbnailOpts);

        aws.config.region = opts.opts.aws.region ? opts.opts.aws.region : "us-east-1";
        aws.config.update({
            accessKeyId: opts.opts.aws.accessKeyId ? opts.opts.aws.accessKeyId : "",
            signatureVersion: 'v4',
            secretAccessKey: opts.opts.aws.secretAccessKey ? opts.opts.aws.secretAccessKey : "",
        });
        if(opts.accelerateConfiguration && opts.accelerateConfiguration.enable) {
            this.s3Client = new aws.S3({
                params: {
                    Bucket: opts.awsBucketName,
                    ACL: opts.opts.aws.acl ? opts.opts.aws.acl : "public-read",
                },
                endpoint: new Endpoint(opts.accelerateConfiguration.endpoint),
            });
        } else {
            this.s3Client = new aws.S3({
                params: {
                    Bucket: opts.awsBucketName,
                    ACL: opts.opts.aws.acl ? opts.opts.aws.acl : "public-read"
                },
            });
        }
        this.bucketName = opts.awsBucketName;
        this.bucketPath = opts.awsBucketPath;
    }

    public getSignedUrl(id: string): string {
        let params = {
            Bucket: this.bucketName,
            Key: `videos/${id}.mp4`,
            Expires: 3600,
        };
        return this.s3Client.getSignedUrl('getObject', params);
    }

    public getVideoStream(id: string): Promise<any> {
        let params = {
            Bucket: this.bucketName,
            Key: `videos/${id}.mp4`,
        };
        //noinspection TypeScriptValidateTypes
        return new Promise((resolve, reject)=> {
            this.s3Client.headObject(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    //noinspection TypeScriptValidateTypes
                    resolve({
                        headers: data,
                        contentLength: data.ContentLength,
                        lastModified: data.LastModified,
                        eTah: data.ETag,
                        stream: this.s3Client.getObject(params).createReadStream()
                    });
                }
            })
        });
        //return this.s3Client.getObject(params).createReadStream();
    }

    public uploadVideo(path: string, name: string): Promise<any> {
        let body = fs.createReadStream(path); //.pipe(zlib.createGzip());
        let params = {
            ACL: "private",
            Bucket: this.bucketName,
            Key: `videos/${name}`,
            Body: body
        };
        return new Promise((resolve, reject) => {
            return this.s3Client.upload(params)
                .send(function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
        });
    }

    public uploadFile(path: string, name: string): Promise<any> {
        let body = fs.createReadStream(path);//.pipe(zlib.createGzip());
        let params = {
            ACL: "private",
            Bucket: this.bucketName,
            Key: `images/${name}`,
            Body: body,
        };
        return new Promise((resolve, reject) => {
            return this.s3Client.upload(params)
                .send(function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
        });
    }

    public uploadDocument(path: string, name: string): Promise<any> {
        let body = fs.createReadStream(path);//.pipe(zlib.createGzip());
        let params = {
            ACL: "private",
            Bucket: this.bucketName,
            Key: `ebook/${name}`,
            Body: body,
        };
        return new Promise((resolve, reject) => {
            return this.s3Client.upload(params)
                .send(function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
        });
    }

    public uploadImage(path: string, client: Upload): Promise<any> {
		//console.log("uploadImage pe aa gaya");
        if (path == null || path === "" || client == null) {
            return Promise.reject(new Error("Invalid parameter"));
        }
        return new Promise((resolve, reject) => {
            client.upload(path, {}, (err: string, images: image[], meta: Meta) => {
				//console.log(images);
				//console.log("if faad k aaya");
                if (err != null) {
					//console.log("1111");
                    reject(new Error(err));
                } else {
					//console.log("2222");
                    let image = images[0];
                    images.forEach(item => {
                        if (item.original) {
                            image = item;
                        }
                    });
                    //console.log("image.url = "+image.url);
                    resolve(image.url);
                }
            });
        });
    }

    public uploadExamPdf(path: string, name: string): Promise<any> {
        let body = fs.createReadStream(path);//.pipe(zlib.createGzip());
        let params = {
            ACL: "private",
            Bucket: this.bucketName,
            Key: `exams-papers/${name}`,
            Body: body,
        };
        return new Promise((resolve, reject) => {
            return this.s3Client.upload(params)
                .send(function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
        });
    }

    public getS3Object(name: string) {

        let params = {
            Bucket: this.bucketName,
            Key: `${name}`,
        };
        return this.s3Client.getObject(params)
    }

    public uploadCSV(path: string,name:string): Promise<any> {
        let fileData =  this.uploadFile(path, name);
        return fileData;
    }

    public uploadBanner(path: string): Promise<any> {
        return this.uploadImage(path, this.banner);
    }

    public uploadThumbnail(path: string): Promise<any> {
		//console.log('Yaha aaisiii');
        return this.uploadImage(path, this.thumbnail);
    }

    public uploadAvatar(path: string): Promise<any> {
        return this.uploadImage(path, this.avatar);
    }

    public getDocument(path: string) {
        return this.bucketPath  + path;
    }
}

export default new Uploader(Config.storage);
