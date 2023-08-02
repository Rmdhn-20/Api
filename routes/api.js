//―――――――――――――――――――――――――――――――――――――――――― ┏  Modules ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

require('../settings')
const express = require('express')
const translate = require('translate-google')
const alip = require("../lib/listdl")
const textto = require('soundoftext-js')
const googleIt = require('google-it')
const { shortText } = require("limit-text-js")
const Canvas = require('canvas')
const TinyURL = require('tinyurl');
const emoji = require("emoji-api");
const isUrl = require("is-url")
const { ytMp4, ytMp3 } = require('../lib/y2mate')
const BitlyClient = require('bitly').BitlyClient
const canvasGif = require('canvas-gif')
const { convertStringToNumber } = require('convert-string-to-number'); 
const isImageURL = require('image-url-validator').default
const {fetchJson, getBuffer} = require('../lib/myfunc')
const Canvacord = require("canvacord");
const isNumber = require('is-number');
const User = require('../model/user');
const dataweb = require('../model/DataWeb');
const dylux = require('api-dylux')
const spotifyds = require('spotifyds-core')
const router = express.Router()


//―――――――――――――――――――――――――――――――――――――――――― ┏  Info  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\
//  >Creator Alip MY
//  >Recode by EKUZIKA OFC
//  >Jangan Jual Sc Dan Buang Tulisan ini
//  >Guna Dengan Bijak
//  >Kalau mahu reupload jangan lupa creadit Ya :)
//
//
//  >>>>>Menu<<<<<
// >Dowloader
// >Text Pro
// >Photooxy
// >Sound Of Text
// >Search
// >Random Gambar
// >Game
// >Maker
// >Link Short
// >Infomation
// >Tools
// >Islamic
//
//

//―――――――――――――――――――――――――――――――――――――――――― ┏  Function ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

async function cekKey(req, res, next) {
	var apikey = req.query.apikey
	if (!apikey ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter apikey"})  

    let db = await User.findOne({apikey: apikey});
    if(db === null) {
		return res.json({ status : false, creator : `${creator}`, message : "[!] Apikey Tidak Wujud"})  
		} else if(!db.isVerified) {
				return res.json({ status : false, creator : `${creator}`, message : "[!] Sila Verify Email dulu sebelum guna apikey"})  
			} else if(db.limitApikey === 0) {
				return res.json({ status : false, creator : `${creator}`, message : "[!] Apikey Sudah Habis"})  
			}else{
        return next();
    }
}

async function limitapikey(apikey) {
       await dataweb.updateOne({}, {$inc: {  RequestToday: 1 }})
       await User.findOneAndUpdate({apikey: apikey},{$inc: { limitApikey: -1}},{upsert: true,new: true})
}



//―――――――――――――――――――――――――――――――――――――――――― ┏  Dowloader  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\


router.get('/api/dowloader/fbdown', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})  
dylux.fbdl(url).then(data => {
	if (!data.videoUrl ) return res.json(loghandler.noturl)
	limitapikey(req.query.apikey)
	res.json({
	status: true,
	creator: `${creator}`,
	result:	data
	})
	})
	 .catch(e => {
		res.json(loghandler.error)
})
})

router.get('/api/dowloader/spotify', cekKey, async (req, res, next) => {
	var url = req.query.text
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})  
spotifyds.searchTrack(url).then(data => {
	//if (!data.videoUrl ) return res.json(loghandler.noturl)
	var spoti = data.items[0].item
	limitapikey(req.query.apikey)
	res.json({
	status: true,
	creator: `${creator}`,
	result:	spoti
	})
	})
	 .catch(e => {
		res.json(loghandler.error)
})
})

router.get('/api/dowloader/twitter', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})   
	
alip.twitter(url).then(data => {
if (!data.thumb ) res.json(loghandler.noturl)
limitapikey(req.query.apikey)
res.json({
status: true,
creator: `${creator}`,
result: data
})
})
.catch(e => {
res.json(loghandler.error)
})
})

router.get('/api/dowloader/tikok', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})  

    try {
	let tt = await fetchJson(`https://api.akuari.my.id/downloader/tiktok3?link=${url}`)
	let urr = tt.hasil.download_mp4 || tt.hasil.download_mp4_hd || tt.download_mp4_watermark
    if (!urr) return res.json(loghandler.noturl)
	limitapikey(req.query.apikey)
	res.json({
	    status: true,
	    creator: `${creator}`,
	    result: tt.hasil
	})
} catch(e) { 
	res.json(loghandler.noturl)
}
})

router.get('/api/dowloader/igdowloader', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})   
	if (!/^((https|http)?:\/\/(?:www\.)?instagram\.com\/(p|tv|reel)\/([^/?#&]+)).*/i.test(url)) return res.json(loghandler.noturl)
		try {
		let igg = await fetchJson(`https://api.caliph.biz.id/api/ig?url=${url}&apikey=caliphkey`)
		if (!igg.status == true ) return res.json(loghandler.instgram) 
		limitapikey(req.query.apikey)
		for (let med of igg.media) {
		res.json({
			status: true,
	        creator: `${creator}`,
			result: med
	    })
		}
	} catch(e) {
		res.json(loghandler.noturl)
		}
})


router.get('/api/dowloader/yt', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"}) 

	var mp3 = await ytMp3(url)
	var mp4 = await ytMp4(url)
	if (!mp4 || !mp3) return res.json(loghandler.noturl)
	limitapikey(req.query.apikey)
		res.json({
			status: true,
			creator: `${creator}`,
			result:{ 
			title: mp4.title,
			desc: mp4.desc,
			thum: mp4.thumb,
			view: mp4.views,
			channel: mp4.channel,
			uploadDate: mp4.uploadDate,
			mp4:{
				result: mp4.result,
				size: mp4.size,
				quality: mp4.quality
			},
			mp3:{
				result: mp3.result,
				size: mp3.size
			}
		 }
	   })
})

router.get('/api/dowloader/soundcloud', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})   
	
	alip.soundcloud(url).then(data => {
		if (!data.download ) return res.json(loghandler.noturl)
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
		})
	}).catch(e => {
			 res.json(loghandler.error)
    })
})

router.get('/api/dowloader/mediafire', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})   

	alip.mediafiredl(url).then(async (data) => {
		if (!data ) return res.json(loghandler.noturl)
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
	    })
	}).catch(e => {
		res.json(loghandler.noturl)
    })
})

router.get('/api/dowloader/sfilemobi', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})   

	alip.sfilemobi(url).then(async (data) => {
		if (!data ) return res.json(loghandler.noturl)
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
	    })
	}).catch(e => {
		res.json(loghandler.noturl)
    })
})

