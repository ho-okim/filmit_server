const model = require("../models"),
User = model.User,
Post = model.Post;
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res, next) => {
    try{
        data = await User.findAll();
        console.log(data);
        res.render("user", {users: data})
    } catch(err) {
        res.status(500).send({
            message: err.message
        });
    }
    next();
};

//main.js에서 URL로 넘어오는 :id 통해서 현재 유저 찾는 메서드
exports.findUser = async (req, res, next) => {
    const userId = req.params.id;
    console.log(`${userId}`);
    try{
        let user = await User.findOne({
            where: {userIdentifier : userId}
        });
        res.locals.user = user;
        
    } catch(err){
        console.log(`Error finding user by :id: ${err.message}`);
    }
    next();
};

exports.showSignup = (req, res) => {
    res.render("signup");
};

exports.postedSignup = async (req, res) => {
    let hash = await bcrypt.hash(req.body.passwd, 12);

    //아이디 중복 확인
    await model.User.findOne({ where: {email:req.body.email}})
    .then(async function(data)
    {
        if((data == null || data == undefined) === false){
            res.json({result:false, message:'이미 가입된 이메일입니다.'})
        }
        //데이터 삽입
        await User.create({
	        userIdentifier : req.body.userIdentifier,
        	email : req.body.email,
	        passwd : hash,
        	name : req.body.name,
        	nickname : req.body.nickname,
        	birth : req.body.birth,
        	gender : req.body.gender
        })
        .then(function(createdUserCore){
            res.redirect('/login');
        });
    });
};

//유저 정보 수정
exports.editUser = async (req, res, next) => {
    try {
        let user = await User.update({
        nickname : req.body.nickname,
        userIdentifier : req.body.userIdentifier,
        profileIcon : req.file.path
        },{ where: {id : req.user.id}});

        res.locals.user = user;
        console.log("출력 안 되면 locals가 전달 안 되는 거임");
        res.redirect(`/profile/${req.body.userIdentifier}`);
    } catch(err) {
        console.log(`Error updating user by ID: ${err.message}`);
    }
};