router.get('/api/dowloader/zippyshare', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})   

	alip.zippyshare(url).then(async (data) => {
		if (!data ) return res.json(loghandler.noturl)
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
	    })
	}).catch(e => {
		res.json(loghandler.noturl)
    })
})

router.get('/api/dowloader/telesticker', cekKey, async (req, res, next) => {
	var url = req.query.url
	if (!url ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})   
	if (!url.match(/(https:\/\/t.me\/addstickers\/)/gi)) return res.json(loghandler.noturl)
	
	alip.telesticker(url).then(data => {
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
		})
		})
         .catch(e => {
	 res.json(loghandler.error)
})
})

//―――――――――――――――――――――――――――――――――――――――――― ┏  Text Pro  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

router.get('/api/textpro/pencil', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.textpro("https://textpro.me/create-a-sketch-text-effect-online-1044.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/textpro/glitch', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.textpro("https://textpro.me/create-impressive-glitch-text-effects-online-1027.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/textpro/blackpink', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.textpro("https://textpro.me/create-blackpink-logo-style-online-1001.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/textpro/berry', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.textpro("https://textpro.me/create-berry-text-effect-online-free-1033.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/textpro/neon', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.textpro("https://textpro.me/neon-light-text-effect-online-882.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})



router.get('/api/textpro/logobear', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.textpro("https://textpro.me/online-black-and-white-bear-mascot-logo-creation-1012.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/textpro/3dchristmas', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.textpro("https://textpro.me/3d-christmas-text-effect-by-name-1055.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/textpro/thunder', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.textpro("https://textpro.me/online-thunder-text-effect-generator-1031.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/textpro/3dboxtext', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.textpro("https://textpro.me/3d-box-text-effect-online-880.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/textpro/glitch2', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	var text2 = req.query.text2
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	if (!text2 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text2"}) 
	alip.textpro("https://textpro.me/create-a-glitch-text-effect-online-free-1026.html", [text1,text2])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/glitchtiktok', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	var text2 = req.query.text2
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	if (!text2 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text2"}) 
	alip.textpro("https://textpro.me/create-glitch-text-effect-style-tik-tok-983.html", [text1,text2])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/video-game-classic', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	var text2 = req.query.text2
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	if (!text2 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text2"}) 
	alip.textpro("https://textpro.me/video-game-classic-8-bit-text-effect-1037.html", [text1,text2])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/marvel-studios', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	var text2 = req.query.text2
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	if (!text2 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text2"}) 
	alip.textpro("https://textpro.me/create-logo-style-marvel-studios-online-971.html", [text1,text2])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/ninja-logo', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	var text2 = req.query.text2
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	if (!text2 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text2"}) 
	alip.textpro("https://textpro.me/create-ninja-logo-online-935.html", [text1,text2])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/green-horror', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.textpro("https://textpro.me/create-green-horror-style-text-effect-online-1036.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/magma', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.textpro("https://textpro.me/create-a-magma-hot-text-effect-online-1030.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/3d-neon-light', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.textpro("https://textpro.me/create-3d-neon-light-text-effect-online-1028.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/3d-orange-juice', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.textpro("https://textpro.me/create-a-3d-orange-juice-text-effect-online-1084.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/chocolate-cake', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.textpro("https://textpro.me/chocolate-cake-text-effect-890.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/textpro/strawberry', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.textpro("https://textpro.me/strawberry-text-effect-online-889.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
})
.catch((err) =>{
 res.json(loghandler.error)
})
})

//―――――――――――――――――――――――――――――――――――――――――― ┏  Phootoxy  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\


router.get('/api/photooxy/flaming', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/realistic-flaming-text-effect-online-197.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/photooxy/shadow-sky', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/shadow-text-effect-in-the-sky-394.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/photooxy/metallic', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.photooxy("https://photooxy.com/other-design/create-metallic-text-glow-online-188.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/photooxy/naruto', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.photooxy("https://photooxy.com/manga-and-anime/make-naruto-banner-online-free-378.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/photooxy/pubg', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	var text2 = req.query.text2
	if (!text2 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text2"})  
	alip.photooxy("https://photooxy.com/battlegrounds/make-wallpaper-battlegrounds-logo-text-146.html", [text1,text2])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/photooxy/under-grass', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/make-quotes-under-grass-376.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/photooxy/harry-potter', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/create-harry-potter-text-on-horror-background-178.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/photooxy/flower-typography', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.photooxy("https://photooxy.com/art-effects/flower-typography-text-effect-164.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/photooxy/picture-of-love', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/create-a-picture-of-love-message-377.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/photooxy/coffee-cup', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/put-any-text-in-to-coffee-cup-371.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/photooxy/butterfly', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/butterfly-text-with-reflection-effect-183.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/photooxy/night-sky', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/write-stars-text-on-the-night-sky-200.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/photooxy/carved-wood', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/carved-wood-effect-online-171.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})


router.get('/api/photooxy/illuminated-metallic', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/illuminated-metallic-effect-177.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

router.get('/api/photooxy/sweet-candy', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.photooxy("https://photooxy.com/logo-and-text-effects/sweet-andy-text-online-168.html", [text1])
.then((data) =>{ 
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(data)
	})
.catch((err) =>{
 res.json(loghandler.error)
})
})

//―――――――――――――――――――――――――――――――――――――――――― ┏  Sound Of Text  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\



router.get('/api/soundoftext', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	var lan = req.query.lang
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	if (!lan ) return res.json({ status : false, creator : `${creator}`, message : "[!] sila letak format lang dengan betul cek web site https://soundoftext.com/docs untuk lihat code lang"})   

textto.sounds.create({ text: text1, voice: lan })
.then(soundUrl => {
	limitapikey(req.query.apikey)
	res.json({
		status: true,
		creator: `${creator}`,
		result: soundUrl
	})
}).catch(e => {
	res.json(loghandler.error)
})
})

//―――――――――――――――――――――――――――――――――――――――――― ┏  Search  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\



router.get('/api/search/linkgroupwa', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
alip.linkwa(text1).then((data) =>{ 
	if (!data[0] ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)
    res.json({
	status: true,
	creator: `${creator}`,
	result: data
    })
}).catch((err) =>{
       res.json(loghandler.notfound)
    })
})

router.get('/api/search/pinterest', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
alip.pinterest(text1).then((data) =>{ 
	if (!data[0] ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)
    res.json({
	status: true,
	creator: `${creator}`,
	result: data
    })
    }).catch((err) =>{
        res.json(loghandler.notfound)
     })
})


router.get('/api/search/ringtone', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.ringtone(text1).then((data) =>{ 
	if (!data ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)
    res.json({
	status: true,
	creator: `${creator}`,
	result: data
     })
    }).catch((err) =>{
     res.json(loghandler.notfound)
   })
})


router.get('/api/search/wikimedia', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
alip.wikimedia(text1).then((data) =>{ 
	if (!data[0] ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)
    res.json({
	status: true,
	creator: `${creator}`,
	result: data
    })
     }).catch((err) =>{
       res.json(loghandler.notfound)
     })
})


router.get('/api/search/wallpaper', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.wallpaper(text1).then((data) =>{ 
	if (!data[0] ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)
   res.json({
	status: true,
	creator: `${creator}`,
	result: data
   })
   }).catch((err) =>{
     res.json(loghandler.notfound)
   })
})

router.get('/api/search/google', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   

	googleIt({'query': text1}).then(results => {
		if (!results[0] ) return res.json(loghandler.notfound)
		limitapikey(req.query.apikey)
			res.json({
				status: true,
				creator: `${creator}`,
				result: results
			})
	}).catch(e => {	
		res.json(loghandler.notfound)
	})
})

router.get('/api/search/googleimage', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   

	var gis = require('g-i-s')
gis(text1, logResults)

function logResults(error, results) {
  if (error) {
	res.json(loghandler.notfound)
  }
  else {
	if (!results[0] ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)
	res.json({
		status: true,
		creator: `${creator}`,
		result:  results
	})
  }
}
})


router.get('/api/search/ytplay', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"}) 

let yts = require("yt-search")
let search = await yts(text1)
let url = search.all[Math.floor(Math.random() * search.all.length)]
var mp3 = await ytMp3(url.url)
var mp4 = await ytMp4(url.url)
if (!mp4 || !mp3) return res.json(loghandler.noturl)
limitapikey(req.query.apikey)
	res.json({
		status: true,
		creator: `${creator}`,
		result:{ 
		title: mp4.title,
		desc: mp4.desc,
		thum: mp4.thumb,
		view: mp4.views,
		channel: mp4.channel,
		ago: url.ago,
		timestamp: url.timestamp,
		uploadDate: mp4.uploadDate,
		author: url.author,
		mp4:{
			result: mp4.result,
			size: mp4.size,
			quality: mp4.quality
		},
		mp3:{
			result: mp3.result,
			size: mp3.size
		}
	}
	 })

})

router.get('/api/search/sticker', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.stickersearch(text1).then(data => {
		if (!data ) return res.json(loghandler.notfound)
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
		})
		}).catch(e => {
	 res.json(loghandler.error)
})
})

router.get('/api/search/sfilemobi', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})   
	alip.sfilemobiSearch(text1).then(data => {
		if (!data ) return res.json(loghandler.notfound)
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
		})
		}).catch(e => {
	 res.json(loghandler.error)
})
})

//―――――――――――――――――――――――――――――――――――――――――― ┏  Random Gambar ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

router.get('/api/randomgambar/cecan/china', cekKey, async (req, res, next) => {
	var cecann = ["https://i.postimg.cc/QdncScPQ/1.jpg", "https://i.postimg.cc/zv1CK5Q4/10.jpg", "https://i.postimg.cc/4x3zzW84/11.jpg", "https://i.postimg.cc/pXCfhwJ1/12.jpg", "https://i.postimg.cc/brHQRWcr/13.jpg", "https://i.postimg.cc/zX8wfzKg/14.jpg", "https://i.postimg.cc/QM91zHGR/15.jpg", "https://i.postimg.cc/43DVRsXn/16.jpg", "https://i.postimg.cc/nrkDmmBQ/17.jpg", "https://i.postimg.cc/CLhDgvpC/18.jpg", "https://i.postimg.cc/fT8dTxMG/19.jpg", "https://i.postimg.cc/RFwfMy0d/2.jpg", "https://i.postimg.cc/nrZmM2jJ/20.jpg", "https://i.postimg.cc/dVDy7L1L/21.jpg", "https://i.postimg.cc/kMF8z0zX/22.jpg", "https://i.postimg.cc/VkTbXmr4/23.jpg", "https://i.postimg.cc/3wv0BV2h/24.jpg", "https://i.postimg.cc/V6PrHgFC/25.jpg", "https://i.postimg.cc/MT0MkBsr/26.jpg", "https://i.postimg.cc/RhM3v0yC/27.jpg", "https://i.postimg.cc/D0BS0T3r/28.jpg", "https://i.postimg.cc/VsRrDj0J/29.jpg", "https://i.postimg.cc/TY3ySpnC/3.jpg", "https://i.postimg.cc/NfCywB4Y/30.jpg", "https://i.postimg.cc/3RZRfTRs/31.jpg", "https://i.postimg.cc/HnZLH9b3/4.jpg", "https://i.postimg.cc/rFsmj7LH/5.jpg", "https://i.postimg.cc/4N03Swfx/6.jpg", "https://i.postimg.cc/66YqdtFR/7.jpg", "https://i.postimg.cc/rwtpXWsC/8.jpg", "https://i.postimg.cc/wB8j6vsK/9.jpg"]
    	var rescecan = cecann[Math.floor(Math.random() * cecann.length)]
	var cecan = await getBuffer(rescecan)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/webp'})
	res.send(cecan)
})

router.get('/api/randomgambar/cecan/hijab', cekKey, async (req, res, next) => {
	var cecann = await fetchJson(`https://api.caliph.biz.id/api/hijab?apikey=caliphkey`)
	var rescecan = cecann.result
	var cecan = await getBuffer(rescecan)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/webp'})
	res.send(cecan)
})

router.get('/api/randomgambar/cecan/vietnam', cekKey, async (req, res, next) => {
	var cecann = ["https://i.postimg.cc/QdncScPQ/1.jpg", "https://i.postimg.cc/zv1CK5Q4/10.jpg", "https://i.postimg.cc/4x3zzW84/11.jpg", "https://i.postimg.cc/pXCfhwJ1/12.jpg", "https://i.postimg.cc/brHQRWcr/13.jpg", "https://i.postimg.cc/zX8wfzKg/14.jpg", "https://i.postimg.cc/QM91zHGR/15.jpg", "https://i.postimg.cc/43DVRsXn/16.jpg", "https://i.postimg.cc/nrkDmmBQ/17.jpg", "https://i.postimg.cc/CLhDgvpC/18.jpg", "https://i.postimg.cc/fT8dTxMG/19.jpg", "https://i.postimg.cc/RFwfMy0d/2.jpg", "https://i.postimg.cc/nrZmM2jJ/20.jpg", "https://i.postimg.cc/dVDy7L1L/21.jpg", "https://i.postimg.cc/kMF8z0zX/22.jpg", "https://i.postimg.cc/VkTbXmr4/23.jpg", "https://i.postimg.cc/3wv0BV2h/24.jpg", "https://i.postimg.cc/V6PrHgFC/25.jpg", "https://i.postimg.cc/MT0MkBsr/26.jpg", "https://i.postimg.cc/RhM3v0yC/27.jpg", "https://i.postimg.cc/D0BS0T3r/28.jpg", "https://i.postimg.cc/VsRrDj0J/29.jpg", "https://i.postimg.cc/TY3ySpnC/3.jpg", "https://i.postimg.cc/NfCywB4Y/30.jpg", "https://i.postimg.cc/3RZRfTRs/31.jpg", "https://i.postimg.cc/HnZLH9b3/4.jpg", "https://i.postimg.cc/rFsmj7LH/5.jpg", "https://i.postimg.cc/4N03Swfx/6.jpg", "https://i.postimg.cc/66YqdtFR/7.jpg", "https://i.postimg.cc/rwtpXWsC/8.jpg", "https://i.postimg.cc/wB8j6vsK/9.jpg"]
    	var rescecan = cecann[Math.floor(Math.random() * cecann.length)]
	var cecan = await getBuffer(rescecan)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/webp'})
	res.send(cecan)
})

router.get('/api/randomgambar/cecan/indonesia', cekKey, async (req, res, next) => {
	var cecann = ["https://i.postimg.cc/sgYy39Yy/1.jpg", "https://i.postimg.cc/k5wmbJYp/10.jpg", "https://i.postimg.cc/XJJ0KRT7/11.jpg", "https://i.postimg.cc/PfCCT9Pj/12.jpg", "https://i.postimg.cc/GpbRt8KD/13.jpg", "https://i.postimg.cc/gkRr6hVt/14.jpg", "https://i.postimg.cc/rsRX3SVB/15.jpg", "https://i.postimg.cc/52S0sMkw/16.jpg", "https://i.postimg.cc/tTY4RnR5/17.jpg", "https://i.postimg.cc/4d7XRCw2/18.jpg", "https://i.postimg.cc/k55nwRSm/19.jpg", "https://i.postimg.cc/QCcsVp2p/2.jpg", "https://i.postimg.cc/zGz5XH0g/20.jpg", "https://i.postimg.cc/y8LKJ6br/21.jpg", "https://i.postimg.cc/WbjcXJRH/22.jpg", "https://i.postimg.cc/m2wfq2B2/23.jpg", "https://i.postimg.cc/MGghRnbt/24.jpg", "https://i.postimg.cc/1t6bKyvS/25.jpg", "https://i.postimg.cc/fyNp21P9/26.jpg", "https://i.postimg.cc/J05g9Pwd/27.jpg", "https://i.postimg.cc/m2TKQfCx/28.jpg", "https://i.postimg.cc/MKtN5Pmn/29.jpg", "https://i.postimg.cc/PxGRJBTR/3.jpg", "https://i.postimg.cc/cHQ5nXJ4/30.jpg", "https://i.postimg.cc/bY9BYCMm/31.jpg", "https://i.postimg.cc/QdH4bXMz/32.jpg", "https://i.postimg.cc/Rhgd78x9/33.jpg", "https://i.postimg.cc/sD2wjV52/34.jpg", "https://i.postimg.cc/pXV1mQMR/35.jpg", "https://i.postimg.cc/sfmTCBQ8/36.jpg", "https://i.postimg.cc/ZRcxmgR3/37.jpg", "https://i.postimg.cc/mkgNgwzn/38.jpg", "https://i.postimg.cc/pXyJNsth/4.jpg", "https://i.postimg.cc/13q0X4Xy/5.jpg", "https://i.postimg.cc/DZBLHXjP/7.jpg", "https://i.postimg.cc/RhYfVzz3/8.jpg", "https://i.postimg.cc/TYZmzG9F/9.jpg"]
    	var rescecan = cecann[Math.floor(Math.random() * cecann.length)]
	var cecan = await getBuffer(rescecan)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/webp'})
	res.send(cecan)
})

router.get('/api/randomgambar/cecan/korea', cekKey, async (req, res, next) => {
	var cecann = ["https://i.postimg.cc/K87Z4CkB/p-19620motq1.jpg", "https://i.postimg.cc/wvgR7hjT/p-19623vybj1.jpg", "https://i.postimg.cc/QtJ5bfyT/p-19623z95r1.jpg", "https://i.postimg.cc/XJbddRQW/p-19624y1on1.jpg", "https://i.postimg.cc/dVG0rLX7/p-19625anrs1.jpg", "https://i.postimg.cc/9fWc91ZS/p-19625lzea1.jpg", "https://i.postimg.cc/SKWzSZqv/p-19626rftx1.jpg", "https://i.postimg.cc/hPjxLbbX/p-196298pkr1.jpg", "https://i.postimg.cc/hvGJ0cmk/p-1962alh5c1.jpg", "https://i.postimg.cc/ZqcKsXJ4/p-1962asjl31.jpg", "https://i.postimg.cc/pX6jqhqq/p-1962enqpe1.jpg", "https://i.postimg.cc/T1SPqmfb/p-1962gl6nf1.jpg", "https://i.postimg.cc/mZVC16Mx/p-1962koqm41.jpg", "https://i.postimg.cc/d3zqTYjm/p-1962pvq221.jpg", "https://i.postimg.cc/3xQ883R3/p-1962spcdo1.jpg", "https://i.postimg.cc/BbZFw2rw/p-1962u3qhb1.jpg", "https://i.postimg.cc/nVwMJ8BL/p-1962umwai1.jpg", "https://i.postimg.cc/76hDs6Bn/p-1962y8lij1.jpg", "https://i.postimg.cc/ydp6s9JG/p-1962yt9ph1.jpg"]
    	var rescecan = cecann[Math.floor(Math.random() * cecann.length)]
	var cecan = await getBuffer(rescecan)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/webp'})
	res.send(cecan)
})

router.get('/api/randomgambar/cecan/japan', cekKey, async (req, res, next) => {
	var cecann = ["https://i.postimg.cc/RCcjLvF6/p-196252lk91.jpg", "https://i.postimg.cc/7hMdHncM/p-19625eppj1.jpg", "https://i.postimg.cc/CLpwwvZD/p-19629cg431.jpg", "https://i.postimg.cc/pVwLpWSm/p-19629eev81.jpg", "https://i.postimg.cc/ydxwTRD7/p-1962cau3w1.jpg", "https://i.postimg.cc/D0LFqGN8/p-1962ck87p1.jpg", "https://i.postimg.cc/76zjcknR/p-1962fyik51.jpg", "https://i.postimg.cc/bYtzcXvp/p-1962i85aq1.jpg", "https://i.postimg.cc/nLWtgTbX/p-1962nvj4g1.jpg", "https://i.postimg.cc/rFGMsSWH/p-1962o5sp41.jpg", "https://i.postimg.cc/wTgnWnyW/p-1962p9nlk1.jpg", "https://i.postimg.cc/T1XBv4k3/p-1962q7ura1.jpg", "https://i.postimg.cc/nz6pj20y/p-1962qiubc1.jpg", "https://i.postimg.cc/13CxVMzv/p-1962tt38s1.jpg", "https://i.postimg.cc/ZYBqbBwk/p-1962ufc7p1.jpg", "https://i.postimg.cc/52x1C6S2/p-1962vn5rc1.jpg", "https://i.postimg.cc/GpHWFY8d/p-1962vpyp71.jpg", "https://i.postimg.cc/tTc8vg6W/p-1962w2hyp1.jpg"]
    	var rescecan = cecann[Math.floor(Math.random() * cecann.length)]
	var cecan = await getBuffer(rescecan)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/webp'})
	res.send(cecan)
})

router.get('/api/randomgambar/couplepp', cekKey, async (req, res, next) => {
	let resultt = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/kopel.json')
	let random = resultt[Math.floor(Math.random() * resultt.length)]
	limitapikey(req.query.apikey)
	res.json({
	status: true,
	creator: `${creator}`,
		result: {
			male: random.male,
			female: random.female
		}
	})

})


router.get('/api/randomgambar/dadu', cekKey, async (req, res, next) => {

	let dadu = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/dadu.json')
	let random = dadu[Math.floor(Math.random() * dadu.length)]
	var result = await getBuffer(random.result)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/webp'})
	res.send(result)
})


router.get('/api/randomgambar/coffee', cekKey, async (req, res, next) => {
	var result = await getBuffer('https://coffee.alexflipnote.dev/random')
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(result)
})

// Game

router.get('/api/game/tembakgambar', cekKey, async (req, res, next) => {
 alip.tebakgambar().then((data) =>{ 
	limitapikey(req.query.apikey)	  
  res.json({
	status: true,
	creator: `${creator}`,
	result: data
   })
   }).catch((err) =>{
    res.json(loghandler.error)
  })
})

router.get('/api/game/susunkata', cekKey, async (req, res, next) => {
	let ra = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/susunkata.json')
	let ha = ra[Math.floor(Math.random() * ra.length)]
	limitapikey(req.query.apikey)
  res.json({
	status: true,
	creator: `${creator}`,
	result: ha
})

})

router.get('/api/game/tembakbendera', cekKey, async (req, res, next) => {
	let ra = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/tebakbendera.json')
	let ha = ra[Math.floor(Math.random() * ra.length)]
	limitapikey(req.query.apikey)
  res.json({
	status: true,
	creator: `${creator}`,
	result: ha
})

})


router.get('/api/game/tembakgame', cekKey, async (req, res, next) => {
	let ra = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/tebakgame.json')
	let ha = ra[Math.floor(Math.random() * ra.length)]
	limitapikey(req.query.apikey)
  res.json({
	status: true,
	creator: `${creator}`,
	result: ha
})
})

router.get('/api/game/tembakkata', cekKey, async (req, res, next) => {
	let ra = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/tebakkata.json')
	let ha = ra[Math.floor(Math.random() * ra.length)]
	limitapikey(req.query.apikey)
  res.json({
	status: true,
	creator: `${creator}`,
	result: ha
   })
})

router.get('/api/game/tembaklirik', cekKey, async (req, res, next) => {
	let ra = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/tebaklirik.json')
	let ha = ra[Math.floor(Math.random() * ra.length)]
	limitapikey(req.query.apikey)
  res.json({
	status: true,
	creator: `${creator}`,
	result: ha
   })
})

router.get('/api/game/tembaklagu', cekKey, async (req, res, next) => {
	let ra = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/tebaklagu.json')
	let ha = ra[Math.floor(Math.random() * ra.length)]
	limitapikey(req.query.apikey)
  res.json({
	status: true,
	creator: `${creator}`,
	result: ha
  })
})
router.get('/api/game/tembakkimia', cekKey, async (req, res, next) => {
	let ra = await fetchJson('https://raw.githubusercontent.com/AlipBot/data-rest-api/main/tebakkimia.json')
	let ha = ra[Math.floor(Math.random() * ra.length)]
	limitapikey(req.query.apikey)
  res.json({
	status: true,
	creator: `${creator}`,
	result: ha
  })
})

//―――――――――――――――――――――――――――――――――――――――――― ┏ Maker ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

router.get('/api/maker/toanime', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url" })
	var img = await isImageURL(text)
	if (!img) return res.json({ status : false, creator : `${creator}`, message : "[!] cek kembali url image" })
	const toanime = `https://xzn.wtf/api/toanime?url=${text}&apikey=ekuzika`
	var anibuf = await getBuffer(toanime)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(anibuf)
})

router.get('/api/maker/circle', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Alip', message : "[!] cek kembali url image"}) 
	const hasil =  await Canvacord.Canvas.circle(text);
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})


router.get('/api/maker/beautiful', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Alip', message : "[!] cek kembali url image"}) 
	const hasil =  await Canvacord.Canvas.beautiful(text);
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
})


router.get('/api/maker/blur', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Alip', message : "[!] cek kembali url image"}) 
	const hasil =  await Canvacord.Canvas.blur(text)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})


router.get('/api/maker/darkness', cekKey, async (req, res) => {
	var text = req.query.url
	var no = req.query.no
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})
	if (!no ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter no"})

	var img = await isImageURL(text)
	var n = isNumber(no)
	if ( !img ) return res.json({ status : false, creator : 'Alip', message : "[!] cek kembali url image"}) 
	if ( !n ) return res.json({ status : false, creator : 'Alip', message : "[!] parameter no nombor sahaja"}) 

	const hasil =  await Canvacord.Canvas.darkness(text,shortText(no, 3))
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
})

router.get('/api/maker/facepalm', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Alip', message : "[!] cek kembali url image"}) 

	const hasil =  await Canvacord.Canvas.facepalm(text)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})

router.get('/api/maker/invert', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Alip', message : "[!] cek kembali url image"}) 

	const hasil =  await Canvacord.Canvas.invert(text)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})

router.get('/api/maker/pixelate', cekKey, async (req, res) => {
	var text = req.query.url
	var no = req.query.no
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})
	if (!no ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter no"})

	var img = await isImageURL(text)
	var n = isNumber(no)
	if ( !img ) return res.json({ status : false, creator : 'Alip', message : "[!] cek kembali url image"}) 
	if ( !n ) return res.json({ status : false, creator : 'Alip', message : "[!] parameter no nombor sahaja"}) 

	const hasil =  await Canvacord.Canvas.pixelate(text,convertStringToNumber(no))
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})


router.get('/api/maker/rainbow', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Alip', message : "[!] cek kembali url image"}) 

	const hasil =  await Canvacord.Canvas.rainbow(text)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})

router.get('/api/maker/resize', cekKey, async (req, res) => {
	var text = req.query.url
	var width = req.query.width
	var height = req.query.height

	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})
	if (!width ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter width"})
	if (!height ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter height"})

	let w = width
	let h = height
	if (w>1000){ w = "1000"}
	if (h>1000){ h = "1000"}

	var img = await isImageURL(text)
	var wid = isNumber(width)
	var hei = isNumber(height)
	if ( !img ) return res.json({ status : false, creator : 'Alip', message : "[!] cek kembali url image"}) 
	if ( !wid ) return res.json({ status : false, creator : 'Alip', message : "[!] parameter width nombor sahaja"}) 
	if ( !hei ) return res.json({ status : false, creator : 'Alip', message : "[!] parameter height nombor sahaja"}) 

	const hasil =  await Canvacord.Canvas.resize(text, convertStringToNumber(w),  convertStringToNumber(h))
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})

router.get('/api/maker/trigger', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Alip', message : "[!] cek kembali url image"}) 

	const hasil =  await Canvacord.Canvas.trigger(text)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'gif'})
	res.send(hasil)
  
})

router.get('/api/maker/wanted', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Alip', message : "[!] cek kembali url image"}) 

	const hasil =  await Canvacord.Canvas.wanted(text)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})

router.get('/api/maker/wasted', cekKey, async (req, res) => {
	var text = req.query.url
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url"})
	var img = await isImageURL(text)
	if ( !img ) return res.json({ status : false, creator : 'Alip', message : "[!] cek kembali url image"}) 

	const hasil =  await Canvacord.Canvas.wasted(text)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(hasil)
  
})

router.get('/api/maker/attp', cekKey, async (req, res) => {
	var text = req.query.text
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})

const file = "./asset/image/attp.gif"

let length = text.length

var font =90

if (length>12){ font = 68}
if (length>15){ font = 58}
if (length>18){ font = 55}
if (length>19){ font = 50}
if (length>22){ font = 48}
if (length>24){ font = 38}
if (length>27){ font = 35}
if (length>30){ font = 30}
if (length>35){ font = 26}
if (length>39){ font = 25}
if (length>40){ font = 20}
if (length>49){ font = 10}
Canvas.registerFont('./asset/font/SF-Pro.ttf', { family: 'SF-Pro' })
await canvasGif(
	file,(ctx) => {
var couler = ["#ff0000","#ffe100","#33ff00","#00ffcc","#0033ff","#9500ff","#ff00ff"]
let jadi = couler[Math.floor(Math.random() * couler.length)]

		function drawStroked(text, x, y) {
			ctx.lineWidth = 5
			ctx.font = `${font}px SF-Pro`
			ctx.fillStyle = jadi
			ctx.strokeStyle = 'black'
			ctx.textAlign = 'center'
			ctx.strokeText(text, x, y)
			ctx.fillText(text, x, y)
		}
		
		drawStroked(text,290,300)

	},
	{
		coalesce: false, // whether the gif should be coalesced first (requires graphicsmagick), default: false
		delay: 0, // the delay between each frame in ms, default: 0
		repeat: 0, // how many times the GIF should repeat, default: 0 (runs forever)
		algorithm: 'octree', // the algorithm the encoder should use, default: 'neuquant',
		optimiser: false, // whether the encoder should use the in-built optimiser, default: false,
		fps: 7, // the amount of frames to render per second, default: 60
		quality: 100, // the quality of the gif, a value between 1 and 100, default: 100
	}
).then((buffer) =>{
limitapikey(req.query.apikey)
res.set({'Content-Type': 'gif'})
res.send(buffer)

})
  

router.get('/api/maker/ttp', cekKey, async (req, res) => {
	var text = req.query.text
	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})

	Canvas.registerFont('./asset/font/SF-Pro.ttf', { family: 'SF-Pro' })
	let length = text.length
		
	var font = 90
	if (length>12){ font = 68}
	if (length>15){ font = 58}
	if (length>18){ font = 55}
	if (length>19){ font = 50}
	if (length>22){ font = 48}
	if (length>24){ font = 38}
	if (length>27){ font = 35}
	if (length>30){ font = 30}
	if (length>35){ font = 26}
	if (length>39){ font = 25}
	if (length>40){ font = 20}
	if (length>49){ font = 10}

	var ttp = {}
	ttp.create = Canvas.createCanvas(576, 576)
	ttp.context = ttp.create.getContext('2d')
	ttp.context.font =`${font}px SF-Pro`
	ttp.context.strokeStyle = 'black'
	ttp.context.lineWidth = 3
	ttp.context.textAlign = 'center'
	ttp.context.strokeText(text, 290,300)
	ttp.context.fillStyle = 'white'
	ttp.context.fillText(text, 290,300)
	limitapikey(req.query.apikey)
		res.set({'Content-Type': 'image/png'})
		res.send(ttp.create.toBuffer())
  
})
})

router.get('/api/maker/emojimix', cekKey, async (req, res, next) => {
	var emoji1 = req.query.emoji1
	var emoji2 = req.query.emoji2
	if (!emoji1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter emoji1"})
	if (!emoji2 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter emoji2"})  
	
	let data = await fetchJson(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`)
	let jadi = data.results[Math.floor(Math.random() * data.results.length)]
	if (!jadi ) return res.json(loghandler.notfound)
	for (let ress of data.results) {
	resul = await getBuffer(ress.url)
	limitapikey(req.query.apikey)
	res.set({'Content-Type': 'image/png'})
	res.send(resul)
}
})

router.get('/api/maker/welcome1', cekKey, async (req, res, next) => {
	var name = req.query.name
    var grup = req.query.gpname
    var member = req.query.member
	var pp = req.query.pp
    var bg = req.query.bg
	
	var imgpp = await isImageURL(pp)
	var bgimg = await isImageURL(bg)

    if (!name ) return res.json({ status : false, creator : 'Alip', message : "[!] masukan parameter name"})  
	if (!grup ) return res.json({ status : false, creator : 'Alip', message : "[!] masukan parameter gpname"})  
    if (!member ) return res.json({ status : false, creator : 'Alip', message : "[!] masukan parameter member"})  
	if (!pp ) return res.json({ status : false, creator : 'Alip', message : "[!] masukan parameter pp"})  
    if (!bg ) return res.json({ status : false, creator : 'Alip', message : "[!] masukan parameter bg"})  

	if ( !imgpp ) return res.json({ status : false, creator : 'Alip', message : "[!] cek kembali url image pp"}) 
	if ( !bgimg ) return res.json({ status : false, creator : 'Alip', message : "[!] cek kembali url image bg"}) 
   
    Canvas.registerFont('./asset/font/Creme.ttf', { family: 'creme' })

var welcomeCanvas = {}
welcomeCanvas.create = Canvas.createCanvas(1024, 500)
welcomeCanvas.context = welcomeCanvas.create.getContext('2d')
welcomeCanvas.context.font = '72px creme'
welcomeCanvas.context.fillStyle = '#ffffff'

await Canvas.loadImage("./asset/image/wbg1.jpg").then(async (img) => {
    welcomeCanvas.context.drawImage(img, 0, 0, 1024, 500)

})

let can = welcomeCanvas

await Canvas.loadImage(bg)
.then(bg => {
can.context.drawImage(bg, 320, 0, 709, 360)
})

    let canvas = welcomeCanvas
    canvas.context.beginPath()
    canvas.context.arc(174, 279, 115, 0, Math.PI * 2, true)
    canvas.context.stroke()
    canvas.context.fill()
    canvas.context.font = '100px creme',
    canvas.context.textAlign = 'center'
    canvas.context.fillText("Welcome", 670, 140)
    canvas.context.font = '100px Helvetica'
    canvas.context.fillText("____   ____", 670, 160)
    canvas.context.fillText("✩", 670, 215)
    canvas.context.font = '100px creme'
    canvas.context.fillText(shortText(grup, 17), 670, 300)
    canvas.context.font = '40px creme'
    canvas.context.textAlign = 'start'
    canvas.context.fillText(shortText(name, 40), 420, 420)
    canvas.context.font = '35px creme'
    canvas.context.fillText(`${shortText(member, 10)} th member`, 430, 490)
    canvas.context.beginPath()
    canvas.context.arc(174, 279, 110, 0, Math.PI * 2, true)
    canvas.context.closePath()
    canvas.context.clip()
    await Canvas.loadImage(pp)
    .then(pp => {
        canvas.context.drawImage(pp, 1, 150, 300, 300)
    })
    
	limitapikey(req.query.apikey)
    res.set({'Content-Type': 'image/png'})
    res.send(canvas.create.toBuffer())
})


router.get('/api/maker/goodbye1', cekKey, async (req, res, next) => {
	var name = req.query.name
    var grup = req.query.gpname
	var pp = req.query.pp
    var member = req.query.member
    var bg = req.query.bg

	var imgpp = await isImageURL(pp)
	var bgimg = await isImageURL(bg)

    if (!name ) return res.json({ status : false, creator : 'Alip', message : "[!] masukan parameter name"})  
	if (!grup ) return res.json({ status : false, creator : 'Alip', message : "[!] masukan parameter gpname"})  
    if (!member ) return res.json({ status : false, creator : 'Alip', message : "[!] masukan parameter member"})  
    if (!bg ) return res.json({ status : false, creator : 'Alip', message : "[!] masukan parameter bg"})  
	if (!pp) return res.json({ status : false, creator : 'Alip', message : "[!] masukan parameter pp"}) 
   
	if ( !imgpp ) return res.json({ status : false, creator : 'Alip', message : "[!] masukan parameter pp Link pp dengan betul"}) 
	if ( !bgimg ) return res.json({ status : false, creator : 'Alip', message : "[!] masukan parameter pp Link bg dengan betul"}) 

    Canvas.registerFont('./asset/font/Creme.ttf', { family: 'creme' })

var goobyeCanvas = {}
goobyeCanvas.create = Canvas.createCanvas(1024, 500)
goobyeCanvas.context =  goobyeCanvas.create.getContext('2d')
goobyeCanvas.context.font = '72px creme'
goobyeCanvas.context.fillStyle = '#ffffff'

await Canvas.loadImage("./asset/image/wbg1.jpg").then(async (img) => {
	goobyeCanvas.context.drawImage(img, 0, 0, 1024, 500)

})

let can =  goobyeCanvas

await Canvas.loadImage(bg)
.then(bg => {
can.context.drawImage(bg, 320, 0, 709, 360)
})

    let canvas = goobyeCanvas
    canvas.context.beginPath()
    canvas.context.arc(174, 279, 115, 0, Math.PI * 2, true)
    canvas.context.stroke()
    canvas.context.fill()
    canvas.context.font = '100px creme',
    canvas.context.textAlign = 'center'
    canvas.context.fillText("GoodBye", 670, 140)
    canvas.context.font = '100px Helvetica'
    canvas.context.fillText("____   ____", 670, 160)
    canvas.context.fillText("✩", 670, 215)
    canvas.context.font = '100px creme'
    canvas.context.fillText(shortText(grup, 17), 670, 300)
    canvas.context.font = '40px creme'
    canvas.context.textAlign = 'start'
    canvas.context.fillText(shortText(name, 40), 420, 420)
    canvas.context.font = '35px creme'
    canvas.context.fillText(`${shortText(member, 10)} th member`, 430, 490)
    canvas.context.beginPath()
    canvas.context.arc(174, 279, 110, 0, Math.PI * 2, true)
    canvas.context.closePath()
    canvas.context.clip()
    await Canvas.loadImage(pp)
    .then(pp => {
        canvas.context.drawImage(pp, 1, 150, 300, 300)
    })
    
	limitapikey(req.query.apikey)
    res.set({'Content-Type': 'image/png'})
    res.send(canvas.create.toBuffer())
})

//―――――――――――――――――――――――――――――――――――――――――― ┏  Link Short  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

router.get('/api/linkshort/tinyurl', cekKey, async (req, res, next) => {
	var link = req.query.link
	if (!link ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter link"})  

    var islink = isUrl(link)
	if (!islink ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url sahaja"})  


TinyURL.shorten(link, function(link, err) {
  if (err) return res.json(loghandler.error)
  	limitapikey(req.query.apikey)
	res.json({
		status: true,
		creator: `${creator}`,
		result: link
		})
});
	
})

router.get('/api/linkshort/tinyurlwithalias', cekKey, async (req, res, next) => {
	var link = req.query.link
	var alias = req.query.alias
	if (!link ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter link"})  
	if (!alias ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter alias"})  

    var islink = isUrl(link)
	if (!islink ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url sahaja"})  

	const data = { 'url': link, 'alias': shortText(alias, 30) }

	TinyURL.shortenWithAlias(data).then(function(link)  {	
		if (link == "Error") return res.json(loghandler.redy)
		limitapikey(req.query.apikey)
	res.json({
		status: true,
		creator: `${creator}`,
		result: link
		})
})
})
	
router.get('/api/linkshort/cuttly', cekKey, async (req, res, next) => {
	var link = req.query.link
	if (!link ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter link"})  
    var islink = isUrl(link)
	if (!islink ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url sahaja"})  

	let randomapicuttly = apicuttly[Math.floor(Math.random() * apicuttly.length)]
	var hasil = await fetchJson(`https://cutt.ly/api/api.php?key=${randomapicuttly}&short=${link}`)
    if (!hasil.url ) return res.json(loghandler.noturl)
	limitapikey(req.query.apikey)
	res.json({
		status: true,
		creator: `${creator}`,
		result: hasil.url
		})
});


router.get('/api/linkshort/bitly', cekKey, async (req, res, next) => {
	var link = req.query.link
	if (!link ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter link"})  

	var islink = isUrl(link)
	if (!islink ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url sahaja"})  

	let randomapibitly = apibitly[Math.floor(Math.random() * apibitly.length)]
	const bitly = new BitlyClient(randomapibitly)
	bitly
	.shorten(link)
	.then(function(result) {
		limitapikey(req.query.apikey)
		res.json({
			status: true,
			creator: `${creator}`,
			result : result.link
			})
	 
	})
	.catch(function(error) {
	 res.json(loghandler.error)
	});
})

//―――――――――――――――――――――――――――――――――――――――――― ┏  Infomation  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\


router.get('/api/info/githubstalk', cekKey, async (req, res, next) => {
	var user = req.query.user
	if (!user ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter user"})  
	let gitstalk = await fetchJson(`https://api.github.com/users/${user}`)
	if (!gitstalk.login ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)

	res.json({
	status: true,
	creator: `${creator}`,
	result: gitstalk
	})

})

router.get('/api/info/waktuksolatmy', cekKey, async (req, res, next) => {
	alip.watuksolatmy()
	.then(data => {
		if (!data.Tarikh ) return res.json(loghandler.error)
		limitapikey(req.query.apikey)
		res.json({
			status: true,
	        creator: `${creator}`,
			result: data
		})
		}).catch(e => {
			 res.json(loghandler.error)
})
})


router.get('/api/info/translate', cekKey, async (req, res, next) => {
	var text = req.query.text
    var lang = req.query.lang

	if (!text ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})  
	if (!lang ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter lang.  boleh lihat list bahasa di https://cloud.google.com/translate/docs/languages"})  

	translate(text, {to: lang}).then(data => {
		limitapikey(req.query.apikey)
		res.json({
			status: true,
			creator: `${creator}`,
			result: data
		})
	}).catch(err => {
		res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter lang Dengan Betul.  boleh lihat list bahasa di https://cloud.google.com/translate/docs/languages"})
	})
        
})

router.get('/api/info/emoji', cekKey, async (req, res, next) => {
	var emoji1 = req.query.emoji
	if (!emoji1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter emoji"})
      var hasil = emoji.get(emoji1)
       if (hasil == null) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter emoji dengan 1 emoji sahaja"})
           limitapikey(req.query.apikey)
           res.json({
			status: true,
	        creator: `${creator}`,
			result: hasil
		})
})


//―――――――――――――――――――――――――――――――――――――――――― ┏  Tools ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

router.get('/api/tools/ebase64', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})  
	if (text1.length > 2048) return res.json({ status : false, creator : `${creator}`, message : "[!] Maximal 2.048 String!"})
	limitapikey(req.query.apikey)

		res.json({
			status: true,
			creator: `${creator}`,
			result: Buffer.from(text1).toString('base64')
		})

})

router.get('/api/tools/debase64', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})  
	if (text1.length > 2048) return res.json({ status : false, creator : `${creator}`, message : "[!] Maximal 2.048 String!"})
	limitapikey(req.query.apikey)

		res.json({
			status: true,
			creator: `${creator}`,
			result: Buffer.from(text1, 'base64').toString('ascii')
		})

})

router.get('/api/tools/ebinary', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})  
	if (text1.length > 2048) return res.json({ status : false, creator : `${creator}`, message : "[!] Maximal 2.048 String!"})

	function encodeBinary(char) {
		return char.split("").map(str => {
			 const converted = str.charCodeAt(0).toString(2);
			 return converted.padStart(8, "0");
		}).join(" ")
	 }
	 limitapikey(req.query.apikey)

		res.json({
			status: true,
			creator: `${creator}`,
			result: encodeBinary(text1)
		})
})

router.get('/api/tools/debinary', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})  
	if (text1.length > 2048) return res.json({ status : false, creator : `${creator}`, message : "[!] Maximal 2.048 String!"})

	function decodeBinary(char) {
		return char.split(" ").map(str => String.fromCharCode(Number.parseInt(str, 2))).join("");
	 }
	 limitapikey(req.query.apikey)

		res.json({
			status: true,
			creator: `${creator}`,
			result: decodeBinary(text1)
		})

})

router.get('/api/tools/ssweb', cekKey, async (req, res, next) => {
	var link = req.query.link
	if (!link ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter link"})  

	var islink = isUrl(link)
	if (!islink ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter url sahaja"})  


	alip.ssweb(link).then((data) =>{ 
		limitapikey(req.query.apikey)
		if (!data ) return res.json(loghandler.notfound)
		res.set({'Content-Type': 'image/png'})
		res.send(data)
	}).catch((err) =>{
	 res.json(loghandler.notfound)
	
	})

})

router.get('/api/tools/styletext', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text "}) 
	var text = shortText(text1, 10000)  
	alip.styletext(text)
.then((data) =>{ 
	if (!data ) return res.json(loghandler.error)
	limitapikey(req.query.apikey)

  res.json({
	status: true,
	creator: `${creator}`,
	result: data
})
})
.catch((err) =>{
 res.json(loghandler.error)

})
})

//―――――――――――――――――――――――――――――――――――――――――― ┏  Islamic  ┓ ―――――――――――――――――――――――――――――――――――――――――― \\


router.get('/api/islamic/surah', cekKey, async (req, res, next) => {
	var text1 = req.query.no
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter no"})  
	alip.surah(text1).then((data) =>{ 
	if (!data ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)
		res.json({
			status: true,
			creator: `${creator}`,
			result: data
		})
}).catch((err) =>{
 res.json(loghandler.error)

})
})


router.get('/api/islamic/tafsirsurah', cekKey, async (req, res, next) => {
	var text1 = req.query.text
	if (!text1 ) return res.json({ status : false, creator : `${creator}`, message : "[!] masukan parameter text"})  
	alip.tafsirsurah(text1).then((data) =>{ 
	if (!data[0] ) return res.json(loghandler.notfound)
	limitapikey(req.query.apikey)
		res.json({
			status: true,
			creator: `${creator}`,
			result: data
		})
}).catch((err) =>{
 res.json(loghandler.error)

})
})

module.exports = router
